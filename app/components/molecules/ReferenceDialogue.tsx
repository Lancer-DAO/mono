import { Tooltip } from "@/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Modal";
import { smallClickAnimation } from "@/src/constants";
import { api } from "@/src/utils";
import { UploadDropzone } from "@/src/utils/uploadthing";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { PlusCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

const ReferenceDialogue = ({ onReferenceAdded }) => {
  const [reference, setReference] = useState({
    imageUrl: "",
    title: "",
    description: "",
  });
  const isSaveDisabled = reference.imageUrl === "" || reference.title === "";

  const { mutateAsync: deleteMedia } = api.bounties.deleteMedia.useMutation();

  const handleImageUpload = (url) => {
    setReference((prevReference) => ({
      ...prevReference,
      imageUrl: url,
    }));
  };

  const handleTitleChange = (event) => {
    setReference((prevReference) => ({
      ...prevReference,
      title: event.target.value,
    }));
  };

  const handleDescriptionChange = (event) => {
    setReference((prevReference) => ({
      ...prevReference,
      description: event.target.value,
    }));
  };

  const handleSubmit = () => {
    const newReference = {
      imageUrl: reference.imageUrl,
      title: reference.title,
      description: reference.description,
    };

    onReferenceAdded(newReference);
    setReference({
      imageUrl: "",
      title: "",
      description: "",
    });
  };

  const handleImageDelete = async () => {
    await deleteMedia({ imageUrl: reference.imageUrl });
    setReference((prevReference) => ({
      ...prevReference,
      imageUrl: "",
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex w-full justify-center items-center border border-neutral-200 text-neutral-400 rounded-md min-h-[64px] hover:bg-gray-200">
          <PlusCircle size={16} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Reference</DialogTitle>
          <DialogDescription>
            Make changes to your reference here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-center">
            {reference.imageUrl ? (
              <div className="relative">
                <Image
                  src={reference.imageUrl}
                  alt={reference.title}
                  width={250}
                  height={250}
                  className="justify-self-center"
                />
                <motion.button
                  className="absolute top-[-10px] right-[-10px] p-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-full"
                  {...smallClickAnimation}
                  onClick={handleImageDelete}
                >
                  <X size={18} strokeWidth={1.25} />
                </motion.button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  handleImageUpload(res.at(0).url);
                }}
                onUploadError={(error: Error) => {
                  console.log(error);
                  toast.error(`Error uploading: ${error.message}`);
                }}
                config={{ mode: "auto" }}
              />
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Title</div>
            <input
              id="title"
              value={reference.title}
              onChange={handleTitleChange}
              className="p-1 pl-2 col-span-3 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Description</div>
            <input
              id="description"
              value={reference.description}
              onChange={handleDescriptionChange}
              className="p-1 pl-2 col-span-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogPrimitive.Close>
            <div className="group">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSaveDisabled}
              >
                Save changes
              </button>
              {isSaveDisabled ? (
                <Tooltip
                  text={`${
                    reference.imageUrl === ""
                      ? "Please upload an image"
                      : "Please input a title"
                  }`}
                />
              ) : null}
            </div>
          </DialogPrimitive.Close>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceDialogue;
