import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { KeyVaultSecret } from '@azure/keyvault-secrets';
import DataOrError from '../../types/DataOrError';
import getErrorMessage from '../../utils/getErrorMessage';
import getVaultSecret from '../azure/vault/getVaultSecret';
import setVaultSecret from '../azure/vault/setVaultSecret';
import AuthRequest from '../../types/teamdynamix/AuthRequest';

let token = {
    value: '',
    expiresOn: new Date(0)
};

const getAuthToken = async (): Promise<DataOrError<string>> => {
    // If token is not cached in memory, fetch from Azure Vault
    if (!token.value) {
        const tokenSecret = await fetchTokenSecret();
        if (!tokenSecret.ok) return { ok: false, error: tokenSecret.error };
        
        token.value = tokenSecret.data.value!;
        token.expiresOn = tokenSecret.data.properties.expiresOn!;
    }

    // Check if token expires in the next five minutes
    if (token.expiresOn.getTime() < (Date.now() + 300000)) {
        const refreshedTokenResult = await refreshAuthToken();
        if (!refreshedTokenResult.ok) return { ok: false, error: refreshedTokenResult.error }

        return {
            ok: true,
            data: refreshedTokenResult.data
        }
    }

    return {
        ok: true,
        data: token.value
    };
};

/* ---------------------------- Helper functions ---------------------------- */

const fetchTokenSecret = async (): Promise<DataOrError<KeyVaultSecret>> => {
    // Get the token secret stored in Azure Vault
    const tokenSecretResult = await getVaultSecret(process.env.AZ_VAULT_SECRET_TDX_API_TOKEN_NAME!);
    if (!tokenSecretResult.ok) return { ok: false, error: tokenSecretResult.error }

    // Validate returned secret
    const tokenSecret = tokenSecretResult.data;
    if (!tokenSecret.value) return { ok: false, error: 'Value from returned TDX API token is blank in Key Vault.'}
    if (!tokenSecret.properties.expiresOn) return { ok: false, error: 'Expiration date from returned TDX API token is blank in Key Vault.'}

    // Return secret
    return {
        ok: true,
        data: tokenSecret
    }
};

const refreshAuthToken = async (): Promise<DataOrError<string>> => {
    // Fetch API auth credentials from Azure Vault
    const [ usernameSecretResult, passwordSecretResult ] = await Promise.all([
        getVaultSecret(process.env.AZ_VAULT_SECRET_TDX_API_USERNAME_NAME!),
        getVaultSecret(process.env.AZ_VAULT_SECRET_TDX_API_PASSWORD_NAME!)
    ]);

    // Validate secret
    if (!usernameSecretResult.ok) return { ok: false, error: usernameSecretResult.error };
    if (!usernameSecretResult.data.value) return {ok: false, error: 'TDX username in key vault is blank.'}
    if (!passwordSecretResult.ok) return { ok: false, error: passwordSecretResult.error };
    if (!passwordSecretResult.data.value) return {ok: false, error: 'TDX password in key vault is blank.'};

    // Format request to refresh token
    let config: AxiosRequestConfig<AuthRequest> = {
        url: `${process.env.TDX_API_URL}/auth`,
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: {
            username: usernameSecretResult.data.value,
            password: passwordSecretResult.data.value
        }
    };

    // Send request to refresh token
    let authResponse: AxiosResponse<string>;
    try {
        authResponse = await axios(config);
    }
    catch (err: any) {
        return {ok: false, error: 'An error occured while fetching a new token from TDX: ' + getErrorMessage(err)}
    }

    // Save new token to the Vault with an expiration of 24 hours later
    const twentyFourHoursLater = new Date(Date.now() + (86400000));
    const saveTokenReponse = await setVaultSecret(process.env.AZ_VAULT_SECRET_TDX_API_TOKEN_NAME!, authResponse.data, {
        expiresOn: twentyFourHoursLater
    });
    if (!saveTokenReponse.ok) return { ok: false, error: saveTokenReponse.error }

    return {
        ok: true,
        data: authResponse.data
    }
}

export default getAuthToken;
