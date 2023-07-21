import { Bounty } from "@/src/types";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IBountyContext {
  currentBounty: Bounty;
  setCurrentBounty: (bounty: Bounty) => void;
}

export const BountyContext = createContext<IBountyContext>({
  currentBounty: null,
  setCurrentBounty: () => null,
});

export function useBounty(): IBountyContext {
  return useContext(BountyContext);
}

interface IBountyState {
  children?: React.ReactNode;
}
interface IBountyProps {
  children?: ReactNode;
}

const BountyProvider: FunctionComponent<IBountyState> = ({
  children,
}: IBountyProps) => {
  const [currentBounty, setCurrentBounty] = useState<Bounty | null>(null);

  const contextProvider = {
    currentBounty,
    setCurrentBounty,
  };
  return (
    <BountyContext.Provider value={contextProvider}>
      {children}
    </BountyContext.Provider>
  );
};
export default BountyProvider;
