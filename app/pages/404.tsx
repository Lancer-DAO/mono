import { ProfileCreated } from "@/components";
import Head from "next/head";
import { Account } from "@/components/account/Account";
import {
  getAccessToken,
  getSession,
  withPageAuthRequired,
} from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";

export const NotFound = () => {
  return (
    <div className="w-full h-full">
      <div className="h-[390px]"></div>
      <div className="text-lg text-center">
        Uh-Oh, seems like you&apos;ve ventured into unknown territory.
      </div>
    </div>
  );
};

export default NotFound;
