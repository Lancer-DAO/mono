import type { AppProps } from "next/app";
import "@/src/styles/app.scss";
import "@/src/styles/Form.scss";
import "@/src/styles/Bounty.scss";
import "@/src/styles/webflow.scss";

import { api } from "@/src/utils/api";
import { AllProviders } from "@/src/providers";
import Hotjar from "@hotjar/browser";
import { ReactElement, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { DefaultLayout } from "../components";

const siteId = 3506102;
const hotjarVersion = 6;
const COOKIE_REF = "referrer";

Hotjar.init(siteId, hotjarVersion);

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

  return <AllProviders>{getLayout(<Component {...pageProps} />)}</AllProviders>;
};

export default api.withTRPC(App);
