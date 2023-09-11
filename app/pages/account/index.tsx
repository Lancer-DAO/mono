import Head from "next/head";
import { Account } from "@/components/account/Account";
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";
import * as queries from "@/prisma/queries";
import { User } from "@/types";
import { useMint } from "@/src/providers/mintProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useAccount } from "@/src/providers/accountProvider";

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

  if (!user || !user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }

  const allMints = await queries.mint.getAll();
  const allIndustries = await queries.industry.getMany();
  return {
    props: {
      currentUser: JSON.stringify(user),
      user: JSON.stringify(user),
      mints: JSON.stringify(allMints),
      industries: JSON.stringify(allIndustries),
    },
  };
}
const Home: React.FC<{ user: string; mints: string; industries: string }> = ({
  user,
  mints,
  industries,
}) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();
  const { setAccount, account } = useAccount();

  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  if (!account && user) {
    console.log("setting account", user);
    setAccount(JSON.parse(user));
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
