import type { AppProps } from "next/app";
import "@/src/styles/app.scss";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
