export * from "./web3"
export * from "./requests"
export * from "./wallet"

export function deepCopy<Type>(obj: Type): Type {
    return JSON.parse(JSON.stringify(obj))
}

export function getUniqueItems(arr: any[]): any[] {
    return arr.filter((value, index, array) => array.indexOf(value) === index);
}

export function uniqueNumbers(lists: number[][]): number[] {
    const set = new Set<number>();
    for (const list of lists) {
      for (const num of list) {
        set.add(num);
      }
    }
    return Array.from(set);
  }