import Head from "next/head";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { LeaderboardCommits } from "@/components/leaderboard/CommitBoard";
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
        <title>Lancer | Commits Leaderboard</title>
        <meta name="description" content="Lancer Leaderboard" />
      </Head>
      <main>
        <LeaderboardCommits self={true} />
      </main>
    </>
  );
}
