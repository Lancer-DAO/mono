import { ImageUpload, PreviewCardBase } from "@/components";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/Modal";
import { smallClickAnimation } from "@/src/constants";
import { UploadButton, UploadDropzone } from "@/src/utils/uploadthing";
import { FORM_SECTION, FormData, Media } from "@/types/forms";
import "@uploadthing/react/styles.css";
import { motion } from "framer-motion";
import { Plus, Trash, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  handleChange: (event) => void;
}

const ReferenceDialogue = ({ onReferenceAdded }) => {
  const [reference, setReference] = useState({
    imageUrl: "",
    title: "",
    description: "",
  })

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

    onReferenceAdded(newReference); // Call the onReferenceAdded prop with the new reference
    setReference({
      imageUrl: "",
      title: "",
      description: "",
    });
  };

  const handleImageDelete = () => {
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
            Make changes to your reference here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-center">
            {reference.imageUrl ? ( 
              <div className="relative">
                <Image src={reference.imageUrl} alt={reference.title} width={250} height={250} className="justify-self-center" /> 
                <button
                  className="absolute top-[-10px] right-[-10px] p-1 bg-red-500 text-white hover:bg-red-700 rounded-full"
                  onClick={handleImageDelete}
                >
                  <X size={18} />
                </button>
              </div>
            ) : ( 
              <UploadDropzone 
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  handleImageUpload(res.at(0).url);
                }}
                onUploadError={(error: Error) => {
                console.log(error);
                alert(`ERROR! ${error.message}`);
                }}
              /> 
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div  className="text-right">
              Title
            </div>
            <input
              id="title"
              value={reference.title}
              onChange={handleTitleChange}
              className="col-span-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              Description
            </div>
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
          <button type="submit" onClick={handleSubmit}>Save changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AddMediaForm: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
  handleChange,
}) => {
  const maxReferences = 4;

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, ""],
    });
  };

  const removeLink = (targetIndex: number) => {
    const updatedLinks: string[] = [...formData.links];
    console.log("updatedLinks, index", updatedLinks, targetIndex);
    setFormData({
      ...formData,
      links: updatedLinks?.filter((_, index) => index !== targetIndex),
    });
  };

  const updateLink = (index, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = value;
    setFormData({
      ...formData,
      links: updatedLinks,
    });
  };

  const handleReferenceAdded = (newReference) => {
    setFormData({
      ...formData,
      media: [...formData.media, newReference],
    });
  };

  const handleReferenceRemoved = (removeIndex) => {
    const updatedMedia = formData.media.filter((_, index) => index !== removeIndex);
    setFormData({
      ...formData,
      media: updatedMedia,
    });
  }

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  return (
    <div>
      <h1>Attach Multimedia and Links</h1>
      <div className="w-full flex flex-col gap-4 mt-6">
        <div>
          <div className="relative w-full flex flex-col gap-2">
            <div className="absolute top-3 -left-10 text-2xl">6</div>
            {formData.links.map((link: string, index: number) => (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  className="placeholder:text-textGreen/70 border bg-neutralBtn 
                  border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
                  name={`link-${index}`}
                  placeholder="Paste Link"
                  id={`link-input-${index}`}
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                />
                <motion.button
                  onClick={() => removeLink(index)}
                  {...smallClickAnimation}
                  className={`${
                    index === 0 && "invisible"
                  } bg-secondaryBtn border border-secondaryBtnBorder pb-1
                    text-textRed h-8 w-12 text-2xl rounded-lg flex items-center justify-center`}
                >
                  -
                </motion.button>
              </div>
            ))}
          </div>
          <motion.button
            onClick={() => addLink()}
            {...smallClickAnimation}
            className="bg-neutralBtn border border-neutralBtnBorder text-textPrimary/50 text-xl h-8 w-14 rounded-lg mt-2"
          >
            +
          </motion.button>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10 text-2xl">
            7
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(maxReferences)].map((_, index) => {
              if (index < formData.media.length) {
                const media = formData.media[index];
                return (
                  <div className="relative border-2 border-primaryBtnBorder rounded-xl p-2" key={index}>
                    <Image src={media.imageUrl} alt={media.title} width={250} height={250} className="mb-2" />
                    <p className="font-bold text-lg">{media.title}</p>
                    <p className="text-sm">{media.description}</p>
                    <button 
                      className="absolute top-[-10px] right-[-10px] p-1 bg-red-500
                      text-white hover:bg-red-700 rounded-full"
                      onClick={() => handleReferenceRemoved(index)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              } else {
                return (
                  <ReferenceDialogue onReferenceAdded={handleReferenceAdded} />
                );
              }
            })}
          </div>
        </div>
        <div className="w-full flex items-center justify-between">
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("CREATE")}
            className="bg-secondaryBtn border border-secondaryBtnBorder text-textRed 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            BACK
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("PREVIEW")}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            NEXT
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AddMediaForm;
