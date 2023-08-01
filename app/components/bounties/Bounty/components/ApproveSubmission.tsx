import { approveRequestFFA } from "@/escrow/adapters";
import { PROFILE_PROJECT_PARAMS, BOUNTY_PROJECT_PARAMS } from "@/src/constants";
import { BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useReferral } from "@/src/providers/referralProvider";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { decimalToNumber } from "@/src/utils";
import { api } from "@/src/utils/api";
import { Button } from "@/components";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { createUnderdogClient } from "@underdog-protocol/js";

const underdogClient = createUnderdogClient({});

const ApproveSubmission = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();

  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { programId: buddylinkProgramId } = useReferral();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

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
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: [BOUNTY_USER_RELATIONSHIP.Completer],
      state: BountyState.COMPLETE,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "complete-bounty",
    });

    setCurrentBounty(updatedBounty);

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
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Approve
    </Button>
  );
};

export default ApproveSubmission;
