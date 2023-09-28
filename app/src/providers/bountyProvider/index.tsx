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
  questsPage: number;
  maxPages: number;
  setCurrentBounty: (bounty: Bounty) => void;
  setAllBounties: (bounty: BountyPreview[]) => void;
  setMyQuests: (bounty: BountyPreview[]) => void;
  setQuestsPage: (page: number) => void;
  setMaxPages: (pages: number) => void;
}

export const BountyContext = createContext<IBountyContext>({
  currentBounty: null,
  allBounties: [],
  myQuests: [],
  questsPage: 0,
  maxPages: 0,
  setCurrentBounty: () => null,
  setAllBounties: () => null,
  setMyQuests: () => null,
  setQuestsPage: () => null,
  setMaxPages: () => null,
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
  const [myQuests, setMyQuests] = useState<BountyPreview[] | null>(null);
  const [questsPage, setQuestsPage] = useState<number>(0);
  const [maxPages, setMaxPages] = useState<number>(0);

  const contextProvider = {
    currentBounty,
    setCurrentBounty,
    allBounties,
    setAllBounties,
    myQuests,
    setMyQuests,
    questsPage,
    setQuestsPage,
    maxPages,
    setMaxPages,
  };
  return (
    <BountyContext.Provider value={contextProvider}>
      {children}
    </BountyContext.Provider>
  );
};
export default BountyProvider;
