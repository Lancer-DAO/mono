import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
import { NextSeo } from "next-seo";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";
import { useBounty } from "@/src/providers/bountyProvider";
import { useMint } from "@/src/providers/mintProvider";
import { useIndustry } from "@/src/providers/industryProvider";

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
    const allBounties = await queries.bounty.getMany(user.id);

    const allMints = await queries.mint.getAll();
    const allIndustries = await queries.industry.getMany();
    return {
      props: {
        currentUser: JSON.stringify(user),
        bounties: JSON.stringify(allBounties),

        mints: JSON.stringify(allMints),
        industries: JSON.stringify(allIndustries),
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

const BountiesPage: React.FC<{
  bounties: string;
  mints: string;
  industries: string;
}> = ({ bounties, mints, industries }) => {
  console.log("setting bounties", bounties);

  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAllBounties, allBounties } = useBounty();
  if (!allBounties && bounties) {
    setAllBounties(JSON.parse(bounties));
  }

  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  return (
    <>
      <NextSeo title="Lancer | Quests" description="Lancer Quests" />
      <Bounties />
    </>
  );
};

export default BountiesPage;
