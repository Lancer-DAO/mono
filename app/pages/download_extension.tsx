import { NextSeo } from "next-seo";

import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { DownloadExtension } from "../components/download_extension/DownloadExtension";
import { GetServerSidePropsContext } from "next";
import { prisma } from "@/server/db";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  withPageAuthRequired();
  const { req, res } = context;
  const metadata = await getSession(req, res);

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
  if (!user.isAdmin) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }
  return { props: {} };
}
const DownloadExtensionPage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="Lancer | Download Extension"
        description="Lancer Bounties Extension"
      />
      <DownloadExtension />
    </>
  );
};

export default DownloadExtensionPage;
