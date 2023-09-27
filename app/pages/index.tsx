import { Bounties } from "@/components/quests/Quests/Quests";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useMint } from "@/src/providers/mintProvider";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import * as queries from "@/prisma/queries";

export const Index: React.FC<{
  bounties: string;
  mints: string;
  industries: string;
  totalQuestsCount: string;
}> = ({ bounties, mints, industries, totalQuestsCount }) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAllBounties, allBounties, maxPages, setMaxPages } = useBounty();

  if (!allBounties && bounties) {
    setAllBounties(JSON.parse(bounties));
  }
  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  if (!maxPages && totalQuestsCount) {
    const totalQuests = parseInt(JSON.parse(totalQuestsCount));
    setMaxPages(Math.ceil(totalQuests / 10));
  }
  return (
    <>
      <NextSeo title="Lancer | Quests" description="Lancer Quests" />
      <Bounties />
    </>
  );
};

export default Index;

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  const { req, res } = context;
  const metadata = await getSession(req, res);

  if (metadata) {
    try {
      const { email } = metadata.user;

      const user = await queries.user.getByEmail(email);
      const allBounties = await queries.bounty.getMany(0, user.id);
      const totalQuests = await queries.bounty.getTotalQuests();
      const allMints = await queries.mint.getAll();
      const allIndustries = await queries.industry.getMany();
      return {
        props: {
          currentUser: JSON.stringify(user),
          bounties: JSON.stringify(allBounties),
          allQuests: JSON.stringify(allBounties),
          totalQuestsCount: JSON.stringify(totalQuests),
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
  } else {
    try {
      const allBounties = await queries.bounty.getMany(0);
      const allMints = await queries.mint.getAll();
      const allIndustries = await queries.industry.getMany();
      const totalQuests = await queries.bounty.getTotalQuests();
      return {
        props: {
          currentUser: null,
          bounties: JSON.stringify(allBounties),
          mints: JSON.stringify(allMints),
          industries: JSON.stringify(allIndustries),
          allQuests: JSON.stringify(allBounties),
          totalQuestsCount: JSON.stringify(totalQuests),
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
}
