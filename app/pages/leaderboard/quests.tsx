import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
import { TopQuestUsersBoard } from "@/components/leaderboard/TopQuestUsersBoard";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Bounty User Leaderboard</title>
        <meta name="description" content="Lancer Bounty Leaderboard" />
      </Head>
      <main>
        <TopQuestUsersBoard />
      </main>
    </>
  );
}
