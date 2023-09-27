import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextSeo } from "next-seo";

import { ChooseYourClass } from "@/components/onboarding/ChooseYourClass";
import { CreateYourProfile } from "@/components/onboarding/CreateYourProfile";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";
import { GoodToGo } from "@/components/onboarding/GoodToGo";

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

    return {
      props: {
        currentUser: JSON.stringify(user),
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

const BountiesPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-4 py-24 ">
      <NextSeo title="Lancer | Bounties" description="Lancer Bounties" />
      {/* <ChooseYourClass /> */}
      {/* <CreateYourProfile /> */}
      <GoodToGo />
    </div>
  );
};

export default BountiesPage;
