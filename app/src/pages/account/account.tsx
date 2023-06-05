import {
  BOUNTY_PROJECT_PARAMS,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
  USDC_MINT,
} from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import Coinflow from "../../../pages/account/coinflowOfframp";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { api } from "@/src/utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { CurrentUser } from "@/src/types";
dayjs.extend(relativeTime);

const underdogClient = createUnderdogClient({});

export interface ProfileNFT {
  name: string;
  reputation: number;
  badges: string[];
  certifications: string[];
  image: string;
  lastUpdated?: dayjs.Dayjs;
}

export interface BountyNFT {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: dayjs.Dayjs;
  description: string;
  role: string;
}

export const ProfileNFT = ({
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

export const BountyNFT = ({ bountyNFT }: { bountyNFT: BountyNFT }) => {
  return (
    <>
      <div className="bounty-nft">
        <img
          src={"/assets/images/Lancer Gradient No Background 1.png"}
          className="bounty-picture"
        />
        {/* <img src={bountyNFT.image} className="bounty-picture" /> */}

        <div className="bounty-nft-header">
          <div>
            <h4>{bountyNFT.name}</h4>
            <div className="bounty-nft-subheader">
              {bountyNFT.reputation} Pts | {bountyNFT.completed?.fromNow()} |{" "}
              {bountyNFT.role}
            </div>

            {bountyNFT.tags?.length > 0 && (
              <div className="tag-list">
                {bountyNFT.tags.map((badge) => (
                  <div className="tag-item" key={badge}>
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
