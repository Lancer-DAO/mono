import type { AppProps } from "next/app";
import "@/src/styles/app.scss";
import "@/src/styles/Form.scss";
import "@/src/styles/Bounty.scss";
import "@/src/styles/webflow.scss";

import { api } from "@/src/utils/api";
import { AllProviders } from "@/src/providers";
import Hotjar from "@hotjar/browser";
import { useEffect, useState } from "react";
const siteId = 3506102;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);
const App = ({ Component, pageProps }: AppProps) => {
  return (
    <AllProviders>
      <Component {...pageProps} />
    </AllProviders>
  );
};

export default api.withTRPC(App);
