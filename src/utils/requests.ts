import { API_ENDPOINT, API_ENDPOINT_DEV, APP_ENDPOINT, APP_ENDPOINT_DEV, EXTENSION_DEV } from "@/constants";

export const convertToQueryParams = (obj: Object) => {
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}

export const getAppEndpoint = (): string => {
    return process.env.NODE_ENV === 'development' ? APP_ENDPOINT_DEV : APP_ENDPOINT;
}

export const getApiEndpoint = (): string => {
    return process.env.NODE_ENV === 'development' ? API_ENDPOINT_DEV : API_ENDPOINT;
}

export const getApiEndpointExtenstion = (): string => {
    return EXTENSION_DEV ? API_ENDPOINT_DEV : API_ENDPOINT;
}

export const getAppEndpointExtenstion = (): string => {
    return EXTENSION_DEV ? APP_ENDPOINT_DEV : APP_ENDPOINT;
}
