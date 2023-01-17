import dynamic from "next/dynamic";

const ModalApp = dynamic(() => import("../src/pages/modal/index"), {
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
        <ModalApp />
      </main>
    </>
  );
}
