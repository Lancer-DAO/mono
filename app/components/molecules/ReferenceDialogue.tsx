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
import { UploadDropzone } from "@/src/utils/uploadthing";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/src/utils";

const ReferenceDialogue = ({ onReferenceAdded }) => {
  const { mutateAsync: deleteMedia } = api.bounties.deleteMedia.useMutation();

  const [reference, setReference] = useState({
    imageUrl: "",
    title: "",
    description: "",
  });

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

    if (newReference.imageUrl === "") {
      toast.error("Please upload an image");
    } else if (newReference.title === "") {
      toast.error("Please input a title");
    } else {
      onReferenceAdded(newReference);
      setReference({
        imageUrl: "",
        title: "",
        description: "",
      });
    }
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
        <button className="flex justify-center items-center border border-gray-300 rounded-md h-44 hover:bg-gray-200">
          <Plus size={48} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
              className="col-span-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">Description</div>
            <input
              id="description"
              value={reference.description}
              onChange={handleDescriptionChange}
              className="col-span-3 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <button type="submit" onClick={handleSubmit}>
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceDialogue;
