import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultSecret, SecretClient, SecretProperties } from '@azure/keyvault-secrets';
import DataOrError from "../../../types/DataOrError";
import getErrorMessage from "../../../utils/getErrorMessage";

const setVaultSecret = async(secretName: string, secretValue: string, secretOptions?: Partial<SecretProperties>): Promise<DataOrError<KeyVaultSecret>> => {
    // Get credentials to use Azure API
    const credential = new DefaultAzureCredential();

    // Create a client to interact with the Azure Key Vault secrets
    const client = new SecretClient(process.env.AZ_VAULT_URL!, credential);

    // Upload or update the secret to the key vault
    let secret: KeyVaultSecret;
    try {
        secret = await client.setSecret(secretName, secretValue, secretOptions);
    }
    catch (err: any) {
        return { ok: false, error: `An error occured while setting the '${secretName}' secret in Azure: ` + getErrorMessage(err)}
    }

    return { ok: true, data: secret }
};

export default setVaultSecret;