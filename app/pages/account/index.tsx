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
    console.log("email", email);

    const user = await queries.user.getByEmail(email);
    console.log("user", user);

    if (!user || !user.hasFinishedOnboarding) {
      console.log("redirecting from account");
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }
    console.log(0);
    const allBounties = await queries.bounty.getMany();
    console.log(1);
    const myQuests = await queries.bounty.getMine(user.id);
    console.log(2);
    const allMints = await queries.mint.getAll();
    console.log(3);
    const allIndustries = await queries.industry.getMany();
    console.log(4);
    return {
      props: {
        currentUser: JSON.stringify(user),
        user: JSON.stringify(user),
        mints: JSON.stringify(allMints),
        industries: JSON.stringify(allIndustries),
        allQuests: JSON.stringify(allBounties),
        myQuests: JSON.stringify(myQuests),
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
  allQuests: string;
  questsMine: string;
}> = ({ user, mints, industries, questsMine, allQuests }) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAccount, account } = useAccount();
  const { setMyQuests, myQuests, setAllBounties, allBounties } = useBounty();

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
  if (!allBounties && allQuests) {
    setAllBounties(JSON.parse(allQuests));
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
