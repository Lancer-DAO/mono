import Edit from "@/components/@icons/Edit";
import Fire from "@/components/@icons/Fire";
import Plus from "@/components/@icons/Plus";
import Trash from "@/components/@icons/Trash";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { UploadDropzone } from "@/src/utils/uploadthing";
import {
  LancerQuoteData, QUOTE_STATUS,
} from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { FC, useState } from "react";
import { ChevronDown } from "react-feather";
import { toast } from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";

const LancerSubmitQuoteView: FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();
  const [quoteData, setQuoteData] = useState<LancerQuoteData[]>([{
    name: "Sketches and early ideas",
    price: 400,
    time: 4,
    description: "",
    status: QUOTE_STATUS.COMPLETE,
  }]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Quote to ${currentBounty.creator.user.name}`}
        subtitle={`${quoteData?.length || 0} ${
          (quoteData?.length || 0) === 1 ? "quote" : "quotes"
        } have been sent to them already`}
      ></ActionsCardBanner>
      <div className="px-6 py-4">
        {quoteData.map((quote) => (
          <div className="flex flex-col" key={quote.name}>
            <div className="flex py-4 justify-between border-b border-neutral200">
              <div className="flex items-center gap-2">
                <Fire />
                <div className="text text-neutral600">{quote.name}</div>
                <div className="w-[1px] h-5 bg-neutral200" />
                <div className="text-mini text-neutral400">{`${quote.time}h`}</div>
                <ChevronDown width={12} height={12} stroke="#A1B3AD" />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-2 items-center">
                  <Edit />
                  <Trash />
                </div>
                <div className="title-text text-neutral600">{`$${quote.price}`}</div>
              </div>
            </div>
            <div className="flex flex-col pt-4 gap-6">
              <div className="flex gap-4 items-center">
                <div className="text text-neutral600">Milestone name</div>
                <input className="bg-neutral100 text text-neutral400 px-3 py-2 rounded-md border border-neutral200 outline-none" placeholder="Specify a clear objective and title" />
              </div>
              <div className="flex gap-6 items-center">
                <div className="flex gap-4 items-center">
                  <div className="text text-neutral600">Price</div>
                  {/* <input className="flex gap-2 bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none" placeholder="0">
                    <div className="text text-neutral400">$</div>
                  </input> */}
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text text-neutral600">Time to spend</div>
                  {/* <input className="flex gap-2 bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none" placeholder="0">
                    <div className="text text-neutral400">$</div>
                  </input> */}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text text-black">Add few bullet points about the process (try to be as clear as possible) :</div>
                <textarea className="px-2 py-3 text text-[#94A3B8] rouned-md border border-[#E8F8F3] bg-[#FAFCFC] outline-none h-full resize-none" placeholder="Type your message here..." />
              </div>
              <div className="flex flex-col justify-center items-end self-stretch gap-2">
                <button className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300">
                  Add milestone
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="py-4">
          <button className="py-1 px-2 flex gap-1 justify-center items-center rounded-md border border-neutral200 text-mini text-neutral500">
            <Plus /> 
            Add a Milestone
          </button>
        </div>
      </div>
        <div className="flex py-4 px-6 justify-end items-center gap-4 self-stretch opacity-20">
          <button className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300">Cancel</button>
          <button className="px-4 py-2 text-white title-text rounded-md bg-secondary200">Review Profile</button>
        </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
