import { ProfileNFT, User } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useMemo, useState } from "react";
import { Button } from "..";
import AddReferrerModal from "./AddReferrerModal";
import { useReferral } from "@/src/providers/referralProvider";
import { Copy } from "react-feather";
import { Treasury } from "@ladderlabs/buddy-sdk";
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
  const { referralId, initialized, createReferralMember, claimables, claim } =
    useReferral();

  const handleCreateLink = useCallback(async () => {
    await createReferralMember();

    // TODO: success logic
  }, [initialized]);

  const handleClaim = async (amount: number, treasury: Treasury) => {
    if (amount) await claim(treasury);
  };

  const claimButtons = useMemo(() => {
    return claimables.map((claimable) => (
      <Button onClick={() => handleClaim(claimable.amount, claimable.treasury)}>
        Claim {claimable.amount} USDC
      </Button>
    ));
  }, [claimables]);

  return (
    <>
      <div className="profile-nft" id="profile-nft">
        {/* <img src={profileNFT.image} className="profile-picture" /> */}
        <img
          src={`https://avatars.githubusercontent.com/u/${
            githubId.split("|")[1]
          }?s=256&v=4`}
          className="profile-picture"
        />

        <div className="profile-nft-header">
          <h4>{profileNFT.name}</h4>
          <div>{profileNFT.reputation} Pts</div>
        </div>

        <div className="profile-section" id="badges-section">
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

        <div className="profile-section" id="certificates-section">
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

        {claimButtons.length ? (
          <>
            <div className="divider"></div>
            <h4>Claim your rewards</h4>
            {claimButtons}
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
