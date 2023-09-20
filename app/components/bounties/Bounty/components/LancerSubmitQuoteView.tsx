import Edit from "@/components/@icons/Edit";
import Fire from "@/components/@icons/Fire";
import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import Trash from "@/components/@icons/Trash";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { UploadDropzone } from "@/src/utils/uploadthing";
import { motion } from "framer-motion";
import Image from "next/image";
import { FC, useState } from "react";
import { ChevronDown } from "react-feather";
import { toast } from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";
import MilestoneView from "./MilestoneView";

export interface Milestone {
  name: string;
  price: number;
  time: number;
  description: string;
}

const LancerSubmitQuoteView: FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();
  const [quoteData, setQuoteData] = useState<Milestone[]>([
    {
      name: "Sketches and early ideas",
      price: 400,
      time: 4,
      description: "",
    },
    {
      name: "Wireframes and iterations",
      price: 400,
      time: 4,
      description: "",
    }
  ]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Quote to ${currentBounty.creator.user.name}`}
        subtitle={`${quoteData.length || 0} ${
          (quoteData.length || 0) === 1 ? "quote" : "quotes"
        } have been sent to them already`}
      ></ActionsCardBanner>
      <div className="px-6 py-4">
        <div className="flex py-4 justify-between border-b border-neutral200">
          <div className="flex items-center gap-2">
            <RedFire />
            <div className="title-text text-neutral600">Quote Price</div>
            <div className="w-[1px] h-5 bg-neutral200" />
            <div className="text-mini text-neutral400">{`${quoteData.reduce((total, milestone) => total + milestone.time, 0)}h`}</div>
          </div>
          <div className="flex items-center title-text text-primary200">{`$${quoteData.reduce((total, milestone) => total + milestone.price, 0 ) }`}</div>
        </div>
        {quoteData.map((milestone) => (
          <MilestoneView milestone={milestone} key={milestone.name} />
        ))}
        {quoteData.length <= 5 && (
          <div className="py-4">
            <button className="py-1 px-2 flex gap-1 justify-center items-center rounded-md border border-neutral200 text-mini text-neutral500">
              <Plus /> 
              Add a Milestone
            </button>
          </div>

        )}
      </div>
      <div className="flex py-4 px-6 justify-end items-center gap-4 self-stretch opacity-20">
        <button className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300">Cancel</button>
        <button className="px-4 py-2 text-white title-text rounded-md bg-secondary200">Review Profile</button>
      </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
