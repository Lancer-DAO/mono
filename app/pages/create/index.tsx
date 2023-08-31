import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { Create } from "@/components/create/Create";
import { NextSeo } from "next-seo";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  withPageAuthRequired();
  const { req, res } = context;
  const metadata = await getSession(req, res);

  const token = process.env.NEXT_PUBLIC_IS_CUSTODIAL
    ? metadata.token
    : (await getAccessToken(req, res))?.accessToken;
  const { email } = metadata.user;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      isAdmin: true,
      hasFinishedOnboarding: true,
    },
  });

  if (!user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  if (!user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

const CreatePage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="Lancer | New Bounty"
        description="Create New Lancer Bounty"
      />
      <Create />
    </>
  );
};

export default CreatePage;
