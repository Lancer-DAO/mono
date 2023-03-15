import { Inter } from "@next/font/google";
import { BrowserRouter as Router } from "react-router-dom";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const Redirect = () => {
  useEffect(() => {
    window.location.replace("https://home.lancer.so");
  }, []);
  return <></>;
};

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    ready && (
      <Router>
        <Redirect />
      </Router>
    )
  );
}
