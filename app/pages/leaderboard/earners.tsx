import Head from "next/head";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
import { TopEarnersBoard } from "@/components/leaderboard/TopEarnersBoard";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";

import * as queries from "@/prisma/queries";

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

  const user = await queries.user.getByEmail(email);

  if (!user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  if (!user.isAdmin) {
    return {
      redirect: {
        destination: "/leaderboard",
        permanent: false,
      },
    };
  }
  return {
    props: {
      currentUser: JSON.stringify(user),
    },
  };
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Earners Leaderboard</title>
        <meta name="description" content="Lancer Leaderboard" />
      </Head>
      <main>
        <TopEarnersBoard />
      </main>
    </>
  );
}
