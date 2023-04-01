import { magic } from "@/src/utils/magic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { setCookie } from "cookies-next";
import axios from "axios";
import { useLancer } from "@/src/providers";
import { api } from "@/src/utils/api";

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const provider = router.query.provider;
  const referrer = router.query.referrer
    ? (router.query.referrer as string)
    : "/account";

  const { mutateAsync } = api.users.login.useMutation();

  const login = async () => {
    setIsLoading(true);
    const {
      magic: {
        idToken: session,
        userMetadata: { publicAddress: publicKey },
      },
      oauth: { userHandle: githubId },
    } = await magic?.oauth.getRedirectResult();

    await mutateAsync({ session, publicKey, githubId });
    setCookie("session", session);
    router.push(referrer);
  };

  useEffect(() => {
    if (router.isReady) {
      if (provider) login();
      if (!provider) setIsLoading(false);
    }
  }, [router.isReady]);

  const github = async () => {
    await magic?.oauth.loginWithRedirect({
      provider: "github",
      redirectURI: `http://localhost:3000/login?referrer=${referrer}`,
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

export default Login;
