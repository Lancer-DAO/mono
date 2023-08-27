import ReferenceDialogue from "@/components/molecules/ReferenceDialogue";
import { smallClickAnimation } from "@/src/constants";
import "@uploadthing/react/styles.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

const PortfolioCard = () => {
  const maxMedia = 3;
  const portfolio = [
    {
      imageUrl: "https://utfs.io/f/8ece95d9-e74b-4008-b7e5-a75b51755053_image.png",
      title: "Test",
      description: "Lancer redesign image",
    }
  ]

  const handleReferenceAdded = (newReference) => {
    // portfolio.imageUrl = newReference.media
    // setFormData({
    //   ...formData,
    //   media: [...formData.media, newReference],
    // });
  };

  const handleReferenceRemoved = (removeIndex) => {
    // const updatedMedia = formData.media.filter((_, index) => index !== removeIndex);
    // setFormData({
    //   ...formData,
    //   media: updatedMedia,
    // });
  }

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-2">Portfolio</p>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(maxMedia)].map((_, index) => {
          if (index < portfolio.length) {
            const media = portfolio[index];
            return (
              <div className="relative border-2 border-primaryBtnBorder rounded-xl p-1" key={index}>
                <Image src={media.imageUrl} alt={media.title} width={250} height={250} className="mb-2 rounded-md" />
                <p className="font-bold text-lg mx-1">{media.title}</p>
                <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap mx-1">{media.description}</p>

                <motion.button 
                  className="absolute top-[-10px] right-[-10px] p-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-full"
                  {...smallClickAnimation}
                  onClick={() => handleReferenceRemoved(index)}
                >
                  <X size={18} strokeWidth={1.25}  />
                </motion.button>
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
  )
}

export default PortfolioCard;