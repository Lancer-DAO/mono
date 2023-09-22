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
  console.log("metadata", metadata);
  if (!metadata?.user) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }
  console.log("metadata passed");
  try {
    const questId = parseInt(context.query.quest as string);
    const { email } = metadata.user;

    const user = await queries.user.getByEmail(email);
    console.log("user", user);
    if (!user || !user.hasFinishedOnboarding) {
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }
    console.log("user passed");
    const quest = await queries.bounty.get(questId, user.id);

    const allMints = await queries.mint.getAll();
    const allIndustries = await queries.industry.getMany();
    return {
      props: {
        quest: JSON.stringify(quest),
        currentUser: JSON.stringify(user),
        mints: JSON.stringify(allMints),
        industries: JSON.stringify(allIndustries),
      },
    };
  } catch (e) {
    console.log("error", e);
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
}

const BountyDetailPage: React.FC<{
  mints: string;
  industries: string;
  quest: string;
}> = ({ quest, mints, industries }) => {
  const { setCurrentBounty, currentBounty } = useBounty();

  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  if (!currentBounty && quest) {
    setCurrentBounty(JSON.parse(quest));
  }
  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }

  return (
    <>
      <NextSeo title="Lancer | Quest" description="Lancer Quest" />
      <Quest />
    </>
  );
};

export default BountyDetailPage;
