export const convertToQueryParams = (obj: Object) => {
    return Object.keys(obj).map(key => key + '=' + obj[key]).join('&');
}