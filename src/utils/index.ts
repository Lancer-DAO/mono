export * from "./web3"
export * from "./requests"

export function deepCopy<Type>(obj: Type): Type {
    return JSON.parse(JSON.stringify(obj))
}