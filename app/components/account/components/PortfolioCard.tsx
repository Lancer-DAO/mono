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
import { api } from "@/src/utils";
import { Media, User } from "@/types";
import "@uploadthing/react/styles.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const PortfolioCard: React.FC<{ fetchedUser: User }> = ({ fetchedUser }) => {
  const router = useRouter();
  const { currentUser } = useUserWallet();
  const maxMedia = 3;
  const { mutateAsync: createMedia } = api.media.createMedia.useMutation();
  const { mutateAsync: deleteMedia } = api.media.deleteMedia.useMutation();
  const { mutateAsync: updateMedia } = api.media.updateMedia.useMutation();
  const { data: media } = api.media.getMedia.useQuery({
    userId: fetchedUser?.id,
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
            Are you sure you want to delete this?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="border border-secondaryBtnBorder bg-secondaryBtn flex
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="border border-primaryBtnBorder bg-primaryBtn flex
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
    } catch (error) {
      console.log(error);
      toast.error(`Error deleting media: ${error.message}`);
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
  };

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-2">Portfolio</p>
      <div className="grid grid-cols-3 gap-6">
        {[...Array(maxMedia)].map((_, index) => {
          if (index < portfolio.length) {
            const media = portfolio[index];
            return (
              <Dialog key={index}>
                <div className="relative border-2 border-primaryBtnBorder rounded-xl p-1">
                  <div className="flex flex-col items-start">
                    <DialogTrigger className="w-full">
                      <div className="flex flex-col items-start justify-start overflow-hidden">
                        <Image
                          src={media.imageUrl}
                          alt={media.title}
                          width={250}
                          height={250}
                          className="mb-2 rounded-md"
                        />
                        <p className="font-bold text-lg mx-1 w-full truncate text-left">
                          {media.title}
                        </p>
                        <p className="text-sm mx-1 truncate w-full text-left">
                          {media.description}
                        </p>
                      </div>
                    </DialogTrigger>
                  </div>
                  {fetchedUser.id === currentUser.id && (
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
                      >
                        <X size={18} strokeWidth={1.25} />
                      </motion.button>
                    </>
                  )}
                </div>
                <DialogContent>
                  <DialogHeader className="flex text-3xl justify-start">
                    <DialogTitle className="text-3xl">
                      {media.title}
                    </DialogTitle>
                    <DialogDescription>{media.description}</DialogDescription>
                  </DialogHeader>
                  <Image
                    src={media.imageUrl}
                    alt={media.title}
                    width={500}
                    height={500}
                    className="border border-primaryBtnBorder rounded-md mt-4"
                  />
                </DialogContent>
              </Dialog>
            );
          } else {
            return (
              <>
                {fetchedUser.id === currentUser.id && (
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

export default PortfolioCard;
