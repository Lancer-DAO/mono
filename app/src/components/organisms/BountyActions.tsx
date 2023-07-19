import { Button, LoadingBar } from "@/src/components";
import {
  // addSubmitterFFA,
  approveRequestFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
  voteToCancelFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  // Contributor,
  BountyState,
  BOUNTY_USER_RELATIONSHIP,
} from "@/src/types";
import { useState } from "react";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { decimalToNumber } from "@/src/utils";
import {
  BONK_MINT,
  BOUNTY_PROJECT_PARAMS,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
  USDC_MINT,
} from "@/src/constants";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { useReferral } from "@/src/providers/referralProvider";
import {
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
} from "@/src/constants/tutorials";
const underdogClient = createUnderdogClient({});

const BountyActions = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    currentTutorialState,
    setCurrentTutorialState,
  } = useLancer();
  const [hoveredButton, setHoveredButton] = useState("none");

  // if (false) {
  //   return <LoadingBar title="Loading On Chain Details" />;
  // }
  if (currentBounty.state === BountyState.COMPLETE) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <Button disabled id="bounty-completed">
          Bounty Completed
        </Button>
      </div>
    );
  }
  if (currentBounty.state === BountyState.CANCELED) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <Button disabled id="bounty-canceled">
          Bounty Canceled
        </Button>
      </div>
    );
  }
  if (!currentBounty.currentUserRelationsList) {
    return (
      <div className="bounty-buttons" id="bounty-actions">
        <RequestToSubmit />
      </div>
    );
  }

  return (
    <div className="bounty-buttons" id="bounty-actions">
      <>
        {currentBounty.isCreator &&
          ((!!currentTutorialState &&
            currentTutorialState?.title ===
              BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title) ||
            !IS_MAINNET) &&
          currentBounty.currentUserRelationsList.length < 2 && (
            <RequestToSubmit />
          )}
        {currentBounty.isRequestedSubmitter && (
          <Button disabled id="request-pending">
            Request Pending
          </Button>
        )}
        {currentBounty.isDeniedRequester && (
          <Button disabled id="request-denied">
            Submission Request Denied
          </Button>
        )}
        {currentBounty.isApprovedSubmitter &&
          !currentBounty.currentSubmitter && (
            <div
              className="hover-tooltip-wrapper"
              onMouseEnter={() => {
                setHoveredButton("submit");
              }}
              onMouseLeave={() => {
                setHoveredButton("none");
              }}
            >
              <SubmitRequest disabled={!currentWallet.publicKey} />
            </div>
          )}
        {currentBounty.isCurrentSubmitter && !currentBounty.isCreator && (
          <Button disabled id="submission-pending">
            Submission Pending Review
          </Button>
        )}
        {currentBounty.isDeniedSubmitter && (
          <Button disabled id="submission-denied">
            Submission Denied
          </Button>
        )}
        {currentBounty.isChangesRequestedSubmitter && <SubmitRequest />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <ApproveSubmission />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <RequestChanges />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <DenySubmission />}
        {(currentBounty.isCreator ||
          currentBounty.isCurrentSubmitter ||
          currentBounty.isDeniedSubmitter ||
          currentBounty.isChangesRequestedSubmitter) &&
          !currentBounty.isVotingCancel && <VoteToCancel />}
        {currentBounty.isCreator && currentBounty.needsToVote.length === 0 && (
          <CancelEscrow />
        )}
        {currentBounty.completer && <Button disabled>Complete</Button>}
      </>
    </div>
  );
};

export default BountyActions;

const RequestToSubmit = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    setCurrentBounty,
    currentTutorialState,
    setCurrentTutorialState,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const { createReferralMember } = useReferral();

  const onClick = async () => {
    // Request to submit. Does not interact on chain
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    const result = await createReferralMember(
      new PublicKey(currentBounty.escrow.mint.publicKey)
    );

    const referralKey = result?.memberPDA;
    const signature = result?.txId;
    const { updatedBounty } = await mutateAsync({
      currentUserId: currentUser.id,
      bountyId: currentBounty.id,
      userId: currentUser.id,
      relations: currentBounty.isCreator
        ? [
            ...currentBounty.currentUserRelationsList,
            BOUNTY_USER_RELATIONSHIP.RequestedSubmitter,
          ]
        : [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter],
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      label: "request-to-submit",
      signature: "n/a",
    });

    setCurrentBounty(updatedBounty);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setTimeout(() => {
        setCurrentTutorialState({
          ...currentTutorialState,
          isRunning: true,
          currentStep: 2,
        });
      }, 100);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="apply-bounty-button"
    >
      Apply
    </Button>
  );
};

