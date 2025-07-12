import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeTry = async <T, E = Error>(
  promise: Promise<T>
): Promise<[T, null] | [null, E]> => {
  try {
    const result = await promise;
    return [result, null];
  } catch (e: unknown) {
    return [null, e as E];
  }
};
