import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { FC, useEffect, useState } from "react";
// import { BountyActions } from "./BountyActions";
import ApplicantsView from "./ApplicantsView";
import LancerApplyView from "./LancerApplyView";
import LancerSubmitUpdateView from "./LancerSubmitUpdateView";
import QuestUser from "./QuestUser";

export enum QuestActionView {
  Apply = "apply", // one-way (Lancer)
  ViewApplicants = "view-applicants", // one-way (client)
  Chat = "chat", // two-way (client, Lancer)
  SubmitQuote = "submit-quote", // one-way (Lancer)
  ViewQuote = "view-quote", // one-way (client)
  SubmitUpdate = "submit-update", // one-way (Lancer)
  ViewUpdate = "view-update", // one-way (client)
}

const QuestActions: FC = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  // TODO: set loading state, check for user status (creator or applicant?)
  // and then set initial view based on that
  const [currentActionView, setCurrentActionView] = useState<QuestActionView>();

  useEffect(() => {
    if (!!currentUser && !currentBounty.isCreator) {
      setCurrentActionView(QuestActionView.SubmitUpdate);
    } else if (!!currentUser && currentBounty.isCreator) {
      setCurrentActionView(QuestActionView.ViewApplicants);
    }
  }, [currentUser, currentBounty]);

  if (!currentUser || !currentBounty) return null;

  return (
    <div className="bg-white w-[610px] border border-neutral200 rounded-lg overflow-hidden">
      {/* {currentBounty.isCreator ? ( */}
      {/* {currentBounty?.creator && (
          <QuestUser title="Client" users={[currentBounty.creator.user]} />
        )} */}
      {currentActionView === QuestActionView.Apply && <LancerApplyView />}
      {currentActionView === QuestActionView.ViewApplicants && (
        <ApplicantsView />
      )}
      {currentActionView === QuestActionView.SubmitUpdate && <LancerSubmitUpdateView />}

      {/* {currentBounty &&
            currentBounty.currentSubmitter &&
            currentBounty.isCreator && (
              <QuestUser
                title="Submissions"
                users={[currentBounty.currentSubmitter.user]}
              />
            )}
          {currentBounty.isCreator &&
            currentBounty.changesRequestedSubmitters.length > 0 && (
              <QuestUser
                title="Changes Requested"
                users={currentBounty.changesRequestedSubmitters.map(
                  (submitter) => submitter.user
                )}
              />
            )}
          {currentBounty.isCreator &&
            currentBounty.deniedSubmitters.length > 0 && (
              <QuestUser
                title="Denied Submitters"
                users={currentBounty.deniedSubmitters.map(
                  (submitter) => submitter.user
                )}
              />
            )}
          {currentBounty.completer && (
            <QuestUser
              title="Completed By"
              users={[currentBounty.completer.user]}
            />
          )}
          {currentBounty.isCreator &&
            currentBounty.votingToCancel.length > 0 && (
              <QuestUser
                title="Voting To Cancel"
                users={currentBounty.votingToCancel.map(
                  (submitter) => submitter.user
                )}
              />
            )}
          {currentBounty.isCreator && currentBounty.needsToVote.length > 0 && (
            <QuestUser
              title="Votes Needed to Cancel"
              users={currentBounty.needsToVote.map(
                (submitter) => submitter.user
              )}
            />
          )} */}
      {/* {!!currentBounty && <BountyActions />} */}
      {/* ) : (
        <div className="text-industryRedBorder">
          You must be approved to interact with Quests
        </div>
      )} */}
    </div>
  );
};

export default QuestActions;
