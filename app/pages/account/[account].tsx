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

  const currentUser = await queries.user.getByEmail(email);

  if (!currentUser || !currentUser || !currentUser.hasFinishedOnboarding) {
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

  const user = await queries.user.getById(userId);

  return {
    props: {
      currentUser: JSON.stringify(currentUser),
      user: JSON.stringify(user),
    },
  };
}

const Home: React.FC<{ user: string }> = ({ user }) => {
  const parsedUser = JSON.parse(user);
  console.log(parsedUser);
  return (
    <>
      <Head>
        <title>Lancer | Account</title>
        <meta name="description" content="Lancer Account" />
      </Head>
      <main>
        {" "}
        <Account self={false} fetchedUser={parsedUser} />
      </main>
    </>
  );
};

export default Home;
