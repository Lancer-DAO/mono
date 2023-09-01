import Head from "next/head";
import { Account } from "@/components/account/Account";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Account</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Account self={false} />
      </main>
    </>
  );
}
