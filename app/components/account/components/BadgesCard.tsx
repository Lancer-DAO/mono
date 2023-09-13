import { ProfileNFT } from "@/types";
import { FC } from "react";

interface Props {
  profileNFT: ProfileNFT;
}

export const BadgesCard: FC<Props> = ({ profileNFT }) => {
  return (
    <div className="w-full md:w-[460px] max-h-[320px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <p className="font-bold text-2xl text-textGreen">Badges</p>
      {profileNFT?.badges?.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {/* TODO: badges need images and to be styled */}
          {profileNFT?.badges.map((badge) => (
            <div className="tag-item" key={badge}>
              {badge}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4">No badges yet!</div>
      )}
    </div>
  );
};
