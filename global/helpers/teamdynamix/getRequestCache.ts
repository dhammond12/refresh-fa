import RequestCache from "../../classes/teamdynamix/RequestCache";

let requestCache: RequestCache;

const getRequestCache = () => {
    if (!requestCache) {
        requestCache = new RequestCache();
    }

    return requestCache;
}

export default getRequestCache;