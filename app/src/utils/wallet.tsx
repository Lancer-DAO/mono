import "react";
import { PhantomLogo } from "@/components";

export const getWalletProviderImage = (providerName: string) => {
  if (providerName === "Magic Link") {
    return (
      <img
        src="assets/images/MagicLinkLogo.png"
        width="40"
        alt="Bag - Jobs Webflow Template"
      />
    );
  }
  if (providerName === "Phantom") {
    return <PhantomLogo height="40px" width="40px" />;
  }
  return (
    <img
      src="assets/images/noun-wallet-database-763815.png"
      width="50"
      alt="Bag - Jobs Webflow Template"
    />
  );
};
