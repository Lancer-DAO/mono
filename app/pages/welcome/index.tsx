import Onboard from "@/components/onboarding/Onboard";
import { prisma } from "@/server/db";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";
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

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      isAdmin: true,
      hasFinishedOnboarding: true,
      hasBeenApproved: true,
    },
  });

  if (user && user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

const WelcomePage: React.FC = () => {
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
