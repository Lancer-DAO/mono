import { ProfileNFT } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const ProfileNFTCard = ({
  profileNFT,
  githubLogin,
  githubId,
}: {
  profileNFT: ProfileNFT;
  githubLogin: string;
  githubId: string;
}) => {
  return (
    <>
      <div className="profile-nft">
        {/* <img src={profileNFT.image} className="profile-picture" /> */}
        <img
          src={`https://avatars.githubusercontent.com/u/${
            githubId.split("|")[1]
          }?s=60&v=4`}
          className="profile-picture"
        />

        <div className="profile-nft-header">
          <h4>{githubLogin}</h4>
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
      </div>
    </>
  );
};

export default ProfileNFTCard;
