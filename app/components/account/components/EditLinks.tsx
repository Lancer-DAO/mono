import { Dispatch, SetStateAction } from "react";

type Links = {
  website: string;
  github: string;
  linkedin: string;
}

const EditLinks = ({ 
  links, 
  setLinks, 
  isUpdating 
}: {
  links: Links;
  setLinks: Dispatch<SetStateAction<Links>>;
  isUpdating: boolean;
}) => {
  return (
    <>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Portfolio</p>
        <input
          type="text"
          value={links.website}
          onChange={(e) => setLinks({ ...links, website: e.target.value })}
          className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          disabled={isUpdating}
          />
      </div>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Github</p>
        <input
          type="text"
          value={links.github}
          onChange={(e) => setLinks({ ...links, github: e.target.value })}
          className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          disabled={isUpdating}
        />
      </div>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Linkedin</p>
        <input
          type="text"
          value={links.linkedin}
          onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
          className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          disabled={isUpdating}
        />
      </div>
    </>
  )
};

export default EditLinks;