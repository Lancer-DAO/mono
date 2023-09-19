import React from "react";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";

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

  if (!user || !user.hasFinishedOnboarding) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
  if (!user.isLancerDev) {
    return {
      redirect: {
        destination: "/account",
        permanent: false,
      },
    };
  }
  return {
    props: {
      currentUser: JSON.stringify(user),
    },
  };
}
import { UpdateTable } from "@/components";

const BountiesPage: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center mt-5 gap-5 py-24">
      <UpdateTable />
    </div>
  );
};

export default BountiesPage;
