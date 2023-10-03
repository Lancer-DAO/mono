import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Modal";
import EditReferenceDialogue from "@/components/molecules/EditReferenceDialogue";
import ReferenceDialogue from "@/components/molecules/ReferenceDialogue";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { api } from "@/src/utils";
import { Media } from "@/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import "@uploadthing/react/styles.css";

export const PortfolioCard: React.FC = () => {
  const { account } = useAccount();

  const { currentUser } = useUserWallet();
  const maxMedia = 5;
  const { mutateAsync: createMedia } = api.media.createMedia.useMutation();
  const { mutateAsync: deleteMedia } = api.media.deleteMedia.useMutation();
  const { mutateAsync: updateMedia } = api.media.updateMedia.useMutation();
  const { data: media, refetch } = api.media.getMedia.useQuery({
    userId: account?.id,
  });
  const [portfolio, setPortfolio] = useState<Media[]>([]);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  useEffect(() => {
    if (media) {
      setPortfolio(media);
    }
  }, [media]);

  const confirmAction = (): Promise<void> => {
    setIsAwaitingResponse(true);

    return new Promise<void>((resolve, reject) => {
      const handleYes = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        resolve();
      };

      const handleNo = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        reject();
      };

      const toastId = toast(
        (t) => (
          <div>
            Are you sure you want to remove this reference?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-white border border-neutral300 text-error flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-primary200 flex text-white title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });
  };

  const handleMediaAdded = async (newReference: Media) => {
    const newMedia = await createMedia({
      imageUrl: newReference.imageUrl,
      title: newReference.title,
      description: newReference.description,
    });
    setPortfolio([...portfolio, newMedia]);
    refetch();
  };

  const handleMediaRemoved = async (mediaId, portfolioIndex) => {
    await confirmAction();
    try {
      await deleteMedia({
        id: mediaId,
        fileUrl: portfolio[portfolioIndex].imageUrl,
      });
      const updatedPortfolio = portfolio.filter(
        (_, index) => index != portfolioIndex
      );
      setPortfolio(updatedPortfolio);
      refetch();
    } catch (error) {
      console.log(error);
      const toastId = toast.error(`Error deleting media: ${error.message}`);
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    }
  };

  const handleMediaUpdated = async (editedReference: Media) => {
    await updateMedia({
      id: editedReference.id,
      imageUrl: editedReference.imageUrl,
      title: editedReference.title,
      description: editedReference.description,
    });

    const editedMediaIndex = portfolio.findIndex(
      (media) => media.id === editedReference.id
    );

    if (editedMediaIndex !== -1) {
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[editedMediaIndex] = editedReference;

      setPortfolio(updatedPortfolio);
    }
    refetch();
  };

  return (
    <div
      className="relative flex flex-col gap-4 bg-white w-full border 
      border-neutral200 rounded-md p-6"
    >
      <p className="text-neutral600 title-text">Portfolio</p>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(maxMedia)].map((_, index) => {
          if (index < portfolio.length) {
            const media = portfolio[index];
            return (
              <Dialog key={index}>
                <div className="relative" key={index}>
                  <DialogTrigger
                    className="relative border-2 border-neutral200 rounded-[4px] 
                    w-full h-[90px] overflow-hidden"
                    key={`dialog-${index}`}
                  >
                    <Image
                      src={media.imageUrl}
                      alt={media.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </DialogTrigger>
                  {account.id === currentUser.id && (
                    <>
                      <EditReferenceDialogue
                        media={media}
                        onReferenceAdded={handleMediaUpdated}
                      />
                      <motion.button
                        className="absolute top-[-10px] right-[-10px] p-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-full"
                        {...smallClickAnimation}
                        onClick={() => handleMediaRemoved(media.id, index)}
                        disabled={isAwaitingResponse}
                        key={`delete-${index}`}
                      >
                        <X size={18} strokeWidth={1.25} />
                      </motion.button>
                    </>
                  )}
                  <p className="w-full truncate text-left text-sm text-neutral500">
                    {media.title}
                  </p>
                </div>
                <DialogContent className="w-[400px] flex flex-col gap-3 items-center p-6">
                  <div
                    className="relative gap-5 w-full h-[240px] 
                    overflow-hidden mt-4 rounded-md border-2 border-neutral200"
                  >
                    <Image
                      src={media.imageUrl}
                      alt={media.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                  <div className="w-full flex items-center gap-3 text-sm text-neutral600">
                    <p className="w-32 text-left">Title</p>
                    <p className="w-full text-left p-2 bg-neutral100 border border-neutral200 rounded-md">
                      {media.title}
                    </p>
                  </div>
                  <div className="w-full flex items-center gap-3 text-sm">
                    <p className="w-32 text-left">Description</p>
                    <p className="w-full text-left p-2 bg-neutral100 border border-neutral200 rounded-md">
                      {media.description}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            );
          } else {
            return (
              <>
                {account.id === currentUser.id && (
                  <ReferenceDialogue
                    key={index}
                    onReferenceAdded={handleMediaAdded}
                  />
                )}
              </>
            );
          }
        })}
      </div>
    </div>
  );
};
