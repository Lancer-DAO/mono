import { useEffect, useState } from "react";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { useUserWallet } from "@/src/providers";
import { Check, Edit } from "react-feather";
import ViewLinks from "./ViewLinks";
import EditLinks from "./EditLinks";

const LinksCard = () => {
  const router = useRouter();
  const [editLinksMode, setEditLinksMode] = useState(false);
  const { mutateAsync: updateLinks, isLoading: isUpdating } =
    api.users.updateLinks.useMutation();

  const { currentUser } = useUserWallet();
  const {
    data: fetchedUser,
    isLoading: userIsLoading,
    isError: userIsError,
  } = api.users.getUser.useQuery({
    id: parseInt(router.query.account as string) || currentUser.id,
  });

  const [links, setLinks] = useState({
    website: fetchedUser?.website || "",
    github: fetchedUser?.github || "",
    linkedin: fetchedUser?.linkedin || "",
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
        {fetchedUser?.id === currentUser.id && (
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
      {userIsLoading && <div>Loading Links</div>}
      {fetchedUser && !userIsLoading && !userIsError && (
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
