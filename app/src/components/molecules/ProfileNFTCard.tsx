import { useLancer } from "@/src/providers";
import { ProfileNFT, User } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { Button, ContributorInfo } from "..";
import AddReferrerModal from "./AddReferrerModal";
dayjs.extend(relativeTime);

const ProfileNFTCard = ({
  profileNFT,
  user,
}: {
  profileNFT: ProfileNFT;
  user: User;
}) => {
  const { currentUser } = useLancer();
  const [showReferrerModal, setShowReferrerModal] = useState(false);

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
        {currentUser?.githubLogin === user.githubLogin &&
          currentUser.referrers.length === 0 && (
            <>
              <div className="divider"></div>

              <h4>Referrer</h4>

              <Button
                onClick={() => {
                  setShowReferrerModal(!showReferrerModal);
                }}
                style="text"
              >
                Add Referrer
              </Button>
            </>
          )}
        {user.referrers.length !== 0 && (
          <>
            <div className="divider"></div>

            <h4>Referrer</h4>
            <ContributorInfo user={user.referrers[0].referrer} />
          </>
        )}
      </div>

      <AddReferrerModal
        setShowModal={setShowReferrerModal}
        showModal={showReferrerModal}
      />
    </>
  );
};

export default ProfileNFTCard;
