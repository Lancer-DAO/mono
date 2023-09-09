import { useEffect, useState } from "react";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { useUserWallet } from "@/src/providers";
import { Check, Edit } from "react-feather";
import ViewLinks from "./ViewLinks";
import EditLinks from "./EditLinks";
import { useAccount } from "@/src/providers/accountProvider";

const LinksCard = () => {
  const router = useRouter();
  const [editLinksMode, setEditLinksMode] = useState(false);
  const { mutateAsync: updateLinks, isLoading: isUpdating } =
    api.users.updateLinks.useMutation();
  const { account } = useAccount();

  const { currentUser } = useUserWallet();

  const [links, setLinks] = useState({
    website: account?.website || "",
    github: account?.github || "",
    linkedin: account?.linkedin || "",
  });

  const handleEditLinks = () => {
    setEditLinksMode(true);
  };

  const handleUpdateLinks = async () => {
    const updatedLinks = await updateLinks({
      website: links.website,
      github: links.github,
      linkedin: links.linkedin,
    });
    setEditLinksMode(false);
    setLinks({
      website: updatedLinks?.website,
      github: updatedLinks?.github,
      linkedin: updatedLinks?.linkedin,
    });
  };

  return (
    <div className="my-3">
      <div className="flex items-center gap-2">
        <p className="text-textGreen font-bold text-2xl">Links</p>
        {account?.id === currentUser.id && (
          <>
            {editLinksMode ? (
              <button
                onClick={handleUpdateLinks}
                className="rounded-md uppercase font-bold text-textGreen"
              >
                <Check />
              </button>
            ) : (
              <button
                onClick={handleEditLinks}
                className="rounded-md uppercase font-bold text-textGreen"
              >
                <Edit />
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
            />
          ) : (
            <ViewLinks
              website={links.website}
              github={links.github}
              linkedin={links.linkedin}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LinksCard;
