import React, { useMemo } from "react";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { AppProps } from "next/app";
import { MAINNET_RPC } from "@/src/constants";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AdminLancer } from "../components/adminLancer/AdminLancer";
import { NextPage } from "next";
export const getServerSideProps = withPageAuthRequired();

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = MAINNET_RPC;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new PhantomWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    wallets && (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AdminLancer />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    )
  );
};

export default App;
