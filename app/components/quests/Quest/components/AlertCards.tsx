import { FC } from "react";
import AlertCard from "./AlertCard";
import { useBounty } from "@/src/providers/bountyProvider";
import { useUserWallet } from "@/src/providers";
import { BountyState } from "@/types";
import { api } from "@/src/utils";

const AlertCards: FC = () => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();

  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  return (
    <>
      {currentBounty.isRequestedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Application sent!"
            description="Chat with the creator and submit a quote to kick things off."
          />
        </div>
      )}
      {currentBounty.isCreator && !!update && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Update received!"
            description="You have received a project update from your Lancer. Review it now."
          />
        </div>
      )}
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
      {currentBounty.users.some(
        (bountyUser) => bountyUser.userid === currentUser?.id
      ) &&
        currentBounty.state === BountyState.COMPLETE && (
          <div className="px-5 pt-5">
            <AlertCard
              type="positive"
              title="Quest Complete!"
              description="The Quest has been completed and the funds have been released to the Lancer."
            />
          </div>
        )}
    </>
  );
};

export default AlertCards;
