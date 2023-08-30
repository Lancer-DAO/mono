import Head from "next/head";
import { ContributionBoard } from "@/components/leaderboard/ContributionBoard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Contribution Leaderboard</title>
        <meta name="description" content="Lancer Contribution Leaderboard" />
      </Head>
      <main>
        <ContributionBoard />
      </main>
    </>
  );
}
