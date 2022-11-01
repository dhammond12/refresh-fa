import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultSecret, SecretClient } from '@azure/keyvault-secrets';
import DataOrError from "../../../types/DataOrError";
import getErrorMessage from "../../../utils/getErrorMessage";

const getVaultSecret = async(secretName: string): Promise<DataOrError<KeyVaultSecret>> => {
    // Get credentials to use Azure API
    const credential = new DefaultAzureCredential();

    // Create a client to interact with the Azure Key Vault secrets
    const client = new SecretClient(process.env.AZ_VAULT_URL!, credential);

    // Fetch the secret from the key vault
    let secret: KeyVaultSecret;
    try {
        secret = await client.getSecret(secretName);
    }
    catch (err: any) {
        return { ok: false, error: `An error occured while fetching the '${secretName}' secret from Azure: ` + getErrorMessage(err)}
    }

    return { ok: true, data: secret }
};

export default getVaultSecret;