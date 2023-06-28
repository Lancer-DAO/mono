import { ProfileNFT } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const ProfileNFTCard = ({
  profileNFT,
  githubId,
}: {
  profileNFT: ProfileNFT;
  githubId: string;
}) => {
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
      </div>
    </>
  );
};

export default ProfileNFTCard;
