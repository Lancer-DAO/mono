import { FC, Dispatch, SetStateAction } from "react";
import { smallClickAnimation } from "@/src/constants";
import { FORM_SECTION, FormData } from "@/types/forms";
import { motion } from "framer-motion";
import { ImageUpload, PreviewCardBase } from "@/components";

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

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

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
          {/* TODO: drag and drop / upload media - proof on concept not working */}
          <PreviewCardBase width="200px" align="start">
            Add References
          </PreviewCardBase>
          {/* <ImageUpload /> */}
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
