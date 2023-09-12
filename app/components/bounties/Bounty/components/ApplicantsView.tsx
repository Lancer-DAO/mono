import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { FC } from "react";
import QuestUser from "./QuestUser";
import { SubmitterSection } from "./SubmitterSection";
import ActionsCardBanner from "./ActionsCardBanner";
import ApplicantProfileCard from "./ApplicantProfileCard";

const ApplicantsView: FC = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  if (!currentBounty || !currentBounty.isCreator) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner title="Apply to this Quest">
        {/* TODO: add fund CTA */}
      </ActionsCardBanner>
      <div className="flex flex-col gap-5 px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="title-text">{`${currentBounty.requestedSubmitters.length} Members on Applicants List`}</p>
          <p className="text-neutral500 text">
            You need to deposit a fixed fee in an escrow wallet first to be able
            to proceed. We are committed to keep a curated platform with serious
            projects only.
          </p>
        </div>
        <p className="title-text">Pending</p>
        {currentBounty.requestedSubmitters.length > 0 &&
          currentBounty.requestedSubmitters.map((submitter, index) => (
            <ApplicantProfileCard user={submitter} key={index} />
          ))}
      </div>
    </div>
  );
};

export default ApplicantsView;

//    {currentBounty.deniedRequesters.length > 0 && (
//     <QuestUser
//       title="Denied Requesters"
//       users={currentBounty.deniedRequesters.map(
//         (submitter) => submitter.user
//       )}
//     />
//   )}
//   {currentBounty.requestedSubmitters.length > 0 && (
//     <>
//       <label className="font-bold text-sm">Requested Applicants</label>
//       {currentBounty.requestedSubmitters.map((submitter, index) => (
//         <SubmitterSection
//           submitter={submitter}
//           type="requested"
//           key={`requested-submitters-${submitter.userid}`}
//           index={index}
//         />
//       ))}
//     </>
//   )}
//   {currentBounty.approvedSubmitters.length > 0 && (
//     <>
//       <label className="font-bold text-sm">Approved Applicants</label>
//       {currentBounty.approvedSubmitters.map((submitter, index) => (
//         <SubmitterSection
//           submitter={submitter}
//           type="approved"
//           key={`approved-submitters-${submitter.userid}`}
//           index={index}
//         />
//       ))}
//     </>
//   )}
// </div>
