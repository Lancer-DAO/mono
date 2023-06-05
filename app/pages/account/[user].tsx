import App from "@/src/pages/account";
import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <main>
        <App />
      </main>
    </>
  );
}
