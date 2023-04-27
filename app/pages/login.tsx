import { magic } from "@/src/utils/magic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { setCookie } from "cookies-next";
import axios from "axios";
import { useLancer } from "@/src/providers";
import { api } from "@/src/utils/api";
import { PageLayout } from "@/src/layouts";
import { LancerProvider } from "@/src/providers";
import { Octokit } from "octokit";

const Login = () => {
  const { setCurrentUser, setLoginState } = useLancer();

  const router = useRouter();
  const provider = router.query.provider;
  const referrer = router.query.referrer
    ? (router.query.referrer as string)
    : "/create";

  const { mutateAsync } = api.users.login.useMutation();

  const handleLogin = async () => {
    setLoginState("logging_in");
    const magicResult = await magic?.oauth.getRedirectResult();
    const {
      magic: {
        idToken: session,
        userMetadata: { publicAddress: publicKey },
      },
      oauth: { userHandle: githubId, accessToken },
    } = magicResult;

    const octokit = new Octokit({
      auth: accessToken,
    });
    const octokitResponse = await octokit.request("GET /user", {});

    const currentUser = await mutateAsync({
      session,
      publicKey,
      githubId,
      githubLogin: octokitResponse.data.login,
    });
    setCookie("session", session);
    setCookie("githubToken", accessToken);
    setCurrentUser({
      ...currentUser,
      magic: magicResult,
      currentWallet: currentUser.wallets[0],
    });
    setLoginState("logged_in");
    router.push(referrer);
  };

  useEffect(() => {
    if (router.isReady) {
      if (provider) handleLogin();
    }
  }, [router.isReady]);

  const github = async () => {
    await magic?.oauth.loginWithRedirect({
      provider: "github",
      redirectURI: `${window.location.origin}/login?referrer=${referrer}`,
      scope: ["user, repo"],
    });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <button className="px-5 h-12 rounded" onClick={github}>
        Github
      </button>
    </div>
  );
};

export default function App() {
  return (
    <PageLayout>
      <Login />
    </PageLayout>
  );
}
