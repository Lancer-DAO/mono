import App from "@/src/pages/test";
import Head from "next/head";

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
