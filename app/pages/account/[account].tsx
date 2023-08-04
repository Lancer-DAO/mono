import Head from "next/head";
import { Account } from "@/components/account/Account";

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Account</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Account />
      </main>
    </>
  );
}
