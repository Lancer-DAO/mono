import {
  BOUNTY_PROJECT_PARAMS,
  NEW_BOUNTY_PROJECT_PARAMS,
} from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { BountyNFT, ProfileNFT } from "@/types";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import Image from "next/image";

const underdogClient = createUnderdogClient({});

interface Props {
  profileNFT: ProfileNFT;
}

const BagesCard: FC<Props> = ({ profileNFT }) => {
  const { currentWallet } = useUserWallet();
  const [badges, setBadges] = useState<BountyNFT[]>([]);

  const fetchBountyNFTs = async () => {
    const profileNFTHolder = currentWallet.publicKey.toString();
    const nfts = await underdogClient.getNfts({
      params: BOUNTY_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 100,
      },
    });
    console.log("nfts", nfts);
    const bountyNFTs: BountyNFT[] = nfts.results.map((nft) => {
      const { name, attributes, image, id } = nft;
      return {
        name: name,
        reputation: attributes.reputation as number,
        tags:
          attributes.tags !== "" ? (attributes.tags as string)?.split(",") : [],
        image: image,
        completed: attributes.completed
          ? dayjs(attributes.completed)
          : undefined,
        description: attributes.description as string,
        role: attributes.role as string,
        id,
      };
    });
    bountyNFTs.reverse();
    setBadges(bountyNFTs);
    console.log(JSON.stringify(bountyNFTs));
  };

  useEffect(() => {
    if (currentWallet) {
      fetchBountyNFTs();
    }
  }, [currentWallet]);

  useEffect(() => {
    const updateNFT = async () => {};
    if (badges) {
      updateNFT();
    }
  }, [badges]);

  return (
    <div className="w-full md:w-[460px] max-h-[320px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <p className="font-bold text-2xl text-textGreen">Badges</p>
      {badges?.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {/* TODO: badges need images and to be styled */}
          {badges.map((badge) => (
            <div className="tag-item" key={badge.id}>
              <Image
                src={badge.image}
                alt={badge.name}
                width={25}
                height={25}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4">No badges yet!</div>
      )}
    </div>
  );
};

export default BagesCard;
