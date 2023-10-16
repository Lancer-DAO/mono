import { BountyUserType } from "@/prisma/queries/bounty";
import { Bounty, BountyPreview } from "@/types/";
import {
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useState,
} from "react";

export enum QuestActionView {
  SubmitApplication = "submit-application", // one-way (Lancer)
  ViewApplicants = "view-applicants", // one-way (client)
  Chat = "chat", // two-way (client, Lancer)
  SubmitUpdate = "submit-update", // one-way (Lancer)
  ViewUpdate = "view-update", // one-way (client)
}

export enum QuestApplicationView {
  ProfileInfo = "profile-info",
  SubmitQuote = "submit-quote",
}
export interface IBountyContext {
  currentBounty: Bounty;
  allBounties: BountyPreview[];
  myQuests: BountyPreview[];
  questsPage: number;
  maxPages: number;
  currentActionView: QuestActionView;
  currentApplicationView: QuestApplicationView;
  selectedSubmitter: BountyUserType | null;
  hasApplied?: boolean;
  setCurrentBounty: (bounty: Bounty) => void;
  setAllBounties: (bounty: BountyPreview[]) => void;
  setMyQuests: (bounty: BountyPreview[]) => void;
  setQuestsPage: (page: number) => void;
  setMaxPages: (pages: number) => void;
  setCurrentActionView: (view: QuestActionView) => void;
  setCurrentApplicationView: (view: QuestApplicationView) => void;
  setSelectedSubmitter: (submitter: BountyUserType | null) => void;
  setHasApplied?: (hasApplied: boolean) => void;
}

export const BountyContext = createContext<IBountyContext>({
  currentBounty: null,
  allBounties: [],
  myQuests: [],
  questsPage: 0,
  maxPages: 0,
  currentActionView: null,
  currentApplicationView: QuestApplicationView.ProfileInfo,
  selectedSubmitter: null,
  hasApplied: false,
  setCurrentBounty: () => null,
  setAllBounties: () => null,
  setMyQuests: () => null,
  setQuestsPage: () => null,
  setMaxPages: () => null,
  setCurrentActionView: () => null,
  setCurrentApplicationView: () => null,
  setSelectedSubmitter: () => null,
  setHasApplied: () => null,
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
  const [currentActionView, setCurrentActionView] = useState<QuestActionView>();
  const [selectedSubmitter, setSelectedSubmitter] =
    useState<BountyUserType | null>();
  const [hasApplied, setHasApplied] = useState(false);
  const [currentApplicationView, setCurrentApplicationView] =
    useState<QuestApplicationView>(QuestApplicationView.ProfileInfo);

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
    currentActionView,
    setCurrentActionView,
    currentApplicationView,
    setCurrentApplicationView,
    selectedSubmitter,
    setSelectedSubmitter,
    hasApplied,
    setHasApplied,
  };
  return (
    <BountyContext.Provider value={contextProvider}>
      {children}
    </BountyContext.Provider>
  );
};
export default BountyProvider;
