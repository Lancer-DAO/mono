import type { AppProps } from "next/app";
import "@/src/styles/globals.css";
import "@/src/styles/Bounty.scss";
import { api } from "@/src/utils/api";
import { AllProviders } from "@/src/providers";
import { useEffect, ReactNode, ReactElement } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { DefaultLayout } from "../components";
import { DefaultSeo } from "next-seo";

// import your default seo configuration
import SEO from "../next-seo.config";
import { Toaster } from "react-hot-toast";

const COOKIE_REF = "referrer";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const router = useRouter();

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
  }, []);

  return (
    <AllProviders>
      <DefaultSeo {...SEO} />
      <Toaster />
      {getLayout(<Component {...pageProps} />)}
    </AllProviders>
  );
};

export default api.withTRPC(App);
