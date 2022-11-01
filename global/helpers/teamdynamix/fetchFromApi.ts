import { AxiosRequestConfig, AxiosResponse } from 'axios';
import DataOrError from '../../types/DataOrError';
import { CacheKey } from '../../classes/teamdynamix/RequestCache';
import getErrorMessage from '../../utils/getErrorMessage';
import getAuthToken from './getAuthToken';
import getRequestCache from './getRequestCache';
import getAxiosInstance from '../axios/getAxiosInstance';

const fetchFromApi = async <T>(cacheKey: CacheKey, requestConfig: AxiosRequestConfig): Promise<DataOrError<T>> => {
    const axios = getAxiosInstance();
    const requestCache = getRequestCache();

    // Check to see if the API endpoint can be called without receiving an HTTP 429 (Too Many Requests) response
    const requestLimit = requestCache.getRequestLimit(cacheKey);
    if (requestLimit.isLimitReached) await requestLimit.waitForReset();

    // Get auth token
    const authToken = await getAuthToken();
    if (!authToken.ok) return { ok: false, error: authToken.error };

    // Format request
    const config = {
        ...requestConfig,
        headers: {
            authorization: 'Bearer ' + authToken.data
        }
    };

    // Send request
    let response: AxiosResponse<T>;
    try {
        response = await axios(config);
    } catch (error: any) {
        return { ok: false, error: getErrorMessage(error) };
    }

    // Update the cache with the requests remaining
    const updateStatus = requestCache.updateRequestLimit(cacheKey, response.headers);
    if (!updateStatus.ok) return { ok: false, error: updateStatus.error };

    return { ok: true, data: response.data };
};

export default fetchFromApi;
