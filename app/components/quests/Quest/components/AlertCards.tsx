import { FC } from "react";
import AlertCard from "./AlertCard";
import { useBounty } from "@/src/providers/bountyProvider";
import { useUserWallet } from "@/src/providers";
import { BountyState } from "@/types";

const AlertCards: FC = () => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  return (
    <>
      {currentBounty.isRequestedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Nice!"
            description="Your application has been sent! Now, chat with the creator to get more information about the Quest. Then, submit a detailed Quote!"
          />
        </div>
      )}
      {/* {currentBounty.isShortlistedLancer &&
        Number(currentBounty.escrow.amount) > 0 && (
          <div className="px-5 pt-5">
            <AlertCard
              type="positive"
              title="Good news!"
              description="You have been added to the creator's shortlist. You can now chat with them to see if you're a good fit for each other!"
            />
          </div>
        )} */}
      {currentBounty.isApprovedSubmitter &&
        currentBounty.state !== BountyState.CANCELED &&
        Number(currentBounty.escrow.amount) > 0 && (
          <div className="px-5 pt-5">
            <AlertCard
              type="positive"
              title="Congrats!"
              description="You have been selected for this Quest. You can now submit updates to the creator and work towards completing the Quest!"
            />
          </div>
        )}
      {currentBounty.isApprovedSubmitter &&
        currentBounty.state === BountyState.CANCELED && (
          <div className="px-5 pt-5">
            <AlertCard
              type="negative"
              title="Canceled"
              description="The creator of this Quest has decided to cancel this Quest. You can still apply to other Quests!"
            />
          </div>
        )}
      {currentBounty.isDeniedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="negative"
            title="Not Selected"
            description="The creator of this Quest has decided to go with another Lancer. You can still apply to other Quests!"
          />
        </div>
      )}
      {!currentUser.hasBeenApproved && (
        <div className="px-5 pt-5">
          <AlertCard
            type="negative"
            title="Not Approved"
            description="You Must Be Approved to Apply to Quests"
          />
        </div>
      )}
    </>
  );
};

export default AlertCards;
