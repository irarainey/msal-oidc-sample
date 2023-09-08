import { ProtocolMode } from "@azure/msal-node";
import { SimpleAuthProvider } from "./lib/auth.js";
import { exit } from "process";

const clientId = "SzKCqwbxjODMxS5ILa0UaoyhuZIk3hGO";
const scopes = ["Cookies.Bake"];
const authority = "bertscookies.eu.auth0.com";
const protocolMode = ProtocolMode.OIDC;
const loopbackPort = 3000;

const authProvider = new SimpleAuthProvider(clientId, authority, scopes, protocolMode, loopbackPort);

console.log("### authProvider initialized");

const authResponse = await authProvider.getAccessToken();

console.log("### authResponse:", authResponse);

exit(0);