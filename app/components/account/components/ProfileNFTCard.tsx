import { AddReferrerModal, Button, CoinflowOfframp } from "@/components";
import { IS_CUSTODIAL } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useReferral } from "@/src/providers/referralProvider";
import { api } from "@/src/utils/api";
import { ProfileNFT } from "@/types/";
import { Treasury } from "@ladderlabs/buddy-sdk";
import * as Prisma from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy } from "react-feather";

dayjs.extend(relativeTime);

const SITE_URL = `https://${IS_CUSTODIAL ? "app" : "pro"}.lancer.so/account?r=`;

export const ProfileNFTCard = ({
  profileNFT,
  picture,
  githubId,
}: {
  profileNFT: ProfileNFT;
  picture: string;
  githubId: string;
}) => {
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();
  const { currentUser } = useUserWallet();

  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const [mints, setMints] = useState<Prisma.Mint[]>([]);

  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const handleClaim = async (amount: number, treasury: Treasury) => {
    if (amount) await claim(treasury);
  };

  const claimButtons = useMemo(() => {
    return claimables
      .filter((claimable) => claimable.amount !== 0)
      .map((claimable) => {
        const claimMintKey = claimable.treasury.account.mint.toString();
        const claimMint = mints.filter(
          (mint) => mint.publicKey === claimMintKey
        )[0];
        return (
          <Button
            onClick={() => handleClaim(claimable.amount, claimable.treasury)}
          >
            Claim {claimable.amount} {claimMint?.ticker}
          </Button>
        );
      });
  }, [claimables, mints]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCopyClick = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => setIsCopied(false), 2000); // Reset the isCopied state after 2 seconds
  };

  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
    };
    if (!!currentUser) {
      getMints();
    }
  }, [currentUser]);

  return (
    <div className="w-full md:w-[460px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <div className="flex flex-col gap-3">
        {(picture || githubId) && (
          <Image
            src={
              picture
                ? picture
                : "/assets/images/Lancer-Green-No-Background-p-800.png"
            }
            width={58}
            height={58}
            alt={profileNFT.name.split("for ")[1]}
            className="rounded-full overflow-hidden"
          />
        )}

        <div className="flex items-start gap-16 pb-6">
          {/* Labels column */}
          <div className="flex flex-col gap-4 text-lg">
            <p>name</p>
            {/* <p>username</p> */}
            <p>industry</p>
            {/* <p>location</p> */}
            <p>exp</p>
          </div>
          {/* Data column */}
          <div className="flex flex-col gap-4 text-lg font-bold">
            <p>{currentUser?.name}</p>
            {/* <p>{currentUser?.name}</p> */}
            {/* hard coded */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/icons/eng.png"
                width={25}
                height={25}
                alt="eng"
              />
              <p className="font-bold">Engineering</p>
            </div>
            {/* <p>[location]</p> */}
            <p>{profileNFT.reputation} pts</p>
          </div>
        </div>

        {/* 
        <div>
          <div className="divider"></div>

          <h4>Certificates</h4>
          {profileNFT.certifications?.length > 0 ? (
            <div className="tag-list">
              {profileNFT.certifications.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          ) : (
            <div>No certificates yet!</div>
          )}
        </div>
        <div>
          <div className="divider"></div>

          <h4>Last Updated</h4>
          <div>{profileNFT.lastUpdated?.fromNow()}</div>
        </div>

      <AddReferrerModal
        setShowModal={setShowReferrerModal}
        showModal={showReferrerModal}
      /> */}
      </div>
    </div>
  );
};
