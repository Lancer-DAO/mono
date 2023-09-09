import { User } from "@/types/";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IAccountContext {
  account: User;
  setAccount: (account: User) => void;
}

export const AccountContext = createContext<IAccountContext>({
  account: null,
  setAccount: () => null,
});

export function useAccount(): IAccountContext {
  return useContext(AccountContext);
}

interface IAccountState {
  children?: React.ReactNode;
}
interface IAccountProps {
  children?: ReactNode;
}

const AccountProvider: FunctionComponent<IAccountState> = ({
  children,
}: IAccountProps) => {
  const [account, setAccount] = useState<User | null>(null);

  const contextProvider = {
    account,
    setAccount,
  };
  return (
    <AccountContext.Provider value={contextProvider}>
      {children}
    </AccountContext.Provider>
  );
};
export default AccountProvider;
