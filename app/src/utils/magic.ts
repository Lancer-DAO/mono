import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { SolanaExtension } from "@magic-ext/solana";
import { getEndpoint } from "./web3"

// Create client-side Magic instance
const createMagic = (key: string) => {
  return typeof window != "undefined"
    ? new Magic(key, {
        extensions: [
          new OAuthExtension(),
          new SolanaExtension({
           rpcUrl: getEndpoint(),
          }),
        ],
      })
    : undefined;
};

console.log(process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY)
export const magic = createMagic(process.env.NEXT_PUBLIC_MAGIC_PUBLIC_KEY);
