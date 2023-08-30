import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
import { TopBountyUsersBoard } from "@/components/leaderboard/TopBountyUsersBoard";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Bounty User Leaderboard</title>
        <meta name="description" content="Lancer Bounty Leaderboard" />
      </Head>
      <main>
        <TopBountyUsersBoard />
      </main>
    </>
  );
}
