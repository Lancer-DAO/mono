import { Dashboard } from "@/components/dashboard/Dashboard";
import { prisma } from "@/server/db";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";

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
    },
  });

  if (!user || !user || !user.isAdmin) {
    return {
      redirect: {
        destination: "/account",
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
        <title>Lancer | Dashboard</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Dashboard />
      </main>
    </>
  );
}
