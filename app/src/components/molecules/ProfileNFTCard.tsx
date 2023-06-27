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
  user,
}: {
  profileNFT: ProfileNFT;
  user: User;
}) => {
  const [showReferrerModal, setShowReferrerModal] = useState(false);
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

  return (
    <>
      <div className="profile-nft">
        {/* <img src={profileNFT.image} className="profile-picture" /> */}
        <img
          src={`https://avatars.githubusercontent.com/u/${
            user.githubId.split("|")[1]
          }?s=60&v=4`}
          className="profile-picture"
        />

        <div className="profile-nft-header">
          <h4>{user.githubLogin}</h4>
          <div>{profileNFT.reputation} Pts</div>
        </div>
        {profileNFT.badges?.length > 0 && (
          <div className="profile-section">
            <div className="divider"></div>
            <h4>Badges</h4>
            <div className="tag-list">
              {profileNFT.badges.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}
        {profileNFT.certifications?.length > 0 && (
          <div className="profile-section">
            <div className="divider"></div>

            <h4>Certificates</h4>
            <div className="tag-list">
              {profileNFT.certifications.map((badge) => (
                <div className="tag-item" key={badge}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="divider"></div>

        <h4>Last Updated</h4>
        <div>{profileNFT.lastUpdated?.fromNow()}</div>

        <div className="divider"></div>

        <h4>Refer your friends</h4>
        {referralId && initialized ? (
          <div className="referral">
            <div className="referral-link">
              <span>
                {SITE_URL}/?r={referralId}
              </span>
              <Copy />
            </div>
          </div>
        ) : (
          <div>
            <Button onClick={handleCreateLink}>Generate link</Button>
          </div>
        )}

        {claimable ? (
          <>
            <div className="divider"></div>
            <h4>Claim your rewards</h4>

            <Button onClick={handleClaim}>Claim {claimable} USDC</Button>
          </>
        ) : null}
      </div>

      <AddReferrerModal
        setShowModal={setShowReferrerModal}
        showModal={showReferrerModal}
      />
    </>
  );
};

export default ProfileNFTCard;
