import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/LeaderboardCommits";
import { TopBountyUsers } from "@/components/leaderboard/TopBountyUsers";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Bounty User Leaderboard</title>
        <meta name="description" content="Lancer Leaderboard" />
      </Head>
      <main>
        <TopBountyUsers self={true} />
      </main>
    </>
  );
}
