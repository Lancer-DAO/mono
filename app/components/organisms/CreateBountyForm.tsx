import { useEffect, useState } from "react";
import { marked } from "marked";
import { createFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import classnames from "classnames";
import { Button, MultiSelectDropdown } from "@/components";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { IS_MAINNET } from "@/src/constants";
import * as Prisma from "@prisma/client";
import Image from "next/image";
import { FORM_SECTION } from "@/types/forms";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import Toggle, { ToggleConfig } from "../molecules/Toggle";

const Form: React.FC<{
  setFormSection: (section: FORM_SECTION) => void;
  createAccountPoll: (publicKey: PublicKey) => void;
}> = ({ setFormSection, createAccountPoll }) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();

  const { setCurrentBounty } = useBounty();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { mutateAsync } = api.bounties.createBounty.useMutation();
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [mint, setMint] = useState<Prisma.Mint>();

  const [formData, setFormData] = useState({
    category: "",
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issuePrice: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: true,
  });
  const [isOpenMints, setIsOpenMints] = useState(false);
  const [isOpenIssue, setIsOpenIssue] = useState(false);
  const [mints, setMints] = useState<Prisma.Mint[]>([]);
  const [failedToGetRepos, setFailedToGetRepos] = useState(false);
  const [failedToCreateIssue, setFailedToCreateIssue] = useState(false);

  const [isPreview, setIsPreview] = useState(false);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Fixed",
    },
    option2: {
      title: "Request",
    },
    selected: "option1",
  });

  const categoryOptions = [
    {
      label: "Engineering",
      value: "Engineering",
    },
  ];

  const toggleOpenRepo = () => {
    setIsOpenMints(!isOpenMints);
  };
  // const toggleOpenIssue = () => setIsOpenIssue(!isOpenIssue);
  const togglePreview = () => setIsPreview(!isPreview);

  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
    };
    getMints();
  }, []);

  const createBounty = async () => {
    setIsSubmittingIssue(true);
    if (
      currentTutorialState?.title ===
        CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
      currentTutorialState.currentStep === 5
    ) {
      setCurrentTutorialState({
        ...currentTutorialState,
        isRunning: false,
      });
    }

    const mintKey = new PublicKey(mint.publicKey);

    const { timestamp, signature, escrowKey } = await createFFA(
      currentWallet,
      program,
      provider,
      mintKey
    );
    createAccountPoll(escrowKey);
    const bounty = await mutateAsync({
      email: currentUser.email,
      description: formData.issueDescription,
      estimatedTime: parseFloat(formData.estimatedTime),
      isPrivate: formData.isPrivate,
      // isPrivateRepo: formData.isPrivate || repo ? repo.private : false,
      title: formData.issueTitle,
      tags: formData.requirements,
      publicKey: currentWallet.publicKey.toString(),
      escrowKey: escrowKey.toString(),
      transactionSignature: signature,
      timestamp: timestamp,
      chainName: "Solana",
      mint: mint.id,
      network: IS_MAINNET ? "mainnet" : "devnet",
    });

    setFormSection("FUND");

    setCurrentBounty(bounty);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeMint = (mint: Prisma.Mint) => {
    const newMint = mints.find((_mint) => _mint.name === mint.name);
    setMint(newMint);
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      isPrivate: !formData.isPrivate,
    });
  };

  const handleRequirementsChange = (event) => {
    const requirements = event.target.value.split(",");
    setFormData({
      ...formData,
      requirements,
    });
  };

  const handleDescriptionChange = (event) => {
    setFormData({
      ...formData,
      issueDescription: event.target.value,
    });
  };

  const previewMarkup = () => {
    const markdown = marked.parse(formData.issueDescription, { breaks: true });
    return { __html: markdown };
  };

  return (
    <div className="w-full flex flex-col gap-4 text-2xl mt-6">
      <div className="flex items-center">
        <label className="text-textGreen/50 pr-4">Category</label>
        <MultiSelectDropdown
          options={categoryOptions}
          selected={categoryOptions.filter(
            (option) => option.value === formData.category ?? undefined
          )}
          onChange={(options) => {
            setFormData({
              ...formData,
              category: options[0]?.value ?? "",
            });
          }}
        />
      </div>
      <div className="flex items-center">
        <label className="text-textGreen/50 pr-4">Price</label>
        <div className="flex items-center">
          <Toggle
            toggleConfig={toggleConfig}
            setToggleConfig={setToggleConfig}
          />
          <input
            type="number"
            className="input w-input"
            name="issuePrice"
            placeholder="1200"
            value={formData.issuePrice}
            onChange={handleChange}
            // onBlur={() => {
            //   if (
            //     formData.issueTitle !== "" &&
            //     !!currentTutorialState &&
            //     currentTutorialState.isActive
            //   ) {
            //     if (
            //       currentTutorialState?.title ===
            //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
            //       currentTutorialState.currentStep === 1
            //     ) {
            //       setCurrentTutorialState({
            //         ...currentTutorialState,
            //         currentStep: 2,
            //       });
            //     }
            //   }
            // }}
            // onMouseLeave={() => {
            //   if (
            //     formData.issueTitle !== "" &&
            //     !!currentTutorialState &&
            //     currentTutorialState.isActive
            //   ) {
            //     if (
            //       currentTutorialState?.title ===
            //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
            //       currentTutorialState.currentStep === 1
            //     ) {
            //       setCurrentTutorialState({
            //         ...currentTutorialState,
            //         currentStep: 2,
            //         isRunning: true,
            //       });
            //     }
            //   }
            // }}
            // onFocus={() => {
            //   if (!!currentTutorialState && currentTutorialState.isActive) {
            //     if (
            //       currentTutorialState?.title ===
            //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
            //       currentTutorialState.currentStep === 1
            //     ) {
            //       setCurrentTutorialState({
            //         ...currentTutorialState,
            //         isRunning: false,
            //       });
            //     }
            //   }
            // }}
          />
        </div>
      </div>
      <div>
        <label className="text-textGreen/50 pr-4">Title</label>
        <input
          type="text"
          className="input w-input"
          name="issueTitle"
          placeholder="Ex. Add New Feature "
          id="issue-title-input"
          value={formData.issueTitle}
          onChange={handleChange}
          onBlur={() => {
            if (
              formData.issueTitle !== "" &&
              !!currentTutorialState &&
              currentTutorialState.isActive
            ) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 1
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  currentStep: 2,
                });
              }
            }
          }}
          onMouseLeave={() => {
            if (
              formData.issueTitle !== "" &&
              !!currentTutorialState &&
              currentTutorialState.isActive
            ) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 1
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  currentStep: 2,
                  isRunning: true,
                });
              }
            }
          }}
          onFocus={() => {
            if (!!currentTutorialState && currentTutorialState.isActive) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 1
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  isRunning: false,
                });
              }
            }
          }}
        />
      </div>
      <div>
        <div className="description-label">
          <label className="text-textGreen/50 pr-4">Description</label>
          <button
            className="button-primary hug no-box-shadow"
            onClick={(e) => {
              e.preventDefault();
              togglePreview();
            }}
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {isPreview ? (
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={previewMarkup()}
          />
        ) : (
          <textarea
            id="issue-description-input"
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleDescriptionChange}
            placeholder="Provide a step by step breakdown of what is needed to complete the task. Include criteria that will determine success. **Markdown Supported** "
            className="textarea w-input"
            onBlur={() => {
              if (
                formData.issueDescription !== "" &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 4
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 5,
                  });
                }
              }
            }}
            onMouseLeave={() => {
              if (
                formData.issueDescription !== "" &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 4
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 5,
                    isRunning: true,
                  });
                }
              }
            }}
            onFocus={() => {
              if (!!currentTutorialState && currentTutorialState.isActive) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 4
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    isRunning: false,
                  });
                }
              }
            }}
          />
        )}
      </div>
      <div>
        <label className="text-textGreen/50 pr-4">Tags</label>
        <input
          type="text"
          className="input w-input"
          name="requirements"
          value={formData.requirements}
          onChange={handleRequirementsChange}
          placeholder="list seperated by commas"
          id="issue-requirements-input"
          onBlur={() => {
            if (
              formData.requirements.length !== 0 &&
              !!currentTutorialState &&
              currentTutorialState.isActive
            ) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 3
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  currentStep: 4,
                });
              }
            }
          }}
          onMouseLeave={() => {
            if (
              formData.requirements.length !== 0 &&
              !!currentTutorialState &&
              currentTutorialState.isActive
            ) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 3
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  currentStep: 4,
                  isRunning: true,
                });
              }
            }
          }}
          onFocus={() => {
            if (!!currentTutorialState && currentTutorialState.isActive) {
              if (
                currentTutorialState?.title ===
                  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                currentTutorialState.currentStep === 3
              ) {
                setCurrentTutorialState({
                  ...currentTutorialState,
                  isRunning: false,
                });
              }
            }
          }}
        />
      </div>
      {/* <label className="w-checkbox checkbox-field-2">
        <div
          className={classnames(
            "w-checkbox-input w-checkbox-input--inputType-custom checkbox",
            {
              checked: formData.isPrivate,
            }
          )}
          onClick={handleCheckboxChange}
        />

        <label className="check-label">Is this a private Bounty?</label>
        <p className="check-paragraph">
          If so, only users with the link will be able to see it.
        </p>
      </label>
      <label>
        Funding Type<span className="color-red">*</span>
      </label>
      {mints && (
        <div
          data-delay="0"
          data-hover="false"
          id="w-node-b1521c3c-4fa1-4011-ae36-88dcb6e746fb-0ae9cdc2"
          className="w-dropdown"
          onClick={toggleOpenRepo}
        >
          <main
            className="dropdown-toggle-2 w-dropdown-toggle"
            id="repo-dropdown-select"
          >
            {
              <>
                <div className="w-icon-dropdown-toggle"></div>
                <div>
                  {mint ? (
                    <div className="flex">
                      <Image
                        className="rounded-[50%] mr-[10px]"
                        src={mint.logo}
                        alt={mint.name}
                        width={36}
                        height={36}
                      />
                      <div>{mint.name}</div>
                    </div>
                  ) : (
                    <div>
                      Select Mint <span className="color-red">* </span>
                    </div>
                  )}
                </div>
              </>
            }
          </main>
          {isOpenMints && mints && (
            <div
              className="w-dropdown-list"
              onMouseLeave={() => setIsOpenMints(false)}
            >
              {mints.map((mint) => (
                <div
                  onClick={() => handleChangeMint(mint)}
                  key={mint.name}
                  className="w-dropdown-link flex"
                >
                  <div className="flex">
                    <Image
                      className="rounded-[50%] mr-[10px]"
                      src={mint.logo}
                      alt={mint.name}
                      width={36}
                      height={36}
                    />
                    <div>{mint.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="required-helper">
        <span className="color-red">* </span> Required
      </div>
      <Button
        disabled={
          failedToCreateIssue ||
          !formData.estimatedTime ||
          !formData.requirements
          // ||
          // !currentWallet
        }
        disabledText={
          failedToCreateIssue
            ? "Failed to Create Issue"
            : "Please fill all required fields"
        }
        onClick={createBounty}
        id="create-bounty-button"
      >
        {failedToCreateIssue
          ? "Failed to Create Issue"
          : !!currentWallet
          ? "Submit"
          : "Please connect your wallet"}
      </Button> */}
    </div>
  );
};

export default Form;
