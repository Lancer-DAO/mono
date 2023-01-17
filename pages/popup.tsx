import dynamic from "next/dynamic";

const PopupApp = dynamic(() => import("../src/pages/popup/index"), {
  ssr: true,
});
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <main>
        <PopupApp />
      </main>
    </>
  );
}
