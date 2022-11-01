import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import DataOrError from '../../types/DataOrError';
import getErrorMessage from '../../utils/getErrorMessage';

const uploadBlob = async (containerName: string, fileName: string, fileContent: string): Promise<DataOrError> => {
    const creds = new DefaultAzureCredential();
    const blobServiceClient = new BlobServiceClient(process.env.AZ_BLOB_URL!, creds);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Upload content to the container
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    try {
        await blockBlobClient.upload(fileContent, fileContent.length);
    } catch (err) {
        return { ok: false,error: 'An error occured while uploading the blob: ' + getErrorMessage(err) };
    }

    // Return operation was successful
    return {
        ok: true,
        data: null
    };
};

export default uploadBlob;
