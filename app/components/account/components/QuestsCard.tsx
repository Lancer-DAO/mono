import NextArrow from "@/components/@icons/NextArrow";
import BountyCard from "@/components/molecules/BountyCard";
import { midClickAnimation } from "@/src/constants";
import { BountyNFT, BountyPreview, IAsyncResult, Industry } from "@/types/";
import { api } from "@/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

interface Props {
  bountyNFTs: IAsyncResult<BountyNFT[]>;
}


export const QuestsCard: FC<Props> = ({ bountyNFTs }) => {
  const [bounties, setBounties] = useState<BountyPreview[]>([]);
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>();
  const router = useRouter();
  const { mutateAsync: getBounties } = api.bounties.getAllBounties.useMutation();
  const { mutateAsync: getCurrentUser } = api.users.currentUser.useMutation();
  const { mutateAsync: getAllIndustries } = api.industries.getAllIndustries.useMutation();
  
  
  useEffect(() => {
    const getBountiesAsync = async () => {
      if(router.query.id === undefined) {
        const user = await getCurrentUser();
        const bounties = await getBounties({
          currentUserId: user.id,
          onlyMyBounties: true,
        });
        setBounties(bounties.slice(0, 2));
      } else {
        const bounties = await getBounties({
          currentUserId: parseInt(router.query.id as string),
          onlyMyBounties: false,
        });
        setBounties(bounties.slice(0, 2));
      }
    }
    
    const fetchCurrentIndustries = async () => {
      try {
        const industries = await getAllIndustries();
        setIndustries({ result: industries, isLoading: false });
      } catch (e) {
        console.log("error getting industries: ", e);
        setIndustries({ error: e, isLoading: false });
      }
    };

    fetchCurrentIndustries();
    getBountiesAsync();
  }, [])


  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <p className="font-bold text-2xl text-textGreen mb-2">Previous Quests</p>
      <div className="flex items-center justify-between gap-2">
        {bountyNFTs.isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : bountyNFTs?.result?.length > 0 ? (
          <div className="flex items-center gap-2 mb-2">
            {bounties.map((bounty, index) => {
              return ( 
                <BountyCard key={index} bounty={bounty} allIndustries={industries?.result} />
              )
            })}
          </div>
        ) : (
          <div className="w-full text-center">No bounties yet!</div>
        )}
        {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3">
          <motion.button {...midClickAnimation}>
            <NextArrow />
          </motion.button>
        </div> */}
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
