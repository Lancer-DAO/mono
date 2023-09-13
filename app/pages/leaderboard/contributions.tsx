import Head from "next/head";
import { ContributionBoard } from "@/components/leaderboard/ContributionBoard";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
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
  try {
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
  } catch (e) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | Contribution Leaderboard</title>
        <meta name="description" content="Lancer Contribution Leaderboard" />
      </Head>
      <main>
        {/* <ContributionBoard /> */}
        <h1 className="py-32 w-fit mx-auto text-center">
          Leaderboard Under Construction
        </h1>
      </main>
    </>
  );
}
