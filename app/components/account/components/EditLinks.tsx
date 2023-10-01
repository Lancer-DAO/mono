import { Dispatch, SetStateAction } from "react";
import { ResumeCard } from "./ResumeCard";

type Links = {
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
};

const EditLinks = ({
  links,
  setLinks,
  isUpdating,
  resumeUrl,
  setResumeUrl,
}: {
  links: Links;
  setLinks: Dispatch<SetStateAction<Links>>;
  isUpdating: boolean;
  resumeUrl: string;
  setResumeUrl: (value: string) => void;
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-4">
        <div className="w-full flex items-center gap-2">
          <p className="text-neutral600 w-14 text-sm">Portfolio</p>
          <input
            type="text"
            value={links.website}
            onChange={(e) => setLinks({ ...links, website: e.target.value })}
            className="placeholder:text-neutral400 w-64 
            p-2 bg-neutral100 border border-neutral200 
            rounded-md gap-2 text-neutral500 text-sm"
            placeholder="https://degenpicks.xyz"
            disabled={isUpdating}
          />
        </div>
        <div className="w-full flex items-center gap-2">
          <p className="text-neutral600 w-14 text-sm">GitHub</p>
          <input
            type="text"
            value={links.github}
            onChange={(e) => setLinks({ ...links, github: e.target.value })}
            className="placeholder:text-neutral400 w-64 
            p-2 bg-neutral100 border border-neutral200 
            rounded-md gap-2 text-neutral500 text-sm"
            placeholder="https://github.com/mattdegods"
            disabled={isUpdating}
          />
        </div>
        <div className="w-full flex items-center gap-2">
          <p className="text-neutral600 w-14 text-sm">Twitter</p>
          <input
            type="text"
            value={links.twitter}
            onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
            className="placeholder:text-neutral400 w-64 
            p-2 bg-neutral100 border border-neutral200 
            rounded-md gap-2 text-neutral500 text-sm"
            placeholder="https://twitter.com/mattdegods"
            disabled={isUpdating}
          />
        </div>
        <div className="w-full flex items-center gap-2">
          <p className="text-neutral600 w-14 text-sm">LinkedIn</p>
          <input
            type="text"
            value={links.linkedin}
            onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
            className="placeholder:text-neutral400 w-64
            p-2 bg-neutral100 border border-neutral200 
            rounded-md gap-2 text-neutral500 text-sm"
            placeholder="https://linkedin.com/in/mattdegods"
            disabled={isUpdating}
          />
        </div>
      </div>
      <ResumeCard
        resumeUrl={resumeUrl}
        setResumeUrl={setResumeUrl}
        editing={true}
      />
    </div>
  );
};

export default EditLinks;
