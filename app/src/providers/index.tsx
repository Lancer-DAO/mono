import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { clusterApiUrl } from "@solana/web3.js";
import { ReactNode, useMemo } from "react";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import AppContextProvider from "./appContextProvider";
import BountyProvider from "./bountyProvider";
import TutorialProvider from "./tutorialProvider";
import NonCustodialWalletProvider from "./userWalletProvider/nonCustodialProvider";
import CustodialWalletProvider from "./userWalletProvider/custodialProvider";
import { IS_CUSTODIAL, IS_MAINNET, MAINNET_RPC } from "../constants";
import ReferralProvider from "./referralProvider";

export * from "./userWalletProvider";

export const AllProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(
    () =>
      IS_MAINNET ? MAINNET_RPC : clusterApiUrl(WalletAdapterNetwork.Devnet),
    [IS_MAINNET]
  );

  const walletProviders = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports n\either of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [IS_MAINNET]
  );
  // console.log("IS_CUSTODIAL", IS_CUSTODIAL);

  return IS_CUSTODIAL ? (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walletProviders} autoConnect>
        <WalletModalProvider>
          <AppContextProvider>
            <TutorialProvider>
              <CustodialWalletProvider
                web3AuthNetwork={IS_MAINNET ? "cyan" : "testnet"}
              >
                <BountyProvider>
                  <ReferralProvider>{children}</ReferralProvider>
                </BountyProvider>
              </CustodialWalletProvider>
            </TutorialProvider>
          </AppContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  ) : (
    <UserProvider>
      <ConnectionProvider
        endpoint={endpoint}
        config={{ commitment: "finalized" }}
      >
        <WalletProvider wallets={walletProviders} autoConnect>
          <WalletModalProvider>
            <AppContextProvider>
              <TutorialProvider>
                <NonCustodialWalletProvider>
                  <BountyProvider>
                    <ReferralProvider>{children}</ReferralProvider>
                  </BountyProvider>
                </NonCustodialWalletProvider>
              </TutorialProvider>
            </AppContextProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </UserProvider>
  );
};
