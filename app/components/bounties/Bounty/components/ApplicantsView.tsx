import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { FC } from "react";
import QuestUser from "./QuestUser";
import { SubmitterSection } from "./SubmitterSection";

const ApplicantsView: FC = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  // if (!currentBounty || !currentBounty.isCreator) return null;
  if (!currentBounty) return null;

  return (
    <div className="flex flex-col gap-5">
      {currentBounty.deniedRequesters.length > 0 && (
        <QuestUser
          title="Denied Requesters"
          users={currentBounty.deniedRequesters.map(
            (submitter) => submitter.user
          )}
        />
      )}
      {currentBounty.requestedSubmitters.length > 0 && (
        <>
          <label className="font-bold text-sm">Requested Applicants</label>
          {currentBounty.requestedSubmitters.map((submitter, index) => (
            <SubmitterSection
              submitter={submitter}
              type="requested"
              key={`requested-submitters-${submitter.userid}`}
              index={index}
            />
          ))}
        </>
      )}
      {currentBounty.approvedSubmitters.length > 0 && (
        <>
          <label className="font-bold text-sm">Approved Applicants</label>
          {currentBounty.approvedSubmitters.map((submitter, index) => (
            <SubmitterSection
              submitter={submitter}
              type="approved"
              key={`approved-submitters-${submitter.userid}`}
              index={index}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default ApplicantsView;
