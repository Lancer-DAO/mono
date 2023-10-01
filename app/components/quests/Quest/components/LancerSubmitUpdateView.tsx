import Crown from "@/components/@icons/Crown";
import { submitRequestFFA } from "@/escrow/adapters";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { UploadDropzone } from "@/src/utils/uploadthing";
import { LancerUpdateData, QuestProgressState } from "@/types";
import { oembed, validate } from "@loomhq/loom-embed";
import { PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";

export enum UPDATE_TYPES {
  Loom = "Loom recording",
  Text = "Text",
  FileUpload = "File Upload",
}

const LancerSubmitUpdateView: FC = () => {
  const { currentBounty } = useBounty();
  const { currentUser, currentWallet, program, provider } = useUserWallet();

  const [hasSubmittedUpdate, setHasSubmittedUpdate] = useState(false);
  const [selectedType, setSelectedType] = useState("Loom recording");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updateData, setUpdateData] = useState<LancerUpdateData>({
    bountyId: currentBounty.id,
    name: "",
    type: "",
    description: "",
    links: "",
    media: [],
    state: QuestProgressState.NEW,
  });
  const { data: updates, refetch } = api.update.getUpdatesByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );
  const { mutateAsync: createUpdate } = api.update.createUpdate.useMutation();
  const { mutateAsync: deleteMedia } = api.bounties.deleteMedia.useMutation();
  const [videoHTML, setVideoHTML] = useState("");

  const types = [UPDATE_TYPES.Loom, UPDATE_TYPES.FileUpload, UPDATE_TYPES.Text];

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSubmitUpdate = async () => {
    const toastId = toast.loading("Sending update...");
    try {
      if (!currentBounty.isCurrentSubmitter) {
        await submitRequestFFA(
          new PublicKey(currentBounty.creator.publicKey),
          currentWallet.publicKey,
          currentBounty.escrow,
          currentWallet,
          program,
          provider
        );
      }
      await createUpdate(updateData);
      refetch();
      setHasSubmittedUpdate(true);
      toast.success("Update sent", { id: toastId });
    } catch (error) {
      toast.error("Error submitting update", { id: toastId });
    }
  };

  const handleDropdownChange = async (type: string) => {
    if (
      selectedType === UPDATE_TYPES.FileUpload &&
      updateData.media.length &&
      !hasSubmittedUpdate
    ) {
      await deleteMedia({ imageUrl: updateData.media[0]?.imageUrl });
      setUpdateData({ ...updateData, type, media: [] });
    } else {
      setUpdateData({ ...updateData, type, links: "" });
    }
    setSelectedType(type);
    toggleDropdown();
  };

  const isVideo = (url: string) => {
    return url.includes(".mp4") || url.includes(".mov");
  };

  useEffect(() => {
    async function setupLoom() {
      const { html } = await oembed(updateData.links);
      setVideoHTML(html);
    }

    if (validate.isLoomUrl(updateData.links)) {
      setupLoom();
    }
  }, [updateData.links]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Update to ${currentBounty.creator.user.name}`}
        subtitle={`${updates?.length || 0} ${
          (updates?.length || 0) === 1 ? "update" : "updates"
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
            disabled={hasSubmittedUpdate}
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
                  onClick={() => handleDropdownChange(type)}
                >
                  {type}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedType === UPDATE_TYPES.Loom && (
        <div className="w-full px-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="text-neutral600 text">Loom Link</p>
            <input
              type="text"
              className="text border border-neutral200 placeholder:text-neutral500/60 
              bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
              placeholder="www.loom.com/dkdkdkdkd"
              disabled={hasSubmittedUpdate}
              value={updateData.links}
              onChange={(e) => {
                setUpdateData({
                  ...updateData,
                  links: e.target.value.split("?")[0],
                });
              }}
            />
          </div>
          {validate.isLoomUrl(updateData.links) === false && (
            <div className="flex justify-center items-center rounded-md border px-[151px] py-[33px] h-[228px]">
              <div className="py-[10px] flex flex-col items-center gap-2">
                <Crown />
                <div className="text-mini text-neutral400 text-center">
                  Enter a link above and you will see a preview. Client will see
                  the same.
                </div>
              </div>
            </div>
          )}
          {validate.isLoomUrl(updateData.links) && (
            <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div>
          )}
        </div>
      )}
      {selectedType === UPDATE_TYPES.FileUpload && (
        <div className="w-full px-6">
          {updateData.media.length ? (
            <>
              {isVideo(updateData.media[0].imageUrl) ? (
                <video width={610} height={228} controls>
                  <source src={updateData.media[0].imageUrl} />
                </video>
              ) : (
                <Image
                  src={updateData.media[0]?.imageUrl}
                  alt={`${updateData.name} image`}
                  width={610}
                  height={228}
                />
              )}
            </>
          ) : (
            <UploadDropzone
              endpoint="imageAndVideoUploader"
              onClientUploadComplete={(res) => {
                setUpdateData({
                  ...updateData,
                  media: [
                    {
                      imageUrl: res.at(0).url,
                      title: "",
                      description: "",
                    },
                  ],
                });
              }}
              onUploadError={(error: Error) => {
                console.log(error);
                toast.error(`Error uploading: ${error.message}`);
              }}
              config={{ mode: "auto" }}
              appearance={{
                button:
                  "w-28 px-4 py-2 rounded-md bg-transparent ut-uploading:cursor-not-allowed ut-uploading:bg-neutral300",
              }}
              className="rounded-md border px-[151px] py-[33px] h-[228px] text-mini text-neutral300 ut-label:text-mini ut-label:text-neutral300 ut-upload-icon:h-4 ut-upload-icon:w-4 ut-label:mt-1"
            />
          )}
        </div>
      )}
      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral-600 text">
          Need to give instructions/notes about the work?
        </p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
          bg-neutral100 text-neutral500 w-full rounded-md px-3 py-2 disabled:opacity-80"
          placeholder="Type your message here..."
          disabled={hasSubmittedUpdate}
          value={updateData.description}
          onChange={(e) =>
            setUpdateData({ ...updateData, description: e.target.value })
          }
        />
      </div>
      {!hasSubmittedUpdate && (
        <div className="flex items-center justify-end px-6 py-4">
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md"
            onClick={handleSubmitUpdate}
          >
            Submit Update
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LancerSubmitUpdateView;
