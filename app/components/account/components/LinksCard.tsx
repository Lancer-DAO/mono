import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { useState } from "react";
import { Check, Edit, X } from "react-feather";
import EditLinks from "./EditLinks";
import { useAccount } from "@/src/providers/accountProvider";
import ViewLinks from "./ViewLinks";

const LinksCard = () => {
  const { mutateAsync: updateLinks, isLoading: isUpdating } =
    api.users.updateLinks.useMutation();
  const { account, setAccount } = useAccount();
  const { currentUser } = useUserWallet();

  const [editLinksMode, setEditLinksMode] = useState(false);
  const [links, setLinks] = useState({
    website: account?.website || "",
    github: account?.github || "",
    linkedin: account?.linkedin || "",
    twitter: account?.twitter || "",
  });
  const [resumeUrl, setResumeUrl] = useState(
    self ? currentUser?.resume : account?.resume
  );

  const handleEditLinks = () => {
    setEditLinksMode(true);
  };

  const handleUpdateLinks = async () => {
    const updatedLinks = await updateLinks({
      website: links.website,
      twitter: links.twitter,
      github: links.github,
      linkedin: links.linkedin,
    });

    setEditLinksMode(false);

    setLinks({
      website: updatedLinks?.website,
      twitter: updatedLinks?.twitter,
      github: updatedLinks?.github,
      linkedin: updatedLinks?.linkedin,
    });

    setAccount({
      ...account,
      website: updatedLinks?.website,
      twitter: updatedLinks?.twitter,
      github: updatedLinks?.github,
      linkedin: updatedLinks?.linkedin,
    });
  };

  return (
    <div className="p-5 pt-0">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-neutral600 title-text">Links</p>
        {account?.id === currentUser.id && (
          <>
            {editLinksMode ? (
              <div className="flex items-center">
                <button
                  onClick={handleUpdateLinks}
                  className="text-success mr-2 mb-0"
                >
                  <Check />
                </button>
                <button
                  onClick={() => {
                    setLinks({
                      website: links.website,
                      twitter: links?.twitter,
                      github: links?.github,
                      linkedin: links?.linkedin,
                    });
                    setEditLinksMode(false);
                  }}
                  className="text-error"
                >
                  <X />
                </button>
              </div>
            ) : (
              <button onClick={handleEditLinks} className="text-neutral500">
                <Edit className="w-4" />
              </button>
            )}
          </>
        )}
      </div>
      {account && (
        <>
          {editLinksMode ? (
            <EditLinks
              links={links}
              setLinks={setLinks}
              isUpdating={isUpdating}
              resumeUrl={resumeUrl}
              setResumeUrl={setResumeUrl}
            />
          ) : (
            <ViewLinks
              website={links.website}
              twitter={links.twitter}
              github={links.github}
              linkedin={links.linkedin}
              resumeUrl={resumeUrl}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LinksCard;
