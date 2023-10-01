import { Bounties } from "@/components/quests/Quests/Quests";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useMint } from "@/src/providers/mintProvider";
import { getSession } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
import * as queries from "@/prisma/queries";
import { QUESTS_PER_PAGE } from "@/src/constants";

export const Index: React.FC<{
  allQuests: string;
  mints: string;
  industries: string;
  allUserIndustries: string;
  totalQuestsCount: string;
}> = ({
  allQuests,
  mints,
  industries,
  allUserIndustries,
  totalQuestsCount,
}) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries, userIndustries, setUserIndustries } =
    useIndustry();
  const { setAllBounties, allBounties, maxPages, setMaxPages } = useBounty();

  if (!allBounties && allQuests) {
    setAllBounties(JSON.parse(allQuests));
  }
  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  if (!userIndustries && allUserIndustries) {
    setUserIndustries(JSON.parse(allUserIndustries));
  }
  if (!maxPages && totalQuestsCount) {
    const totalQuests = parseInt(JSON.parse(totalQuestsCount));
    setMaxPages(Math.ceil(totalQuests / QUESTS_PER_PAGE));
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
      if (!user.hasFinishedOnboarding) {
        return {
          redirect: {
            destination: "/welcome",
            permanent: false,
          },
        };
      }
      const allBounties = await queries.bounty.getMany(0, user.id);
      const totalQuests = await queries.bounty.getTotalQuests(user.id);
      const allMints = await queries.mint.getAll();
      const allIndustries = await queries.industry.getMany();
      const allUserIndustries = await queries.industry.getIndustriesByUserId(
        user.id
      );
      return {
        props: {
          currentUser: JSON.stringify(user),
          allQuests: JSON.stringify(allBounties),
          mints: JSON.stringify(allMints),
          industries: JSON.stringify(allIndustries),
          allUserIndustries: JSON.stringify(allUserIndustries),
          totalQuestsCount: JSON.stringify(totalQuests),
        },
      };
    } catch (e) {
      console.error(e);
      const allBounties = await queries.bounty.getMany(0, undefined);
      const allMints = await queries.mint.getAll();
      const allIndustries = await queries.industry.getMany();
      const totalQuests = await queries.bounty.getTotalQuests();
      return {
        props: {
          currentUser: null,
          allQuests: JSON.stringify(allBounties),
          mints: JSON.stringify(allMints),
          industries: JSON.stringify(allIndustries),
          allUserIndustries: null,
          totalQuestsCount: JSON.stringify(totalQuests),
        },
      };
    }
  } else {
    try {
      const allBounties = await queries.bounty.getMany(0, undefined);
      const allMints = await queries.mint.getAll();
      const allIndustries = await queries.industry.getMany();
      const totalQuests = await queries.bounty.getTotalQuests();
      return {
        props: {
          currentUser: null,
          allQuests: JSON.stringify(allBounties),
          mints: JSON.stringify(allMints),
          industries: JSON.stringify(allIndustries),
          allUserIndustries: null,
          totalQuestsCount: JSON.stringify(totalQuests),
        },
      };
    } catch (e) {
      console.error(e);
      return {
        props: {
          currentUser: null,
          allQuests: null,
          mints: null,
          industries: null,
          allUserIndustries: null,
          totalQuestsCount: null,
        },
      };
    }
  }
}
