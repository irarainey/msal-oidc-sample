export interface SimpleAuthProviderInterface {
    getAccessToken(): Promise<string>;
}