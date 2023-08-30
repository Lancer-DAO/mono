import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
export const getServerSideProps = withPageAuthRequired();

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Commits Leaderboard</title>
        <meta name="description" content="Lancer Leaderboard" />
      </Head>
      <main>
        <LeaderboardCommits self={true} />
      </main>
    </>
  );
}
