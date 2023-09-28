import Head from "next/head";
import { Account } from "@/components/account/Account";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
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

    const currentUser = await queries.user.getByEmail(email);

    if (!currentUser || !currentUser.hasFinishedOnboarding) {
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }

    if (!currentUser.hasBeenApproved) {
      return {
        redirect: {
          destination: "/account",
          permanent: false,
        },
      };
    }
    const userId = parseInt(context.query.account as string);

    const allBounties = await queries.bounty.getMany(0, userId);
    const totalQuests = await queries.bounty.getTotalQuests(userId, true);
    const user = await queries.user.getById(userId);
    const allMints = await queries.mint.getAll();
    const allIndustries = await queries.industry.getMany();

    return {
      props: {
        currentUser: JSON.stringify(currentUser),
        user: JSON.stringify(user),
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

const Home: React.FC<{
  user: string;
  mints: string;
  industries: string;
  allQuests: string;
  totalQuestsCount: string;
}> = ({ user, mints, industries, allQuests, totalQuestsCount }) => {
  const parsedUser = JSON.parse(user);

  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAccount, account } = useAccount();
  const { setAllBounties, allBounties, maxPages, setMaxPages } = useBounty();

  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  if (!account && user) {
    setAccount(JSON.parse(user));
  }

  if (!allBounties && allQuests) {
    setAllBounties(JSON.parse(allQuests));
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
        <Account self={false} />
      </main>
    </>
  );
};

export default Home;
