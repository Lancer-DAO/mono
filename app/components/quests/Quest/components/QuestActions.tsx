import { FC, useEffect, useState } from "react";
import { BountyUserType } from "@/prisma/queries/bounty";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState } from "@/types";
import ApplicantsView from "./ApplicantsView";
import ChatView from "./ChatView";
import LancerApplicationView from "./LancerApplicationView";
import LancerSubmitUpdateView from "./LancerSubmitUpdateView";
import UpdateView from "./UpdateView";

export enum QuestActionView {
  SubmitApplication = "submit-application", // one-way (Lancer)
  SubmitQuote = "submit-quote", // one-way (Lancer)
  ViewApplicants = "view-applicants", // one-way (client)
  Chat = "chat", // two-way (client, Lancer)
  SubmitUpdate = "submit-update", // one-way (Lancer)
  ViewUpdate = "view-update", // one-way (client)
}

const QuestActions: FC = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  // TODO: set loading state, check for user status (creator or applicant?)
  // and then set initial view based on that
  const [currentActionView, setCurrentActionView] = useState<QuestActionView>();
  const [selectedSubmitter, setSelectedSubmitter] =
    useState<BountyUserType | null>();
  const [hasApplied, setHasApplied] = useState(false);

  // check if user has applied
  useEffect(() => {
    if (!currentBounty || !currentUser) return;
    const hasApplied = !!currentBounty.currentUserRelationsList;
    setHasApplied(hasApplied);
  }, [currentBounty, currentUser]);

  useEffect(() => {
    if (!!currentUser && !currentBounty.isCreator) {
      // is not the creator
      if (hasApplied && currentBounty.state !== BountyState.CANCELED) {
        // lancer has applied to this quest already
        setCurrentActionView(QuestActionView.Chat);
      } else {
        // lancer needs to apply
        setCurrentActionView(QuestActionView.SubmitApplication);
      }
    } else if (!!currentUser && currentBounty.isCreator) {
      // is the creator
      if (currentBounty.approvedSubmitters.length === 0) {
        // has not approved an applicant to work on quest yet
        setCurrentActionView(QuestActionView.ViewApplicants);
      } else {
        // has approved an applicant to work on quest
        setCurrentActionView(QuestActionView.Chat);
      }
    }
  }, [currentUser, currentBounty, hasApplied]);

  if (
    !currentUser ||
    !currentBounty ||
    currentBounty.isExternal ||
    (currentUser.class === "Noble" && !currentBounty.isCreator)
  )
    return null;

  return (
    <div
      className={`bg-white h-fit w-full min-w-[610px] border border-neutral200 rounded-lg overflow-hidden ${
        currentActionView === QuestActionView.Chat && "max-h-[44.5rem]"
      }`}
    >
      {currentActionView === QuestActionView.SubmitApplication && (
        <LancerApplicationView
          hasApplied={hasApplied}
          setCurrentActionView={setCurrentActionView}
        />
      )}
      {currentActionView === QuestActionView.ViewApplicants && (
        <ApplicantsView
          setCurrentActionView={setCurrentActionView}
          selectedSubmitter={selectedSubmitter}
          setSelectedSubmitter={setSelectedSubmitter}
        />
      )}
      {currentActionView === QuestActionView.Chat && (
        <ChatView
          selectedSubmitter={selectedSubmitter}
          setCurrentActionView={setCurrentActionView}
        />
      )}
      {currentActionView === QuestActionView.SubmitUpdate && (
        <LancerSubmitUpdateView />
      )}
      {currentActionView === QuestActionView.ViewUpdate && (
        <UpdateView
          selectedSubmitter={selectedSubmitter}
          setCurrentActionView={setCurrentActionView}
        />
      )}
    </div>
  );
};

export default QuestActions;
