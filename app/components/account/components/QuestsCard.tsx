import { FC, useState } from "react";
import { BountyNFT, IAsyncResult } from "@/types/";
import Image from "next/image";

interface Props {
  bountyNFTs: IAsyncResult<BountyNFT[]>;
}

export const QuestsCard: FC<Props> = ({ bountyNFTs }) => {
  return (
    <div className="w-full md:w-[658px] max-h-[356px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <p className="font-bold text-2xl text-textGreen">Previous Quests</p>
      <div className="flex items-center justify-between gap-2">
        {bountyNFTs.isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : bountyNFTs?.result?.length > 0 ? (
          <div className="flex items-center gap-2">
            {bountyNFTs?.result?.map((bountyNFT, index) => {
              if (index > 1) return;
              return (
                // TODO: insert quest card here
                <p>{bountyNFT?.name}</p>
              );
            })}
          </div>
        ) : (
          <div className="w-full text-center">No bounties yet!</div>
        )}
        {`>`}
      </div>
    </div>
  );
};
// <>
//   <div className="flex items-center gap-10 border border-white-900 rounded-[20px] p-4 max-w-[600px] mx-auto">
//     <Image
//       src={"/assets/images/Lancer Gradient No Background 1.png"}
//       width={80}
//       height={80}
//       alt="Lancer Logo"
//     />
//     {/* <img src={bountyNFT.image} className="bounty-picture" /> */}

//     <div className="flex flex-col items-center justify-center">
//       <h4>{bountyNFT.name}</h4>
//       <div className="bounty-nft-subheader">
//         {bountyNFT.reputation} pts | {bountyNFT.completed?.fromNow()} |{" "}
//         {bountyNFT.role}
//       </div>
//     </div>
//     {bountyNFT.tags?.length > 0 && (
//       <div className="tag-list">
//         {bountyNFT.tags.map((badge) => (
//           <div className="tag-item" key={badge}>
//             {badge}
//           </div>
//         ))}
//       </div>
//     )}
//   </div>
// </>
