import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Quest } from "../../components/bounties/Bounty/Quest";
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

const BountyDetailPage = () => {
  return (
    <>
      <NextSeo title="Lancer | Quest" description="Lancer Quest" />
      <Quest />
    </>
  );
};

export default BountyDetailPage;
