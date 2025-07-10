import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const safeTry = async <T, E = Error>(
  promise: Promise<T>
): Promise<[null, T] | [E, null]> => {
  try {
    const result = await promise;
    return [null, result];
  } catch (e: unknown) {
    return [e as E, null];
  }
};
