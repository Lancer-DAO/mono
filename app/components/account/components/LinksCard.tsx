import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Check, Edit, X } from "react-feather";
import EditLinks from "./EditLinks";
import ViewLinks from "./ViewLinks";

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
    twitter: fetchedUser?.twitter || "",
    github: fetchedUser?.github || "",
    linkedin: fetchedUser?.linkedin || "",
  });

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
  };

  return (
    <div className="my-3">
      <div className="flex items-center gap-2">
        <p className="text-textGreen font-bold text-2xl">Links</p>
        {fetchedUser?.id === currentUser.id && (
          <>
            {editLinksMode ? (
              <div>
                <button
                  onClick={handleUpdateLinks}
                  className="rounded-md uppercase font-bold text-textGreen mr-2 mb-0"
                >
                  <Check />
                </button>
                <button onClick={() => setEditLinksMode(false)} className="rounded-md upprecase font-bold text-textRed">
                  <X />
                </button>
              </div>
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
              twitter={links.twitter}
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
