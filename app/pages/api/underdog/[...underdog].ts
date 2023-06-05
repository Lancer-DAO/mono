import { NextUnderdog, NetworkEnum } from "@underdog-protocol/js";

export default NextUnderdog({
  apiKey: process.env.UNDERDOG_API_KEY!,
  network:
    process.env.NEXT_PUBLIC_IS_MAINNET === "true"
      ? NetworkEnum.Mainnet
      : NetworkEnum.Devnet,
});