export const ApproveSubmission = () => {
  const {
    currentUser,
    currentBounty,
    provider,
    program,
    currentWallet,
    setCurrentBounty,
    currentTutorialState,
    setCurrentTutorialState,
  } = useLancer();
  const { programId: buddylinkProgramId } = useReferral();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  // const { currentAPIKey } = useLancer();

  const onClick = async () => {
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    // If we are the creator, then skip requesting and add self as approved
    const signature = await approveRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      buddylinkProgramId,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.Completer
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.COMPLETE,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "complete-bounty",
    });

    setCurrentBounty(updatedBounty);

    // const octokit = new Octokit({
    //   auth: currentAPIKey.token,
    // });
    // const octokitResponse = await octokit.request(
    //   "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
    //   {
    //     owner: currentBounty.repository.organization,
    //     repo: currentBounty.repository.name,
    //     pull_number: decimalToNumber(currentBounty.pullRequests[0].number),
    //   }
    // );

    const submitterKey = currentBounty.currentSubmitter.publicKey;
    const creatorKey = currentBounty.creator.publicKey;
    let nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: submitterKey,
      },
    });
    const reputationIncrease =
      100 * decimalToNumber(currentBounty.estimatedTime);
    if (nfts.totalResults > 0) {
      const profileNFT = nfts.results[0];
      underdogClient.partialUpdateNft({
        params: { ...PROFILE_PROJECT_PARAMS, nftId: nfts.results[0].id },
        body: {
          attributes: {
            lastUpdated: new Date().toISOString(),
            reputation:
              (profileNFT.attributes.reputation as number) + reputationIncrease,
          },
        },
      });
    }
    await underdogClient.createNft({
      params: BOUNTY_PROJECT_PARAMS,
      body: {
        name: `Bounty Completer: ${currentBounty.id}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: currentBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: currentBounty.tags.map((tag) => tag.name).join(","),
          role: "completer",
        },
        upsert: false,
        receiverAddress: submitterKey,
      },
    });

    nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: creatorKey,
      },
    });

    if (nfts.totalResults > 0) {
      const profileNFT = nfts.results[0];
      underdogClient.partialUpdateNft({
        params: { ...PROFILE_PROJECT_PARAMS, nftId: nfts.results[0].id },
        body: {
          attributes: {
            lastUpdated: new Date().toISOString(),
            reputation:
              (profileNFT.attributes.reputation as number) + reputationIncrease,
          },
        },
      });
    }

    await underdogClient.createNft({
      params: BOUNTY_PROJECT_PARAMS,
      body: {
        name: `Bounty Creator: ${currentBounty.id}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: currentBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: currentBounty.tags.map((tag) => tag.name).join(","),
          role: "creator",
        },
        upsert: false,
        receiverAddress: creatorKey,
      },
    });

    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: true,
        currentStep: 6,
      });
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="approve-bounty-button"
    >
      Approve
    </Button>
  );
};

export const CancelEscrow = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await cancelFFA(
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: [...currentBounty.currentUserRelationsList, "canceler"],
      state: BountyState.CANCELED,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "cancel-escrow",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="cancel-bounty-button"
    >
      Cancel
    </Button>
  );
};

export const DenySubmission = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.DeniedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: BountyState.ACCEPTING_APPLICATIONS,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "deny-submitter",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="deny-submission-bounty-button"
    >
      Deny
    </Button>
  );
};

export const RequestChanges = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),

      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: BountyState.IN_PROGRESS,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "request-changes",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="request-changes-bounty-button"
    >
      Request Changes
    </Button>
  );
};

export const SubmitRequest = ({ disabled }: { disabled?: boolean }) => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,

    currentTutorialState,
    setCurrentTutorialState,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }
    const signature = await submitRequestFFA(
      new PublicKey(currentBounty.creator.publicKey),
      currentWallet.publicKey,
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );
    const index = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    );

    if (index !== -1) {
      currentBounty.currentUserRelationsList.splice(index, 1);
    }

    const index2 = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );

    if (index2 !== -1) {
      currentBounty.currentUserRelationsList.splice(index2, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.AWAITING_REVIEW,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
    if (
      currentTutorialState?.title ===
        BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 1
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: true,
        currentStep: 2,
      });
    }
  };

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      id="submit-request-bounty-button"
      disabledText="Please open a PR closing the GitHub Issue before submitting"
    >
      Submit
    </Button>
  );
};

export const VoteToCancel = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bountyUsers.update.useMutation();
  const onClick = async () => {
    // If we are the submitter, vote to cancel as submitter
    let signature = "";
    if (currentBounty.isCreator || currentBounty.isCurrentSubmitter) {
      signature = await voteToCancelFFA(
        new PublicKey(currentBounty.creator.publicKey),
        new PublicKey(currentWallet.publicKey),
        currentBounty.escrow,
        currentWallet,
        program,
        provider
      );
    }

    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.VotingCancel
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.VOTING_TO_CANCEL,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "vote-to-cancel",
    });
    setCurrentBounty(updatedBounty);
  };

  return (
    <Button
      onClick={onClick}
      disabled={!currentWallet.publicKey}
      id="vote-to-cancel-bounty-button"
    >
      Vote To Cancel
    </Button>
  );
};
