import { ContributorInfo } from "@/components";
import Crown from "@/components/@icons/Crown";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { api, updateList } from "@/src/utils";
import { UploadDropzone } from "@/src/utils/uploadthing";
import {
  BOUNTY_USER_RELATIONSHIP,
  LancerApplyData,
  LancerUpdateData,
} from "@/types";
import { oembed } from "@loomhq/loom-embed";
import { PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import { update } from "lodash";
import { ChevronsUpDown, Image } from "lucide-react";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCard from "./AlertCard";

const LancerSubmitUpdateView: FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();

  const [hasApplied, setHasApplied] = useState(false);
  const [selectedType, setSelectedType] = useState("Loom recording");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updateData, setUpdateData] = useState<LancerUpdateData>({
    name: "",
    type: "",
    content: "",
    notes: "",
  });
  const [videoHTML, setVideoHTML] = useState("");
  
  const types = ["Loom recording", "Text", "PNG image", "MP4 video"];
  
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  useEffect(() => {
    async function setupLoom() {
      const { html } = await oembed("https://www.loom.com/share/f6a176ec0fdc4f538e27d8d9ce4e2f0a?sid=717247bb-c0e3-46fb-81e1-a4196ae0a2c0");
      setVideoHTML(html);
    }

      setupLoom();
  
  }, [updateData.content])
  

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Update to ${currentBounty.creator.user.name}`}
        subtitle={`${currentBounty.pullRequests.length} ${
          currentBounty.pullRequests.length === 1 ? "update" : "updates"
        } so far`}
      ></ActionsCardBanner>
      <div className="w-full p-6 flex items-center gap-4">
        <div className="flex items-center gap-4">
          <p className="text-neutral600 text">Name</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/60 
            bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
            placeholder="Insert name here..."
            disabled={hasApplied}
            value={updateData.name}
            onChange={(e) =>
              setUpdateData({ ...updateData, name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col relative">
          <div
            className="rounded-md text-neutral500 border border-neutral200 bg-neutral100 px-2 py-[6px] text-mini h-[34px] flex justify-between items-center gap-1 w-32"
            onClick={toggleDropdown}
          >
            {selectedType}
            <ChevronsUpDown height={12} width={12} />
          </div>
          {dropdownOpen && (
            <div className="absolute top-full left-0 z-10 bg-secondary200 p-[5px] rounded-md text-mini text-white w-full">
              {types.map((type) => (
                <div
                  key={type}
                  className="px-2 py-[6px]"
                  onClick={() => {
                    setSelectedType(type);
                    toggleDropdown();
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedType === "Loom recording" && (
        <div className="w-full px-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="text-neutral600 text">Loom Link</p>
            <input
              type="text"
              className="text border border-neutral200 placeholder:text-neutral500/60 
              bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
              placeholder="www.loom.com/dkdkdkdkd"
              disabled={hasApplied}
              value={updateData.content}
              onChange={(e) =>
                setUpdateData({ ...updateData, content: e.target.value })
              }
            />
          </div>
          <div className="flex jutify-center items-center rounded-md border px-[151px] py-[33px] h-[228px]">
            {/* <div className="py-[10px] flex flex-col items-center gap-2">
              <Crown />
              <div className="text-mini text-neutral400 text-center">
                Enter a link above and you will see a preview. Client will see
                the same.
              </div>
            </div> */}
            <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div>
          </div>
        </div>
      )}
      {selectedType === "Text" && (
        <div className="w-full px-6 flex flex-col gap-4">
          <textarea
            className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
            bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2 disabled:opacity-80"
            placeholder="Talk about your work"
            disabled={hasApplied}
            value={updateData.content}
            onChange={(e) =>
              setUpdateData({ ...updateData, content: e.target.value })
            }
          />
        </div>
      )}
      {selectedType === "PNG image" && (
        <div className="w-full px-6">
          {/* <div className="rounded-md border px-[151px] py-[33px] h-[228px]" /> */}
          <UploadDropzone
            endpoint="imageUploader"
            config={{ mode: "auto" }}
            className="rounded-md border px-[151px] py-[33px] h-[228px] text-mini text-neutral300 ut-label:text-mini ut-label:text-neutral300 ut-upload-icon:h-4 ut-upload-icon:w-4 ut-label:mt-1"
          />
        </div>
      )}

      {selectedType === "MP4 video" && (
        <div className="w-full px-6">
          {/* <div className="rounded-md border px-[151px] py-[33px] h-[228px]" /> */}
          <UploadDropzone
            endpoint="imageUploader"
            config={{ mode: "auto" }}
            className="rounded-md border px-[151px] py-[33px] h-[228px]"
          />
        </div>
      )}

      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral-600 text">
          Need to give instructions/notes about the work?
        </p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
          bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2 disabled:opacity-80"
          placeholder="Type your message here..."
          disabled={hasApplied}
          value={updateData.notes}
          onChange={(e) =>
            setUpdateData({ ...updateData, notes: e.target.value })
          }
        />
      </div>
      {!hasApplied && (
        <div className="flex items-center justify-end px-6 py-4">
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md"
            onClick={() => {}}
          >
            Submit Update
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LancerSubmitUpdateView;
