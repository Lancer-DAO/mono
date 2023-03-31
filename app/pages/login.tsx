import { magic } from "@/src/utils/magic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { setCookie } from "cookies-next";
import axios from "axios";
import { useLancer } from "@/src/providers";

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setUser } = useLancer();
  const router = useRouter();
  const provider = router.query.provider;
  const referrer = router.query.referrer
    ? (router.query.referrer as string)
    : "/account";

  console.log(isLoading);

  useEffect(() => {
    if (provider) {
      setIsLoading(true);
      magic?.oauth.getRedirectResult().then((result) => {
        const session = result.magic.idToken;
        const publicKey = result.magic.userMetadata.publicAddress;
        const githubId = result.oauth.userHandle;

        axios
          .post("/api/data/account/login", {
            session,
            publicKey,
            githubId,
          })
          .then((user) => {
            setCookie("session", session);
            setUser(user.data);
            router.push(referrer);
          });
      });
    }

    if (router.isReady && !provider) setIsLoading(false);
  }, [router.isReady]);

  const loginWithGithub = async () => {
    await magic?.oauth.loginWithRedirect({
      provider: "github",
      redirectURI: `http://localhost:3000/login?referrer=${referrer}`,
    });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <button className="px-5 h-12 rounded" onClick={() => loginWithGithub()}>
        Github
      </button>
    </div>
  );
};

export default Login;
