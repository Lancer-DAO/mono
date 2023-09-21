import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { FC, useEffect, useState } from "react";
import ApplicantsView from "./ApplicantsView";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitUpdateView from "./LancerSubmitUpdateView";
import { BountyUserType } from "@/prisma/queries/bounty";
import ChatView from "./ChatView";

export enum QuestActionView {
  Apply = "apply", // one-way (Lancer)
  ViewApplicants = "view-applicants", // one-way (client)
  Chat = "chat", // two-way (client, Lancer)
  SubmitQuote = "submit-quote", // one-way (Lancer)
  ViewQuote = "view-quote", // one-way (client)
  SubmitUpdate = "submit-update", // one-way (Lancer)
  Ongoing = "ongoing", // two-way (client, Lancer), includes chat and submit update
  ViewUpdate = "view-update", // one-way (client)
}

const QuestActions: FC = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  // TODO: set loading state, check for user status (creator or applicant?)
  // and then set initial view based on that
  const [currentActionView, setCurrentActionView] = useState<QuestActionView>();
  const [selectedSubmitter, setSelectedSubmitter] =
    useState<BountyUserType | null>(null);

  useEffect(() => {
    if (!!currentUser && !currentBounty.isCreator) {
      // is not the creator
      if (currentBounty.isApprovedSubmitter) {
        // lancer has been approved to work on the quest
        setCurrentActionView(QuestActionView.Chat);
      } else {
        // lancer needs to apply or is waiting for approval
        setCurrentActionView(QuestActionView.Apply);
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
  }, [currentUser, currentBounty]);

  if (!currentUser || !currentBounty) return null;

  return (
    <div className="bg-white w-full min-w-[610px] border border-neutral200 rounded-lg overflow-hidden">
      {currentActionView === QuestActionView.Apply && (
        <LancerApplyView setCurrentActionView={setCurrentActionView} />
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
    </div>
  );
};

export default QuestActions;
