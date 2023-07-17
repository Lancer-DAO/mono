import { ProfileNFT, User } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useMemo, useState } from "react";
import { Button, CoinflowOfframp } from "@/components";
import AddReferrerModal from "./AddReferrerModal";
import { useReferral } from "@/src/providers/referralProvider";
import { Copy } from "react-feather";
import { Treasury } from "@ladderlabs/buddy-sdk";
import { useLancer } from "@/src/providers";
dayjs.extend(relativeTime);

// TODO: change to config file
const SITE_URL = "lancer.so";

const ProfileNFTCard = ({
  profileNFT,
  githubId,
}: {
  profileNFT: ProfileNFT;
  githubId: string;
}) => {
  const [showCoinflow, setShowCoinflow] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();
  const { currentWallet } = useLancer();

  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const handleClaim = async (amount: number, treasury: Treasury) => {
    if (amount) await claim(treasury);
  };

  const claimButtons = useMemo(() => {
    return claimables.map((claimable) => (
      <Button
        disabled={!currentWallet.publicKey}
        onClick={() => handleClaim(claimable.amount, claimable.treasury)}
      >
        Claim {claimable.amount} USDC
      </Button>
    ));
  }, [claimables]);

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

  return (
    <div className="w-full md:w-[40%] px-5 pb-20">
      <div className="flex flex-col gap-3">
        {/* <img src={profileNFT.image} className="profile-picture" /> */}
        <img
          src={`https://avatars.githubusercontent.com/u/${
            githubId.split("|")[1]
          }?s=256&v=4`}
          className="profile-picture"
        />

        <div className="flex items-center justify-between">
          <h4 className="text-xl">{profileNFT.name.split("for ")[1]}</h4>
          <div>{profileNFT.reputation} Pts</div>
        </div>

        <div>
          <div className="divider"></div>
          <h4>Badges</h4>
          {profileNFT.badges?.length > 0 ? (
            <div className="tag-list">
              {profileNFT.badges.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          ) : (
            <div>No badges yet!</div>
          )}
        </div>

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

        <div>
          <div className="divider"></div>

          <h4>Refer your friends</h4>
          {referralId && initialized ? (
            <div className="relative w-full">
              <div className="flex items-center gap-2">
                <span className="text-blue-300">
                  {SITE_URL}/?r={referralId}
                </span>
                <Copy
                  className="cursor-pointer"
                  onClick={() =>
                    handleCopyClick(`${SITE_URL}/?r=${referralId}`)
                  }
                />
              </div>
              <div className="absolute right-0 text-base">
                {isCopied ? "Copied!" : ""}
              </div>
            </div>
          ) : (
            <div>
              <Button className="mb-6" onClick={handleCreateLink}>
                Generate link
              </Button>
            </div>
          )}
        </div>

        <div>
          {claimables &&
          claimables.filter((claimable) => claimable.amount > 0).length > 0 ? (
            <>
              <div className="divider"></div>
              <h4>Claim your rewards</h4>
              {claimButtons}
            </>
          ) : null}
        </div>
        <div>
          <div className="divider" />
          <div className="my-[10px]">
            <Button
              onClick={() => {
                setShowCoinflow(!showCoinflow);
              }}
            >
              Cash Out
            </Button>
          </div>

          {showCoinflow && <CoinflowOfframp />}
        </div>
      </div>

      <AddReferrerModal
        setShowModal={setShowReferrerModal}
        showModal={showReferrerModal}
      />
    </div>
  );
};

export default ProfileNFTCard;
