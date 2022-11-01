import axios, { AxiosInstance } from "axios";
import https = require('https');

let instance: AxiosInstance;

const getAxiosInstance = () => {
    if (!instance) {
        instance = axios.create({
            timeout: 10000,
            httpsAgent: new https.Agent({ keepAlive: true })
        })
    }

    return instance;
}

export default getAxiosInstance;