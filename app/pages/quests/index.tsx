import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
import { NextSeo } from "next-seo";
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

  if (!user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

const BountiesPage: React.FC = () => {
  return (
    <>
      <NextSeo title="Lancer | Quests" description="Lancer Quests" />
      <Bounties />
    </>
  );
};

export default BountiesPage;
