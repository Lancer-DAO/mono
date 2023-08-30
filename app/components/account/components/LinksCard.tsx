import { useEffect, useState } from "react";
import { api } from "@/src/utils";
import { useRouter } from "next/router";
import { currentUser } from "@/server/api/routers/users/currentUser";
import { useUserWallet } from "@/src/providers";
import { IAsyncResult, User } from "@/types";
import Link from "next/link";
import { Check, Edit } from "react-feather";
import { AccountType } from "@solana/spl-token";

const LinksCard = () => {
  const router = useRouter();
  const [links, setLinks] = useState({
    website: "",
    github: "",
    linkedin: ""
  });
  const [editLinksMode, setEditLinksMode] = useState(false);
  const { mutateAsync: updateLinks, isLoading: isUpdating } = api.users.updateLinks.useMutation();

  const { currentUser } = useUserWallet();
  const { data: fetchedUser } = api.users.getUser.useQuery(
    {
      id: parseInt(router.query.account as string) || currentUser.id,
    },
    {
      enabled: !!router.query.account,
    }
  );

  const [account, setAccount] = useState<IAsyncResult<User>>({
    isLoading: true,
    loadingPrompt: "Loading Profile",
  });

  useEffect(() => {
    const getUserAsync = async () => {
      if (router.query.account !== undefined) {
        const fetchAccount = async () => {
          try {
            setAccount({ ...account, result: fetchedUser });
          } catch (e) {
            console.log("Error fetching account: ", e);
            setAccount({ error: e });
          }
        };
        fetchAccount();
      } else {
        try {
          let loadingPrompt = "Loading Profile";
          setAccount({ isLoading: true, loadingPrompt });

          setAccount({
            isLoading: false,
            loadingPrompt,
            result: currentUser,
            error: null,
          });
        } catch (e) {
          setAccount({ error: e });
          console.log("Error fetching account: ", e);
        }
      }
    };
    if (!!currentUser) {
      getUserAsync();
    } else {
      console.log("no user", currentUser);
    }

    console.log('hi', account?.result)
    setLinks({
      website: account?.result?.website || "",
      github: account?.result?.github || "",
      linkedin: account?.result?.linkedin || "",
    });
  }, [currentUser, router.isReady]);

  console.log(fetchedUser);

  const handleEditLinks = () => {
    setEditLinksMode(true);
  };

  const handleUpdateLinks = async () => {
    await updateLinks({ website: links.website, github: links.github, linkedin: links.linkedin });
    setEditLinksMode(false);
  }

  return (
    <div className="my-6">
      <div className="flex items-center">
        <p className="text-textGreen font-bold text-2xl mb-6">Links</p>
        {account?.result?.id === currentUser.id && (
          <> 
            {editLinksMode ? (
              <button
                onClick={handleUpdateLinks}
                className="rounded-md ml-2 mb-4 pb-3 uppercase font-bold text-textGreen"
              >
                <Check />
              </button>
              ) : (
                <button
                  onClick={handleEditLinks}
                  className="rounded-md ml-2 mb-4 pb-3 uppercase font-bold text-textGreen"
                >
                  <Edit />
                </button>
                )}
            </>
        )}
      </div>
      {account.isLoading ? 
      (
        <div>Loading Links</div>
      ) : (
        <>
          <div className="my-4 w-3/4">
            <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Portfolio</p>
            {editLinksMode ? 
            (
              <input
                type="text"
                value={links.website}
                onChange={(e) => setLinks({ ...links, website: e.target.value })}
                className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
                disabled={isUpdating}
              />
            ) : (
              // <>
              //   {links.website && (
                  <Link href={links.website} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
                    {links.website}
                  </Link>
              //   )}
              // </>
            )}
          </div>
          <div className="my-4 w-3/4">
            <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">GitHub</p>
            {editLinksMode ? 
            (
              <input
                type="text"
                value={links.github}
                onChange={(e) => setLinks({ ...links, github: e.target.value })}
                className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
                disabled={isUpdating}
              />
            ) : (
              // <>
              //   {links.github && (
                  <Link href={links.github} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
                    {links.github}
                  </Link>
              //   )}
              // </>
            )}
          </div>
          <div className="my-4 w-3/4">
            <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">LinkedIn</p>
            {editLinksMode ? 
            (
              <input
                type="text"
                value={links.linkedin}
                onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                className="w-full flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden"
                disabled={isUpdating}
              />
            ) : (
              // <>
              //   {links.linkedin && (
                  <Link href={links.linkedin} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
                    {links.linkedin}
                  </Link>
              //   )}
              // </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LinksCard;
