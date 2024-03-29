import React, { useMemo } from "react";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import type { AppProps } from "next/app";
import { MAINNET_RPC } from "@/src/constants";
import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import * as queries from "@/prisma/queries";
import { AdminLancer } from "../components/adminLancer/AdminLancer";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { prisma } from "@/server/db";
import { useBounty } from "@/src/providers/bountyProvider";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  withPageAuthRequired();
  const { req, res } = context;
  const metadata = await getSession(req, res);
  if (!metadata?.user) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }
  const { email } = metadata.user;

  const user = await queries.user.getByEmail(email);
  // const user = await prisma.user.findUnique({
  //   where: {
  //     email,
  //   },
  //   select: {
  //     id: true,
  //     isAdmin: true,
  //     hasFinishedOnboarding: true,
  //   },
  // });

  if (!user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  if (!user.isAdmin) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }
  const allBounties = await queries.bounty.getMany(0, user.id);

  return {
    props: {
      currentUser: JSON.stringify(user),
      bounties: JSON.stringify(allBounties), // NB
    },
  };
}

// const App: NextPage<AppProps> = ({ Component, pageProps }) => {
const App: React.FC<{
  bounties: string;
}> = ({ bounties }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = MAINNET_RPC;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => network, [network]);

  const { setAllBounties, allBounties } = useBounty();
  if (!allBounties && bounties) {
    setAllBounties(JSON.parse(bounties));
  }

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

  return <AdminLancer />;
  // return (
  //   wallets && (
  //     <ConnectionProvider endpoint={endpoint}>
  //       <WalletProvider wallets={wallets} autoConnect>
  //         <WalletModalProvider>
  //           <AdminLancer />
  //         </WalletModalProvider>
  //       </WalletProvider>
  //     </ConnectionProvider>
  //   )
  // );
};

export default App;
