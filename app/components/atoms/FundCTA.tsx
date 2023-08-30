import { FC } from "react";
import CoinsIcon from "../@icons/Coins";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";

const FundCTA: FC = () => {
  return (
    <>
      <motion.button
        {...smallClickAnimation}
        className="h-12 w-fit px-4 border border-industryRedBorder/10 
      rounded-md flex items-center gap-2"
        onClick={() => {}}
      >
        <CoinsIcon className="fill-industryRed" />
        <p className="uppercase text-industryRed text-[9px] whitespace-nowrap">
          This quest is unfunded.
        </p>
      </motion.button>
      {/* TODO: add fund bounty modal */}
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
                    alert(`ERROR! ${error.message}`);
                  }}
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
    </>
  );
};

export default FundCTA;
