import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/Modal";
import { UploadDropzone } from "@/src/utils/uploadthing";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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

export default ReferenceDialogue;