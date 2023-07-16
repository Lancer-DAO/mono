import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Create } from "@/components/create/Create";

export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | New Bounty</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <main>
        <App />
      </main>
    </>
  );
}

function App() {
  return <Create />;
}
