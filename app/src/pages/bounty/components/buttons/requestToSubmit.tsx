import { addSubmitterFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const RequestToSubmit = () => {
  const {
    currentUser,
    currentBounty,
    wallet,
    provider,
    program,
    setCurrentBounty,
    setCurrentUser,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    if (currentUser.id === currentBounty.creator.userid) {
      // If we are the creator, then skip requesting and add self as approved
      const signature = await addSubmitterFFA(
        wallet.publicKey,
        currentBounty.escrow,
        wallet,
        program,
        provider
      );
      currentUser.relations.push(BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter);
      const { updatedBounty } = await mutateAsync({
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: currentUser.relations,
        state: IssueState.IN_PROGRESS,
        walletId: currentUser.currentWallet.id,
        escrowId: currentBounty.escrowid,
        signature,
        label: "add-approved-submitter",
      });

      setCurrentBounty(updatedBounty);
    } else {
      // Request to submit. Does not interact on chain
      const { updatedBounty } = await mutateAsync({
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter],
      });

      setCurrentBounty(updatedBounty);
    }
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Apply
    </button>
  );
};
