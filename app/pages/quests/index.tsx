import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
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
  const allBounties = await queries.bounty.getMany(user.id);
  console.log("all", allBounties);

  return {
    props: {
      currentUser: JSON.stringify(user),
      bounties: JSON.stringify(allBounties),
    },
  };
}

const BountiesPage = ({ bounties }) => {
  console.log("setting bounties", bounties);

  const { setAllBounties, allBounties } = useBounty();
  if (!allBounties && bounties) {
    setAllBounties(JSON.parse(bounties));
  }
  return (
    <>
      <NextSeo title="Lancer | Quests" description="Lancer Quests" />
      <Bounties />
    </>
  );
};

export default BountiesPage;
