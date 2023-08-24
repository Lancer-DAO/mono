import ReferenceDialogue from "@/components/molecules/ReferenceDialogue";
import { smallClickAnimation } from "@/src/constants";
import { FORM_SECTION, FormData, Media } from "@/types/forms";
import "@uploadthing/react/styles.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect } from "react";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  handleChange: (event) => void;
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
