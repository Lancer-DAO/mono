import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { Issue, CurrentUser, LancerWallet, Bounty } from "@/src/types";
import {
  IUserWalletContext,
  ISSUE_LOAD_STATE,
  LOGIN_STATE,
} from "@/src/providers/userWalletProvider/types";
import { api } from "@/src/utils/api";
import { getCookie } from "cookies-next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
export * from "./types";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { APIKeyInfo } from "@/src/components/molecules/ApiKeyModal";
import { IS_MAINNET, MONO_ADDRESS } from "@/src/constants";
import { Tutorial } from "@/src/types/tutorials";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";

export const UserWalletContext = createContext<IUserWalletContext>({
  currentUser: null,
  program: null,
  currentWallet: null,
  provider: null,
});

export function useUserWallet(): IUserWalletContext {
  return useContext(UserWalletContext);
}

interface IUserWalletState {
  children?: React.ReactNode;
}
interface IUserWalletProps {
  children?: ReactNode;
}

const UserWalletProvider: FunctionComponent<IUserWalletState> = ({
  children,
}: IUserWalletProps) => {
  const { mutateAsync: getCurrUser } = api.users.login.useMutation();
  const { user } = useUser();
  const {
    wallet,
    publicKey,
    sendTransaction,
    signAllTransactions,
    signMessage,
    signTransaction,
    connected,
  } = useWallet();
  const { connection } = useConnection();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentWallet, setCurrentWallet] = useState<LancerWallet>();
  const [provider, setProvider] = useState<AnchorProvider>();
  const [program, setProgram] = useState<Program<MonoProgram>>();

  useEffect(() => {
    if (connected) {
      const lancerWallet: LancerWallet = {
        wallet,
        publicKey,
        sendTransaction,
        signAllTransactions,
        signMessage,
        signTransaction,
        connected,
        signAndSendTransaction: async (transaction: Transaction) => {
          return await sendTransaction(transaction, connection, {
            skipPreflight: true,
          });
        },
        providerName: "Phantom",
      };
      const provider = new AnchorProvider(connection, lancerWallet, {});
      const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram,
        new PublicKey(MONO_ADDRESS),
        provider
      );
      setProvider(provider);
      setProgram(program);
      setCurrentWallet(lancerWallet);
      if (
        !!currentTutorialState &&
        currentTutorialState?.title === PROFILE_TUTORIAL_INITIAL_STATE.title &&
        currentTutorialState.currentStep === 1
      ) {
        setCurrentTutorialState({
          ...currentTutorialState,
          currentStep: currentUser.hasProfileNFT ? 3 : 2,
          isRunning: true,
          spotlightClicks: !currentUser.hasProfileNFT,
        });
        return;
      }
    }
  }, [connected]);

  useEffect(() => {
    const getUser = async () => {
      console.log("logging in user");
      const userInfo = await getCurrUser();
      console.log("login response", userInfo);
      setCurrentUser(userInfo);
    };
    if (user) {
      const getUser = async () => {
        try {
          const userInfo = await getCurrUser();
          setCurrentUser(userInfo);
        } catch (e) {
          // if (e.data.httpStatus === 401) {
          //   debugger;
          //   router.push("/api/auth/login");
          // }
        }
      };
      getUser();
    }
  }, [user]);

  const [issueLoadingState, setIssueLoadingState] =
    useState<ISSUE_LOAD_STATE>("initializing");

  const contextProvider = {
    currentUser,
    setCurrentUser,
    setIssueLoadingState,
    program,
    provider,
    currentWallet,
    setCurrentWallet,
  };
  return (
    <UserWalletContext.Provider value={contextProvider}>
      {children}
    </UserWalletContext.Provider>
  );
};
export default UserWalletProvider;
function useTutorial(): {
  currentTutorialState: any;
  setCurrentTutorialState: any;
} {
  throw new Error("Function not implemented.");
}
