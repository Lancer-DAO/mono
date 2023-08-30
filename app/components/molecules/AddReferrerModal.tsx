import { useEffect, useState } from "react";

import { FC, useRef } from "react";
import { useOutsideAlerter, useDebounce } from "@/hooks";
import { api } from "@/src/utils/api";
import { Button, ContributorInfo } from "@/components/atoms";
import { User, UserSearch, UserSearchIndividual } from "@/types/Bounties";

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

export const AddReferrerModal: FC<Props> = ({ showModal, setShowModal }) => {
  const wrapperRef = useRef(null);
  const { mutateAsync: search } = api.users.search.useMutation();
  const { mutateAsync: addReferrerAPI } = api.users.addReferrer.useMutation();
  const [query, setQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<UserSearch>([]);
  const debouncedQuery = useDebounce(query, 500);
  const [referrer, setReferrer] = useState<UserSearchIndividual>();
  useOutsideAlerter(wrapperRef, () => {
    setShowModal(false);
    setReferrer(undefined);
  });

  useEffect(() => {
    const searchUsers = async () => {
      try {
        if (referrer) {
          setReferrer(undefined);
        }
        const searchedUsers = await search({ query: debouncedQuery });
        setSearchedUsers(searchedUsers);
      } catch (error) {
        console.log(error);
      }
    };
    if (debouncedQuery !== "") {
      searchUsers();
    }
  }, [debouncedQuery]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const addReferrer = async () => {
    try {
      const referrerWallet = referrer.wallets.find(
        (wallet) => wallet.id === referrer.profileWalletId
      );
      //   USE THIS PUBLIC KEY TO ADD REFERRER

      setShowModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {showModal ? (
        <div className="modal-wrapper">
          <div className="modal-inner" ref={wrapperRef}>
            <h2 className="modal-header">Who Referred you to Lancer?</h2>
            <div className="api-key-input-wrapper">
              <div className="api-key-input-header">GitHub Username</div>

              <input
                type="text"
                className="input w-input"
                placeholder="GitHub Username"
                value={query}
                onChange={(e) => {
                  handleInputChange(e);
                }}
              />
            </div>
            <div>
              {!referrer &&
                (searchedUsers.length === 0 ? (
                  <div>No Users Found</div>
                ) : (
                  <div
                    data-delay="0"
                    data-hover="false"
                    id="w-node-b1521c3c-4fa1-4011-ae36-88dcb6e746fb-0ae9cdc2"
                    className="w-dropdown"
                  >
                    {
                      <div className="w-dropdown-list">
                        {searchedUsers.map((searchedUser) => (
                          <div
                            onClick={() => setReferrer(searchedUser)}
                            key={searchedUser.id}
                            className="w-dropdown-link"
                          >
                            <ContributorInfo
                              user={searchedUser}
                              disableLink={true}
                            />
                          </div>
                        ))}
                      </div>
                    }
                  </div>
                ))}
              {referrer && (
                <div className="flex p-2">
                  <ContributorInfo user={referrer} disableLink={true} />
                </div>
              )}
            </div>

            <Button disabled={!referrer} onClick={addReferrer}>
              Add Referrer
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};
