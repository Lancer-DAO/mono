import type { AppProps } from "next/app";
import "@/src/styles/app.scss";
import "@/src/styles/Form.scss";
import "@/src/styles/Bounty.scss";
import "@/src/styles/webflow.scss";

require("@solana/wallet-adapter-react-ui/styles.css");
import { api } from "@/src/utils/api";
import { AllProviders } from "@/src/providers";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    // <AllProviders>
    <Component {...pageProps} />
    // </AllProviders>
  );
};

// export default api.withTRPC(App);
export default App;
