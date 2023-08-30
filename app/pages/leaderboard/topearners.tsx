import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/LeaderboardCommits";
import { TopEarners } from "@/components/leaderboard/TopEarners";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Earners Leaderboard</title>
        <meta name="description" content="Lancer Leaderboard" />
      </Head>
      <main>
        <TopEarners self={true} />
      </main>
    </>
  );
}
