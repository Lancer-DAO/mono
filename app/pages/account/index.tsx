import Head from "next/head";
import { Account } from "@/components/account/Account";
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";
import { useMint } from "@/src/providers/mintProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useAccount } from "@/src/providers/accountProvider";
import { useBounty } from "@/src/providers/bountyProvider";
import { QUESTS_PER_PAGE } from "@/src/constants";

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

    const myQuests = await queries.bounty.getMine(user.id);
    const totalQuests = await queries.bounty.getTotalQuests(user.id, true);
    const allMints = await queries.mint.getAll();
    const allIndustries = await queries.industry.getMany();
    return {
      props: {
        currentUser: JSON.stringify(user),
        user: JSON.stringify(user),
        mints: JSON.stringify(allMints),
        industries: JSON.stringify(allIndustries),
        myQuests: JSON.stringify(myQuests),
        totalQuestsCount: JSON.stringify(totalQuests),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
}
const Home: React.FC<{
  user: string;
  mints: string;
  industries: string;
  questsMine: string;
  totalQuestsCount: string;
}> = ({ user, mints, industries, questsMine, totalQuestsCount }) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAccount, account } = useAccount();
  const { maxPages, setMaxPages, myQuests, setMyQuests } = useBounty();

  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  if (!account && user) {
    setAccount(JSON.parse(user));
  }
  if (!myQuests && questsMine) {
    setMyQuests(JSON.parse(questsMine));
  }
  if (!maxPages && totalQuestsCount) {
    const totalQuests = parseInt(JSON.parse(totalQuestsCount));
    setMaxPages(Math.ceil(totalQuests / QUESTS_PER_PAGE));
  }
  return (
    <>
      <Head>
        <title>Lancer | Account</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        <Account self={true} />
      </main>
    </>
  );
};

export default Home;
