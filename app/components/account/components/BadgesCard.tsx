import { Tooltip } from "@/components";
import { BADGES_PROJECT_PARAMS } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { BountyNFT } from "@/types";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import badgeList from "./badgesnfts.json";

type BadgeListItem = {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: string;
  role: string;
  id: number;
  ownerAddress: string;
};

const badgesList = badgeList as BadgeListItem[];

const underdogClient = createUnderdogClient({});

export const BadgesCard: FC = () => {
  const { currentWallet } = useUserWallet();
  const [badges, setBadges] = useState<BountyNFT[]>([]);

  const fetchBountyNFTs = async () => {
    const nfts = await underdogClient.getNfts({
      params: BADGES_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 12,
        ownerAddress: currentWallet.publicKey.toBase58(),
      },
    });
    const bountyNFTs: BountyNFT[] = nfts.results.map((nft) => {
      const { name, attributes, image, id, ownerAddress } = nft;
      return {
        name: name,
        experience: attributes.reputation as number,
        tags:
          attributes.tags !== "" ? (attributes.tags as string)?.split(",") : [],
        image: image,
        completed: attributes.completed
          ? dayjs(attributes.completed)
          : undefined,
        description: attributes.description as string,
        role: attributes.role as string,
        id,
        ownerAddress,
      };
    });
    bountyNFTs.reverse();
    setBadges(bountyNFTs);
  };

  useEffect(() => {
    if (currentWallet) {
      fetchBountyNFTs();
    }
  }, [currentWallet]);

  return (
    <div className="w-full md:w-[460px] max-h-[320px] rounded-xl bg-bgLancerSecondary/[8%] p-6">
      <p className="font-bold text-2xl text-textGreen pb-2">Badges</p>
      {badges?.length > 0 ? (
        <div className="grid grid-cols-6 gap-2">
          {badges.map((badge) => (
            <div className="relative group tag-item z-30" key={badge.id}>
              <Image
                src={badge.image}
                alt={badge.name}
                width={50}
                height={50}
              />
              <Tooltip text={`Quest ${badge.name}`} />
            </div>
          ))}
        </div>
      ) : (
        <div>No Badges Yet</div>
      )}
    </div>
  );
};
