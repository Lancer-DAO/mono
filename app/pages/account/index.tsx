import App from "@/src/pages/account";
import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useLancer } from "@/src/providers";
import dynamic from "next/dynamic";
import { DefaultLayout } from "@/src/components";
import Coinflow from "@/pages/account/coinflowOfframp";
import { IS_MAINNET } from "@/src/constants";
import { WalletInfo } from "@/pages/account/WalletInfo";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Account />
      </main>
    </>
  );
}

const Account: React.FC = () => {
  const { currentUser, wallets } = useLancer();

  return (
    currentUser && (
      <DefaultLayout>
        <div className="account-page-wrapper">
          {currentUser?.githubLogin && (
            <div>GitHub User: {currentUser.githubLogin}</div>
          )}
          <a href="/api/auth/logout">Logout</a>

          {wallets &&
            wallets.map((wallet) => (
              <WalletInfo wallet={wallet} key={wallet.publicKey.toString()} />
            ))}

          {!IS_MAINNET && (
            <a
              href="https://staging.coinflow.cash/faucet"
              target={"_blank"}
              rel="noreferrer"
            >
              USDC Faucet
            </a>
          )}
          <Coinflow />
        </div>
      </DefaultLayout>
    )
  );
};
