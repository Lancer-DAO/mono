import { APP_ENDPOINT, APP_ENDPOINT_DEV, IS_LOCAL_APP } from "@/constants";

export const convertToQueryParams = (obj: Object) => {
  return Object.keys(obj)
    .map((key) => key + "=" + obj[key])
    .join("&");
};

export const getAppEndpoint = (): string => {
  return IS_LOCAL_APP ? APP_ENDPOINT_DEV : APP_ENDPOINT;
};
