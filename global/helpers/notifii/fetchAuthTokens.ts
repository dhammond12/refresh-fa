import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import DataOrError from "../../types/DataOrError";
import AuthTokens from "../../types/notifii/AuthTokens";
import getErrorMessage from "../../utils/getErrorMessage";
import getVaultSecret from "../azure/vault/getVaultSecret";

const fetchAuthTokens = async (): Promise<DataOrError<AuthTokens>> => {
    // Get Notfii username and password from the Azure Key Vault
    const [ usernameResult, passwordResult ] = await Promise.all([
        getVaultSecret(process.env.AZ_VAULT_SECRET_NOTIFII_USERNAME_NAME!),
        getVaultSecret(process.env.AZ_VAULT_SECRET_NOTIFII_PASSWORD_NAME!)
    ]);
    if (!usernameResult.ok) return { ok: false, error: usernameResult.error};
    if (!usernameResult.data.value) return { ok: false, error: 'Returned Notifii username secret from Azure Vault is blank.'};
    if (!passwordResult.ok) return { ok: false, error: passwordResult.error};
    if (!passwordResult.data.value) return { ok: false, error: 'Returned Notifii password secret from Azure Vault is blank.'};

    // Format auth request to Notifii
    const postData = new URLSearchParams();
        postData.append('username', usernameResult.data.value);
        postData.append('password', passwordResult.data.value);
        postData.append('keep_me_logged_in', '2');
        postData.append('user_ip', '');
        postData.append('web_notification_id', '');
        postData.append('submit', 'yes');

    const config: AxiosRequestConfig = {
        url: `${process.env.NOTIFII_URL}/login.php`,
        method: 'post',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: postData,
        maxRedirects: 0,
        validateStatus: (status) => status === 302
    }

    // Send auth request to Notifii
    let response: AxiosResponse;
    try {
        response = await axios(config);
    }
    catch (err: any) {
        return {ok: false, error: 'Authentication to Notifii failed: ' + getErrorMessage(err)}
    }

    // Get cookies from auth response
    const cookies: string[] | undefined = response.headers['set-cookie'];
    if (!cookies) return { ok: false, error: 'Notifii cookies are not present in the response header.'};

    // Parse auth tokens from cookies
    let sessionId: string = '';
    let sessionToken: string = '';
    for (const cookie of cookies) {
        const cookieAttributes = cookie.split(';');
        const cookieAssignment = cookieAttributes[0];
        const cookieAssignmentSplit = cookieAssignment.split('=');
        const cookieName = cookieAssignmentSplit[0];
        const cookieValue = cookieAssignmentSplit[1];

        if (cookieName === 'ses_session_id') {
            sessionId = cookieValue;
        }
        if (cookieName === 'ses_token') {
            sessionToken = cookieValue;
        }
    }

    // No auth tokens present
    if (!sessionId || !sessionToken) {
        return {
            ok: false,
            error: 'Notifii auth tokens are not present in the response header.'
        }
    }

    return {
        ok: true,
        data: {
            sessionId,
            sessionToken
        }
    }
}

export default fetchAuthTokens;