import * as oauth from 'oauth4webapi'

const NOSTR_RELAY_URL = "wss://nos.lol";
const NOSTR_ID_NPUB = "npub1scmpzl2ehnrtnhu289d9rfrwprau9z6ka0pmuhz6czj2ae5rpuhs2l4j9d";
const clientId = `${NOSTR_ID_NPUB} ${NOSTR_RELAY_URL}`;

const getEndpoints = async (uma: string) => {
    const umaDomain = uma.split("@")[1];
    const endpoints = await fetch(`https://${umaDomain}/.well-known/uma-configuration`);
    return endpoints.json();
}

export const getAuthorizationUrl = async (uma: string) => {
    const { authorization_endpoint, token_endpoint } = await getEndpoints(uma);

    const codeVerifier = oauth.generateRandomCodeVerifier();
    const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
    const csrfState = oauth.generateRandomState();

    const authUrl = new URL(authorization_endpoint);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", "http://localhost:8100/auth");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", csrfState);
    authUrl.searchParams.set("required_commands", "pay_invoice get_balance make_invoice");
    authUrl.searchParams.set("optional_commands", "");
    authUrl.searchParams.set("budget", "");

    return {
        authorization_endpoint,
        token_endpoint,
        codeVerifier,
        authUrl,
        csrfState,
    };
};


export const getNWCConnection = async (code: string, authorization_endpoint: string, token_endpoint: string, csrf_state: string, code_verifier: string) => {
    const as: oauth.AuthorizationServer = {
        issuer: new URL(authorization_endpoint).origin,
        authorization_endpoint,
        token_endpoint,
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["none"],
    };
    const params = oauth.validateAuthResponse(
        as,
        {
            "client_id": clientId,
        },
        new URLSearchParams({
            "code": code,
            "state": csrf_state,
        }),
        csrf_state
    );

    const response = await oauth.authorizationCodeGrantRequest(
        as,
        {
            "client_id": clientId,
            "token_endpoint_auth_method": "none",
        },
        oauth.None(),
        params,
        "http://localhost:8100/auth",
        code_verifier,
    );

    const result = await oauth.processAuthorizationCodeResponse(
        as,
        {
            "client_id": clientId,
            "token_endpoint_auth_method": "none",
        },
        response,
    );

    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, '', url);

    return result;
}
