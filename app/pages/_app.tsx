import type { AppProps } from "next/app";
import "@/src/styles/app.scss";
import "@/src/styles/Form.scss";
import "@/src/styles/Bounty.scss";
import "@/src/styles/webflow.scss";

import { api } from "@/src/utils/api";
import { AllProviders } from "@/src/providers";
import Hotjar from "@hotjar/browser";
import { useEffect } from "react";
import { useRouter } from "next/router";

const siteId = 3506102;
const hotjarVersion = 6;
const COOKIE_REF = "referrer";

Hotjar.init(siteId, hotjarVersion);
const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
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
      <Component {...pageProps} />
    </AllProviders>
  );
};

export default api.withTRPC(App);
