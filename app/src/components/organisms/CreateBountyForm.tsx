import { useEffect, useState } from "react";
import { marked } from "marked";
import { createFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { Button, LoadingBar } from "@/src/components";
import { api } from "@/src/utils/api";
import { Octokit } from "octokit";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION } from "@/pages/create";
import { FUND_BOUNTY_STEPS } from "./JoyrideWrapper";

const Form: React.FC<{
  setFormSection: (section: FORM_SECTION) => void;
  createAccountPoll: (publicKey: PublicKey) => void;
}> = ({ setFormSection, createAccountPoll }) => {
  const {
    currentWallet,
    program,
    provider,
    currentUser,
    setCurrentBounty,
    isTutorialActive,
    setIsTutorialRunning,
    setCurrentTutorialStep,
    setTutorialSteps,
  } = useLancer();
  const { mutateAsync } = api.bounties.createBounty.useMutation();
  const { mutateAsync: createIssue } = api.issues.createIssue.useMutation();
  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [repo, setRepo] = useState<any>();
  const [issue, setIssue] = useState<any>();
  const [formData, setFormData] = useState({
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: false,
  });
  const [isOpenRepo, setIsOpenRepo] = useState(false);
  const [isOpenIssue, setIsOpenIssue] = useState(false);
  const [repos, setRepos] = useState(null);
  const [failedToGetRepos, setFailedToGetRepos] = useState(false);
  const [failedToCreateIssue, setFailedToCreateIssue] = useState(false);
  const [issues, setIssues] = useState(null);
  const [octokit, setOctokit] = useState(null);
  const { currentAPIKey } = useLancer();

  const [isPreview, setIsPreview] = useState(false);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const toggleOpenRepo = () => {
    setIsOpenRepo(!isOpenRepo);
    if (isTutorialActive && !isOpenRepo) {
      setIsTutorialRunning(false);
    }
  };
  const toggleOpenIssue = () => setIsOpenIssue(!isOpenIssue);
  const togglePreview = () => setIsPreview(!isPreview);

  useEffect(() => {
    const getRepos = async () => {
      try {
        const octokit = new Octokit({
          auth: currentAPIKey.token,
        });
        const octokitResponse = await octokit.request("GET /user/repos", {
          type: "all",
          per_page: 100,
        });
        setRepos(octokitResponse.data);
        setOctokit(octokit);
      } catch (error) {
        setFailedToGetRepos(true);
        setRepos([]);
      }
    };
    if (currentAPIKey) {
      getRepos();
    }
  }, [currentAPIKey]);

  const createBounty = async () => {
    setIsSubmittingIssue(true);
    setIsTutorialRunning(false);

    let issueNumber = issue ? issue.number : null;
    const [organizationName, repositoryName] = repo.full_name.split("/");
    try {
      if (creationType === "new") {
        const octokitData = await octokit.request(
          "POST /repos/{owner}/{repo}/issues",
          {
            owner: organizationName,
            repo: repositoryName,
            title: formData.issueTitle,
            body: formData.issueDescription,
          }
        );
        issueNumber = octokitData.data.number;
      }
    } catch (error) {
      setFailedToCreateIssue(true);
      setIsSubmittingIssue(false);
      return;
    }
    const { timestamp, signature, escrowKey } = await createFFA(
      currentWallet,
      program,
      provider
    );
    createAccountPoll(escrowKey);
    const { bounty } = await mutateAsync({
      email: currentUser.email,
      description: formData.issueDescription,
      estimatedTime: parseFloat(formData.estimatedTime),
      isPrivate: formData.isPrivate || repo ? repo.private : false,
      isPrivateRepo: formData.isPrivate || repo ? repo.private : false,
      title: formData.issueTitle,
      tags: formData.requirements,
      organizationName,
      repositoryName,
      publicKey: currentWallet.publicKey.toString(),
      escrowKey: escrowKey.toString(),
      transactionSignature: signature,
      provider: currentWallet.providerName,
      timestamp: timestamp,
      chainName: "Solana",
      network: "mainnet",
    });

    const issueResp = await createIssue({
      number: issueNumber,
      description: formData.issueDescription,
      title: formData.issueTitle,

      organizationName: repo ? repo.full_name.split("/")[0] : "Lancer-DAO",
      repositoryName: repo ? repo.full_name.split("/")[1] : "github-app",
      bountyId: bounty.id,
      linkingMethod: creationType,
      currentUserId: currentUser.id,
    });
    setFormSection("FUND");

    if (isTutorialActive) {
      setCurrentTutorialStep(0);
      setTutorialSteps(FUND_BOUNTY_STEPS);
      setIsTutorialRunning(true);
    }
    setCurrentBounty(issueResp);
  };

  const getRepoIssues = async (_repo) => {
    const octokitResponse = await octokit.request(
      "GET /repos/{owner}/{repo}/issues",
      {
        owner: _repo.owner.login,
        repo: _repo.name,
      }
    );

    setIssues(octokitResponse.data);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeRepo = (repoFullName: string) => {
    const repo = repos.find((_repo) => _repo.full_name === repoFullName);
    setRepo(repo);
    getRepoIssues(repo);
    if (isTutorialActive) {
      setCurrentTutorialStep(1);
      setIsTutorialRunning(true);
    }
  };

  const handleChangeIssue = (issueNumber: number) => {
    const issue = issues.find((_issue) => _issue.number === issueNumber);
    setIssue(issue);
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
    <div className="form-container">
      <div className="form">
        <>
          <div id="job-information" className="form-layout-flex">
            <h2
              id="w-node-a3d1ad77-e5aa-114b-bcd7-cde3db1bb746-0ae9cdc2"
              className="form-subtitle"
            >
              New Lancer Bounty
            </h2>

            <label>
              Project<span className="color-red">*</span>
            </label>
            <div
              id="w-node-_11ff66e2-bb63-3205-39c9-a48a569518d9-0ae9cdc2"
              className="input-container-full-width"
            >
              {failedToGetRepos && (
                <span className="color-red">
                  THERE WAS A PROBLEM WITH YOUR GITHUB API TOKEN
                </span>
              )}
              {!currentAPIKey && (
                <span className="color-red">PLEASE SET YOUR API KEY</span>
              )}
              {!repos && currentAPIKey && !failedToGetRepos && (
                <LoadingBar title="Loading Repositories" />
              )}
              {repos && (
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
                          {repo ? (
                            repo.full_name
                          ) : (
                            <div>
                              Select Project{" "}
                              <span className="color-red">* </span>
                            </div>
                          )}
                        </div>
                      </>
                    }
                  </main>
                  {isOpenRepo && repos && (
                    <div
                      className="w-dropdown-list"
                      onMouseLeave={() => setIsOpenRepo(false)}
                    >
                      {repos.map((project) => (
                        <div
                          onClick={() => handleChangeRepo(project.full_name)}
                          key={project.full_name}
                          className="w-dropdown-link"
                        >
                          {project.full_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {repo && (
              <div className="issue-creation-type">
                <div
                  className={classnames("form-subtitle hover-effect", {
                    unselected: creationType !== "new",
                  })}
                  onClick={() => setCreationType("new")}
                >
                  Create a New GitHub Issue
                </div>
                <div>OR</div>
                <div
                  className={classnames("form-subtitle hover-effect", {
                    unselected: creationType !== "existing",
                  })}
                  onClick={() => setCreationType("existing")}
                >
                  Link an Existing GitHub Issue
                </div>
              </div>
            )}
            {repo && creationType === "new" && (
              <>
                <div>
                  <label>
                    Issue Title<span className="color-red">*</span>
                  </label>
                  <input
                    type="text"
                    className="input w-input"
                    name="issueTitle"
                    placeholder="Ex. Add New Feature "
                    id="issue-title-input"
                    value={formData.issueTitle}
                    onChange={handleChange}
                    onBlur={() => {
                      if (isTutorialActive && formData.issueTitle.length > 0) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(2);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isTutorialActive && formData.issueTitle.length > 0) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(2);
                      }
                    }}
                    onFocus={() => {
                      if (isTutorialActive) {
                        setIsTutorialRunning(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="field-label-2">
                    Est. Time to Completion<span className="color-red">*</span>
                  </label>
                  <input
                    type="number"
                    className="input w-input"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    placeholder="Ex. 3 (hours)"
                    id="issue-time-input"
                    onBlur={() => {
                      if (
                        isTutorialActive &&
                        formData.estimatedTime.length > 0
                      ) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(3);
                      }
                    }}
                    onMouseLeave={() => {
                      if (
                        isTutorialActive &&
                        formData.estimatedTime.length > 0
                      ) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(3);
                      }
                    }}
                    onFocus={() => {
                      if (isTutorialActive) {
                        setIsTutorialRunning(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="field-label">
                    Coding Languages<span className="color-red">* </span>
                  </label>
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
                        isTutorialActive &&
                        formData.requirements.length > 0
                      ) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(4);
                      }
                    }}
                    onMouseLeave={() => {
                      if (
                        isTutorialActive &&
                        formData.requirements.length > 0
                      ) {
                        setIsTutorialRunning(true);
                        setCurrentTutorialStep(4);
                      }
                    }}
                    onFocus={() => {
                      if (isTutorialActive) {
                        setIsTutorialRunning(false);
                      }
                    }}
                  />
                </div>
                <div
                  id="w-node-_19e3179a-ebf7-e568-5dcf-3c0e607846d8-0ae9cdc2"
                  className="input-container-full-width"
                >
                  <div className="description-label">
                    <label>
                      Description<span className="color-red">*</span>
                    </label>
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
                          isTutorialActive &&
                          formData.issueDescription.length > 0
                        ) {
                          setIsTutorialRunning(true);
                          setCurrentTutorialStep(5);
                        }
                      }}
                      onMouseLeave={() => {
                        if (
                          isTutorialActive &&
                          formData.issueDescription.length > 0
                        ) {
                          setIsTutorialRunning(true);
                          setCurrentTutorialStep(5);
                        }
                      }}
                      onFocus={() => {
                        if (isTutorialActive) {
                          setIsTutorialRunning(false);
                        }
                      }}
                    />
                  )}
                </div>
                <div className="required-helper">
                  <span className="color-red">* </span> Required
                </div>
                {/* <label className="w-checkbox checkbox-field-2">
                  <div
                    className={classnames(
                      "w-checkbox-input w-checkbox-input--inputType-custom checkbox",
                      {
                        checked:
                          formData.isPrivate || repo ? repo.private : false,
                        disabled: repo ? repo.private : false,
                      }
                    )}
                    onChange={handleCheckboxChange}
                  />

                  <label className="check-label">
                    Is this a Private Issue?
                  </label>
                  <p className="check-paragraph">
                    Only GitHub collaborators will have access to see this.
                  </p>
                </label> */}

                <Button
                  disabled={
                    failedToCreateIssue ||
                    !formData.estimatedTime ||
                    !formData.requirements ||
                    !currentWallet
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
                </Button>
              </>
            )}
            {repo && creationType === "existing" && (
              <>
                <label>
                  Issue<span className="color-red">*</span>
                </label>
                <div
                  id="w-node-_11ff66e2-bb63-3205-39c9-a48a569518d9-0ae9cdc2"
                  className="input-container-full-width"
                >
                  <div
                    data-delay="0"
                    data-hover="false"
                    id="w-node-b1521c3c-4fa1-4011-ae36-88dcb6e746fb-0ae9cdc2"
                    className="w-dropdown"
                    onClick={toggleOpenIssue}
                  >
                    <main className="dropdown-toggle-2 w-dropdown-toggle">
                      <div className="w-icon-dropdown-toggle"></div>
                      <div>
                        {issues ? (
                          issue ? (
                            `#${issue.number}: ${issue.title}`
                          ) : (
                            <div>
                              Select Issue <span className="color-red">* </span>
                            </div>
                          )
                        ) : (
                          "Loading Issues"
                        )}
                      </div>
                    </main>
                    {isOpenIssue && issues && (
                      <div
                        className="w-dropdown-list"
                        onMouseLeave={() => setIsOpenRepo(false)}
                      >
                        {issues.map((issue) => (
                          <div
                            onClick={() => handleChangeIssue(issue.number)}
                            key={issue.number}
                            className="w-dropdown-link"
                          >
                            {`#${issue.number}: ${issue.title}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="field-label-2">
                    Est. Time to Completion<span className="color-red">*</span>
                  </label>
                  <input
                    type="number"
                    className="input w-input"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    placeholder="Ex. 3 (hours)"
                    id="Issue-Description"
                  />
                </div>
                <div>
                  <label className="field-label">
                    Coding Languages<span className="color-red">* </span>
                  </label>
                  <input
                    type="text"
                    className="input w-input"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleRequirementsChange}
                    placeholder="list seperated by commas"
                    id="Job-Location-2"
                  />
                </div>

                <Button
                  disabled={
                    failedToCreateIssue ||
                    !issue ||
                    !formData.estimatedTime ||
                    !formData.requirements
                  }
                  disabledText={
                    failedToCreateIssue
                      ? "Failed to Create Issue"
                      : "Please fill all required fields"
                  }
                  onClick={createBounty}
                  id="create-bounty-button"
                >
                  {failedToCreateIssue ? "Failed to Create Issue" : "Submit"}
                </Button>
              </>
            )}
          </div>
        </>
      </div>
    </div>
  );
};

export default Form;
