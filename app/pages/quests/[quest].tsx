import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Bounty } from "../../components/bounties/Bounty/Bounty";
import { NextSeo } from "next-seo";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";
import * as queries from "@/prisma/queries";
import { useBounty } from "@/src/providers/bountyProvider";

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
  const questId = parseInt(context.query.quest as string);
  const { email } = metadata.user;

  const user = await queries.user.getByEmail(email);

  const quest = await queries.bounty.get(questId, user.id);

  if (!user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  return {
    props: { quest: JSON.stringify(quest), currentUser: JSON.stringify(user) },
  };
}

const BountyDetailPage = ({ quest }) => {
  const { setCurrentBounty, currentBounty } = useBounty();
  if (!currentBounty && quest) {
    setCurrentBounty(JSON.parse(quest));
  }

  return (
    <>
      <NextSeo title="Lancer | Quest" description="Lancer Quest" />
      <Bounty />
    </>
  );
};

export default BountyDetailPage;
