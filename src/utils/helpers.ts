import { createHash } from "crypto";

export const getHash512 = (str: string): string => {
  const hash = createHash("sha512");
  hash.update(str);
  return hash.digest("hex");
}

export const getUnixTimeStamp = (date: number = Date.now()): number => {
  return Math.floor(new Date().getTime() / 1000)
}