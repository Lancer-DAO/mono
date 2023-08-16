import { Bounty } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

export const getFormattedDate = (bounty: Bounty) => {
  var date: Date;
  if (bounty) {
    const createdAtMS = Number(bounty?.createdAt);
    date = new Date(createdAtMS);
  } else {
    date = new Date();
  }
  const year = date.getFullYear().toString().slice(-2); // get the last two digits of the year
  const month = String(date.getMonth() + 1).padStart(2, "0"); // add 1 because getMonth() is 0-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}.${day}.${year}`;
};

export const formatPrice = (price: Decimal | number) => {
  if (price.toString().length > 5) {
    return `${new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(Number(price))}`;
  } else {
    return price.toLocaleString();
  }
};

export function deepCopy<Type>(obj: Type): Type {
  return JSON.parse(JSON.stringify(obj));
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
