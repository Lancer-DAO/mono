import Onboard from "@/components/onboarding/Onboard";
import { prisma } from "@/server/db";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";

import * as queries from "@/prisma/queries";
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

  const { email } = metadata.user;

  const user = await queries.user.getByEmail(email);

  if (user && user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }

  const allMints = await queries.mint.getAll();
  const allIndustries = await queries.industry.getMany();
  return {
    props: {
      currentUser: JSON.stringify(user),

      mints: JSON.stringify(allMints),
      industries: JSON.stringify(allIndustries),
    },
  };
}

const WelcomePage: React.FC<{ mints: string; industries: string }> = ({
  mints,
  industries,
}) => {
  const { setAllMints, allMints } = useMint();
  const { setAllIndustries, allIndustries } = useIndustry();

  if (!allMints && mints) {
    setAllMints(JSON.parse(mints));
  }
  if (!allIndustries && industries) {
    setAllIndustries(JSON.parse(industries));
  }
  return (
    <>
      <NextSeo
        title="Lancer | Welcome"
        description="Create your Lancer account"
      />
      <Onboard />
    </>
  );
};

export default WelcomePage;
