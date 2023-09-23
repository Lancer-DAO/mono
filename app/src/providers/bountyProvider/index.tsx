import { Bounty, BountyPreview } from "@/types/";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";
export interface IBountyContext {
  currentBounty: Bounty;
  allBounties: BountyPreview[];
  myQuests: BountyPreview[];
  setCurrentBounty: (bounty: Bounty) => void;
  setAllBounties: (bounty: BountyPreview[]) => void;
  setMyQuests: (bounty: BountyPreview[]) => void;
}

export const BountyContext = createContext<IBountyContext>({
  currentBounty: null,
  allBounties: [],
  myQuests: [],
  setCurrentBounty: () => null,
  setAllBounties: () => null,
  setMyQuests: () => null,
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
  const [allBounties, setAllBounties] = useState<BountyPreview[] | null>(null);
  const [myQuests, setMyQuests] = useState<BountyPreview[]>([]);

  const contextProvider = {
    currentBounty,
    setCurrentBounty,
    allBounties,
    setAllBounties,
    myQuests,
    setMyQuests,
  };
  return (
    <BountyContext.Provider value={contextProvider}>
      {children}
    </BountyContext.Provider>
  );
};
export default BountyProvider;
