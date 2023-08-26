import Head from "next/head";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Leaderboard</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Leaderboard self={true} />
      </main>
    </>
  );
}
