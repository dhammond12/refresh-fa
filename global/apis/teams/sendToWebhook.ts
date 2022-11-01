import axios, { AxiosRequestConfig } from 'axios';
import DataOrError from '../../types/DataOrError';
import getErrorMessage from '../../utils/getErrorMessage';

/**
 * Sends a message to the Incoming Webhook set up in the refresh team on Teams.
 * @param message 
 */
const sendToWebhook = async (message: string): Promise<DataOrError> => {
    // Format request
    const config: AxiosRequestConfig = {
        url: process.env.TEAMS_WEBHOOK_URL,
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: {text: message}
    }

    // Send request
    try {
        await axios(config);
    } catch (err: any) {
        return { ok: false, error: getErrorMessage(err) };
    }

    // Return that the request was successful
    return {
        ok: true,
        data: null
    };
};

export default sendToWebhook;
