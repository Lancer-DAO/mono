import { AllProviders } from "@/src/providers";
import "@/src/styles/Bounty.scss";
import "@/src/styles/globals.css";
import { api } from "@/src/utils/api";
import { NextPage } from "next";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useEffect } from "react";
import { DefaultLayout } from "../components";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";
// import your default seo configuration
import SEO from "../next-seo.config";
import { Toaster } from "react-hot-toast";
import DebugModeProvider from "@/src/providers/debugModeProvider";

const COOKIE_REF = "referrer";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const router = useRouter();
  const user = JSON.parse(pageProps.user);
  console.log("user, ", user);

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  useEffect(() => {
    const { r } = router.query;
    if (r) {
      const hasReferrer = localStorage.getItem(COOKIE_REF);
      if (!hasReferrer) {
        localStorage.setItem(COOKIE_REF, r as string);
      }
    }
  }, [router.query]);

  return (
    <DebugModeProvider>
      <AllProviders user={user}>
        <DefaultSeo {...SEO} />
        <Toaster />
        {getLayout(<Component {...pageProps} />)}
      </AllProviders>
    </DebugModeProvider>
  );
};

export default api.withTRPC(App);
