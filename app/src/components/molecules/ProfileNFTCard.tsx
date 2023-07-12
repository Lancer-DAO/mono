import { ProfileNFT, User } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useState } from "react";
import { Button } from "..";
import AddReferrerModal from "./AddReferrerModal";
import { useReferral } from "@/src/providers/referralProvider";
import { Copy } from "react-feather";
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
  const [showReferrerModal, setShowReferrerModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { referralId, initialized, createReferralMember, claimable, claim } =
    useReferral();

  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const handleClaim = useCallback(async () => {
    if (claimable) {
      await claim();
      // TODO: success logic
    }
  }, [claimable, initialized]);

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
    <div className="w-full md:w-[40%] px-5">
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
            <>
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
              <div className="text-base">{isCopied ? "Copied!" : ""}</div>
            </>
          ) : (
            <div>
              <Button className="mb-6" onClick={handleCreateLink}>
                Generate link
              </Button>
            </div>
          )}
        </div>

        <div>
          {claimable && claimable > 0 ? (
            <>
              <div className="divider"></div>
              <h4>Claim your rewards</h4>

              <Button onClick={handleClaim}>Claim {claimable} USDC</Button>
            </>
          ) : null}
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
