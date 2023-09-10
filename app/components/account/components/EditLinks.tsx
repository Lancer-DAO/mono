import { Dispatch, SetStateAction } from "react";

type Links = {
  website: string;
  twitter: string;
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
          className="placeholder:text-textGreen/70 w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          placeholder="https://degenpicks.xyz"
          disabled={isUpdating}
          />
      </div>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Twitter</p>
        <input
          type="text"
          value={links.twitter}
          onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
          className="placeholder:text-textGreen/70 w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          placeholder="https://twitter.com/mattdegods"
          disabled={isUpdating}
          />
      </div>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Github</p>
        <input
          type="text"
          value={links.github}
          onChange={(e) => setLinks({ ...links, github: e.target.value })}
          className="placeholder:text-textGreen/70 w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          placeholder="https://github.com/mattdegods"
          disabled={isUpdating}
        />
      </div>
      <div className="my-4 w-3/4">
        <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Linkedin</p>
        <input
          type="text"
          value={links.linkedin}
          onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
          className="placeholder:text-textGreen/70 w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
          placeholder="https://linkedin.com/in/mattdegods"
          disabled={isUpdating}
        />
      </div>
    </>
  )
};

export default EditLinks;