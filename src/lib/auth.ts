import fs from 'fs';
import { AuthenticationResult, InteractiveRequest, ProtocolMode, PublicClientApplication } from "@azure/msal-node";
import { CustomLoopbackClient } from "./custom-loopback-client.js"
import { openBrowser } from "./utils.js";
import { SimpleAuthProviderInterface } from "./simple-auth-provider-interface.js";

export class SimpleAuthProvider implements SimpleAuthProviderInterface {
    private msalApp: PublicClientApplication;
    private loopbackClient: CustomLoopbackClient | undefined;
    private tokenRequest: InteractiveRequest;
    private scopes: string[] = [];
    private _authResponse!: AuthenticationResult;

    constructor(clientId: string, authority: string, scopes: string[], protocolMode: ProtocolMode = ProtocolMode.AAD, loopbackPort: number = 0) {

        this.msalApp = new PublicClientApplication({
            auth: {
                clientId,
                authority: `https://${authority}`,
                knownAuthorities: [authority],
                protocolMode
            },
        });

        if (loopbackPort !== 0) {
            this.loopbackClient = new CustomLoopbackClient(loopbackPort);
        }

        this.scopes = scopes;

        this.tokenRequest = {
            scopes,
            openBrowser,
            loopbackClient: this.loopbackClient,
            successTemplate: fs.readFileSync('./dist/landing-pages/success.html', 'utf-8'),
            errorTemplate: fs.readFileSync('./dist/landing-pages/error.html', 'utf-8'),
        };

        console.log("### SimpleMSALAuthProvider initialized with client:", clientId);
    }

    // This method is called before every request to the Graph API via the middleware
    async getAccessToken() {
        console.log("### getAccessToken...");

        try {
            // Try to get token silently first, will be fetched from cache if possible
            this._authResponse = await this.msalApp.acquireTokenSilent({
                scopes: this.scopes,
                account: this.msalApp.getAllAccounts()[0],
            });
        } catch (error) {
            // We could check the error type, but it's easier to just prompt the user to sign in
            console.log("### Failed to get token, prompting user to sign in");
            try {
                this._authResponse = await this.msalApp.acquireTokenInteractive(this.tokenRequest);
            } catch (error) {
                throw error;
            }
        }

        if (this._authResponse.fromCache) {
            console.log("###   Returned cached token");
        } else {
            console.log("###   Returned token from authorization server");
        }

        return this._authResponse.accessToken;
    }

    get authResponse() {
        if (!this._authResponse) {
            throw new Error("No cached access token");
        }

        return this._authResponse;
    }
}
