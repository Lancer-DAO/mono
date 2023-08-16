import { Decimal } from "@prisma/client/runtime";

export * from "./web3";
export * from "./requests";
export * from "./wallet";
export * from "./api";

export function deepCopy<Type>(obj: Type): Type {
  return JSON.parse(JSON.stringify(obj));
}
export function roundDownToTwoDecimals(num: number): number {
  const factor = 100; // 10^2, to round to two decimal places
  return Math.floor(num * factor) / factor;
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

export function decimalToNumber(decimal: Decimal) {
  return parseFloat(decimal.toString());
}

export function updateList<T>(
  originalList: T[],
  itemsToRemove: T[],
  itemsToAdd: T[]
): T[] {
  // Remove items from the original list
  const filteredList = originalList.filter(
    (item) => !itemsToRemove.includes(item)
  );

  // Add items to the filtered list
  const updatedList = [...filteredList, ...itemsToAdd];

  return updatedList;
}
