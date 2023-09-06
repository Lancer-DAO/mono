import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { LancerWallet } from "@/types/";
import { IUserWalletContext } from "@/src/providers/userWalletProvider/types";
import { api } from "@/src/utils/api";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useUser } from "@auth0/nextjs-auth0/client";
export * from "./types";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { MONO_ADDRESS } from "@/src/constants";
import { PROFILE_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "../tutorialProvider";
import { User } from "@/types/";
import { useRouter } from "next/router";
import { useDebugMode } from "../debugModeProvider";

export const NonCustodialWalletContext = createContext<IUserWalletContext>({
  currentUser: null,
  program: null,
  currentWallet: null,
  provider: null,
});

export function useNonCustodialWallet(): IUserWalletContext {
  return useContext(NonCustodialWalletContext);
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
  const router = useRouter();
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
  const { isDebugMode } = useDebugMode();

  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
            skipPreflight: isDebugMode,
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
    } else {
      setProvider(null);
      setProgram(null);
      setCurrentWallet(null);
    }
  }, [connected, publicKey, isDebugMode, connection, wallet, currentUser]);

  useEffect(() => {
    if (user) {
      const getUser = async () => {
        try {
          const userInfo = await getCurrUser();
          setCurrentUser(userInfo);
        } catch (e) {
          console.error(e);
          // router.push("/api/auth/login");
        }
      };
      getUser();
    }
  }, [user]);

  const contextProvider = {
    currentUser,
    program,
    provider,
    currentWallet,
  };
  return (
    <NonCustodialWalletContext.Provider value={contextProvider}>
      {children}
    </NonCustodialWalletContext.Provider>
  );
};
export default UserWalletProvider;
