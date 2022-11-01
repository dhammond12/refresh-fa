import { AxiosResponseHeaders } from 'axios';
import DataOrError from '../../types/DataOrError';

/* ---------------------------------- Types --------------------------------- */

export type CacheKey = 'FETCH_ASSET' | 'UPDATE_ASSET' | 'SEARCH_ASSETS' | 'FETCH_LOCATION' | 'FETCH_LOCATIONS';

interface CacheItem {
    requestsRemaining: number;
    resetTimeInMs: number;
}

type RequestLimitInquiry =
    | {
          isLimitReached: false;
      }
    | {
          isLimitReached: true;
          waitForReset: () => Promise<void>;
      };

/* ---------------------------------- Main ---------------------------------- */

/**
 * This is a cache of all requests in TeamDynamix, which will store how many requests
 * are remaining for each API request and when the limit resets. Each API endpoint is
 * assigned a key such as 'FETCH_ASSET', 'UPDATE_ASSET'. This is checked before every
 * request to make sure an HTTP 429 error is not sent back from TDX.
 */
class RequestCache {
    cache: Map<CacheKey, CacheItem>;

    constructor() {
        this.cache = new Map<CacheKey, CacheItem>();
    }

    getRequestLimit(cacheKey: CacheKey): RequestLimitInquiry {
        const cacheItem = this.cache.get(cacheKey);

        // If cache does not contain an entry for that key, the API has not been called yet and has no limit yet
        if (!cacheItem) return { isLimitReached: false };

        // If entry exists for that key and there are more requests remaining
        if (cacheItem.requestsRemaining > 0) return { isLimitReached: false };

        // If zero requests remain, check if the reset time has already passed
        if (Date.now() > cacheItem.resetTimeInMs) return { isLimitReached: false };

        // Otherwise return a function that pauses until the reset time passes
        const waitTimeInMs = cacheItem.resetTimeInMs - Date.now();

        return {
            isLimitReached: true,
            waitForReset: async () => new Promise((resolve) => setTimeout(resolve, waitTimeInMs))
        };
    }

    updateRequestLimit(cacheKey: CacheKey, responseHeaders: AxiosResponseHeaders): DataOrError {
        const requestsRemainingHeader: string = responseHeaders['x-ratelimit-remaining'];
        if (!requestsRemainingHeader) return { ok: false, error: 'Rate limit header is missing from TeamDynamix request.' };

        const requestsRemaining: number = parseInt(requestsRemainingHeader);
        if (isNaN(requestsRemaining)) return { ok: false, error: 'Rate limit header is an invalid number from TeamDynamix request.' };

        const requestsResetHeader: string = responseHeaders['x-ratelimit-reset'];
        if (!requestsResetHeader) return { ok: false, error: 'Rate limit reset header is missing from TeamDynamix request.' };

        const requestsResetTime: number = Date.parse(requestsResetHeader);
        if (isNaN(requestsResetTime)) return { ok: false, error: 'Rate limit reset header is an invalid date from TeamDynamix request.' };

        this.cache.set(cacheKey, {
            requestsRemaining: requestsRemaining,
            resetTimeInMs: requestsResetTime + 5000
        });

        return { ok: true, data: null };
    }
}

export default RequestCache;
