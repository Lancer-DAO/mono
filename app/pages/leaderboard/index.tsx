import Head from "next/head";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
import { TopQuestUsersBoard } from "@/components/leaderboard/TopQuestUsersBoard";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";
export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  withPageAuthRequired();
  const { req, res } = context;
  const metadata = await getSession(req, res);
  if (!metadata?.user) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }
  const { email } = metadata.user;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      isAdmin: true,
      hasFinishedOnboarding: true,
      hasBeenApproved: true,
    },
  });

  if (!user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

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
