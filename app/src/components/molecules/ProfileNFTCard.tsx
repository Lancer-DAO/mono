import { ProfileNFT, User } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "..";
import AddReferrerModal from "./AddReferrerModal";
import { useReferral } from "@/src/providers/referralProvider";
import { Copy } from "react-feather";
import { Treasury } from "@ladderlabs/buddy-sdk";
import { api } from "@/src/utils/api";
import * as Prisma from "@prisma/client";

dayjs.extend(relativeTime);

// TODO: change to config file
const SITE_URL = "https://app.lancer.so/account?r=";

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
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const [mints, setMints] = useState<Prisma.Mint[]>([]);
  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
    };
    getMints();
  }, []);
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

  const referralLink = `${SITE_URL}${referralId}`;

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
          <Button
            className="referral "
            version="text"
            onClick={async () => {
              await navigator.clipboard.writeText(referralLink);
              alert(`Copied Referral Link: ${referralLink}`);
            }}
          >
            <div className="referral-link">
              <span>{referralId}</span>
              <Copy />
            </div>
          </Button>
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
