import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { api, decimalToNumber, getSolscanAddress } from "@/utils";
import { marked } from "marked";
import dayjs from "dayjs";
import { PublicKey } from "@solana/web3.js";
import { Clock } from "react-feather";
import { ContributorInfo, Logo } from "@/components";
import { SubmitterSection, BountyActions } from "./components";
import { useBounty } from "@/src/providers/bountyProvider";
import { useUserWallet } from "@/src/providers";

export const Bounty = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const [pollId, setPollId] = useState(null);
  const [bountyAmount, setBountyAmount] = useState("");
  const router = useRouter();
  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();

  useEffect(() => {
    if (router.isReady && currentUser?.id) {
      const getB = async () => {
        const bounty = await getBounty({
          id: parseInt(router.query.bounty as string),
          currentUserId: currentUser.id,
        });
        setCurrentBounty(bounty);
        if (bounty?.escrow?.amount !== null) {
          const amount = decimalToNumber(bounty.escrow.amount).toFixed(2);

          setBountyAmount(amount);
        }
      };
      getB();
    }
  }, [router.isReady, currentUser?.id]);
  useEffect(() => {
    const setFuturePoll = () => {
      setPollId(setTimeout(() => setFuturePoll(), 5000));
    };
    if (!pollId) {
      setPollId(setTimeout(() => setFuturePoll(), 5000));
    }
  }, []);

  if (!currentUser || !currentBounty) {
    return <></>;
  }
  const previewMarkup = () => {
    const markdown = marked.parse(currentBounty.description, { breaks: true });
    return { __html: markdown };
  };

  return (
    <section className="section-job-post wf-section">
      <div className="container-default">
        <div className="w-layout-grid grid-job-post">
          <div
            id="task-container"
            data-w-id="9d97a6aa-31d5-1276-53c2-e76c8908f874"
            className="job-post-container mb-20"
          >
            <div
              id="w-node-_9d97a6aa-31d5-1276-53c2-e76c8908f876-fde9cdb1"
              className="job-post-primary-info"
            >
              <div className="contributor-picture-large">
                <Logo width="100px" height="100px" />
              </div>
              <div className="bounty-page-title-section">
                <div className="bounty-title-row-1">
                  {currentBounty.repository && (
                    <a
                      href={`https://github.com/${currentBounty.repository.organization}`}
                      className="job-post-company-name"
                      target="_blank"
                      rel="noreferrer"
                      id="task-organization-link"
                    >
                      {currentBounty.repository.organization}
                    </a>
                  )}
                  <div
                    className={`currentBounty-state ${currentBounty.state} text-start`}
                    id="task-state"
                  >
                    {currentBounty.state.split("_").join(" ")}
                  </div>
                </div>
                {currentBounty.repository ? (
                  <a
                    className="job-post-title"
                    href={`${currentBounty.repository.githubLink}/issues/${currentBounty.issue.number}`}
                    target="_blank"
                    rel="noreferrer"
                    id="task-title"
                  >
                    {currentBounty.title}
                  </a>
                ) : (
                  <div className="job-post-title" id="task-title">
                    {currentBounty.title}
                  </div>
                )}

                <div className="bounty-title-row-1">
                  <div className="job-post-date" id="task-posted-date">
                    {`${dayjs
                      .unix(parseInt(currentBounty.createdAt) / 1000)
                      .format("MMMM D, YYYY h:mm A")}`}
                  </div>
                  {currentBounty.escrow.publicKey && (
                    <a
                      href={getSolscanAddress(
                        new PublicKey(currentBounty.escrow.publicKey)
                      )}
                      className="job-post-company-name"
                      target="_blank"
                      rel="noreferrer"
                      id="task-escrow-link"
                    >
                      Escrow Contract
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div></div>
            <div className="job-post-middle">
              <div className="job-post-info-container" id="task-estimated-time">
                <Clock />
                <div className="job-post-info-text icon-left">
                  {`${currentBounty.estimatedTime}`} HOURS
                </div>
              </div>
              <div className="job-post-info-divider"></div>
              <div className="job-post-info-container" id="task-requirements">
                <div className="tag-list">
                  {currentBounty.tags.map((tag) => (
                    <div
                      className="tag-item"
                      key={tag.name}
                      style={{ color: tag.color }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="job-post-info-divider"></div>
              <div className="job-post-info-container" id="task-funded-amount">
                <div className="job-post-info-text icon-right">
                  {bountyAmount}
                </div>
                <Image
                  className="rounded-[50%]"
                  src={currentBounty.escrow.mint.logo}
                  alt={currentBounty.escrow.mint.name}
                  width={36}
                  height={36}
                />
              </div>
            </div>
            <div className="job-post-bottom">
              <div id="task-description">
                <h2 className="job-post-subtitle">Job description</h2>
                <div
                  className="bounty-markdown-full"
                  dangerouslySetInnerHTML={previewMarkup()}
                />
              </div>
              {<BountyActions />}
            </div>
          </div>
          <div
            id="w-node-_272b1d4e-bae1-2928-a444-208d5db4485b-fde9cdb1"
            className="w-form"
          >
            <div className="contributors-section" id="links-section">
              {currentBounty.issue && (
                <>
                  <h2>Links</h2>
                  <a
                    href={`${currentBounty.repository.githubLink}/issues/${currentBounty.issue.number}`}
                    target="_blank"
                    rel="noreferrer"
                    id="task-issue-link"
                  >
                    GitHub Issue
                  </a>
                </>
              )}
              {currentBounty.pullRequests.length > 0 && (
                <a
                  href={`${currentBounty.repository.githubLink}/issues/${currentBounty.pullRequests[0].number}`}
                  target="_blank"
                  rel="noreferrer"
                  id="task-pull-request-link"
                >
                  GitHub Pull Request
                </a>
              )}
            </div>
            <div className="contributors-section" id="contributors-section">
              <h2>Contributors</h2>
              {currentBounty?.creator && (
                <div id="task-creator">
                  <label className="field-label-10">Creator</label>
                  <ContributorInfo user={currentBounty.creator.user} />
                </div>
              )}
              {currentBounty && currentBounty.deniedRequesters.length > 0 && (
                <div id="task-denied-requested-submitters">
                  <label className="field-label-5">Denied Requesters</label>
                  {currentBounty.deniedRequesters.map((submitter) => (
                    <ContributorInfo
                      user={submitter.user}
                      key={submitter.userid}
                    />
                  ))}
                </div>
              )}
              {currentBounty &&
                currentBounty.requestedSubmitters.length > 0 &&
                currentBounty.isCreator && (
                  <div id="task-requested-submitters">
                    <label className="field-label-5">
                      Requested Applicants
                    </label>
                    {currentBounty.requestedSubmitters.map(
                      (submitter, index) => (
                        <SubmitterSection
                          submitter={submitter}
                          type="requested"
                          key={`requested-submitters-${submitter.userid}`}
                          index={index}
                        />
                      )
                    )}
                  </div>
                )}

              {currentBounty &&
                currentBounty.approvedSubmitters.length > 0 &&
                currentBounty.isCreator && (
                  <div id="task-approved-submitters">
                    <label className="field-label-5">Approved Applicants</label>
                    {currentBounty.approvedSubmitters.map(
                      (submitter, index) => (
                        <SubmitterSection
                          submitter={submitter}
                          type="approved"
                          key={`approved-submitters-${submitter.userid}`}
                          index={index}
                        />
                      )
                    )}
                  </div>
                )}
              {currentBounty &&
                currentBounty.currentSubmitter &&
                currentBounty.isCreator && (
                  <div id="task-current-submitter">
                    <label className="field-label-10">Submissions</label>
                    <ContributorInfo
                      user={currentBounty.currentSubmitter.user}
                    />
                  </div>
                )}
              {currentBounty.isCreator &&
                currentBounty.changesRequestedSubmitters.length > 0 && (
                  <div id="task-changes-requested-submitters">
                    <label className="field-label-5">Changes Requested</label>
                    {currentBounty.changesRequestedSubmitters.map(
                      (submitter) => (
                        <ContributorInfo
                          user={submitter.user}
                          key={submitter.userid}
                        />
                      )
                    )}
                  </div>
                )}
              {currentBounty.isCreator &&
                currentBounty.deniedSubmitters.length > 0 && (
                  <div id="task-denied-submitters">
                    <label className="field-label-5">Denied Submitters</label>
                    {currentBounty.deniedSubmitters.map((submitter) => (
                      <ContributorInfo
                        user={submitter.user}
                        key={submitter.userid}
                      />
                    ))}
                  </div>
                )}
              {currentBounty.completer && (
                <div id="task-completer">
                  <label className="field-label-10">Bounty Completer</label>
                  <ContributorInfo user={currentBounty.completer.user} />
                </div>
              )}
              {currentBounty.isCreator &&
                currentBounty.votingToCancel.length > 0 && (
                  <div id="task-voting-to-cancel">
                    <label className="field-label-5">Voting To Cancel</label>
                    {currentBounty.votingToCancel.map((submitter) => (
                      <ContributorInfo
                        user={submitter.user}
                        key={submitter.userid}
                      />
                    ))}
                  </div>
                )}
              {currentBounty.isCreator &&
                currentBounty.needsToVote.length > 0 && (
                  <div id="task-votes-needed-to-cancel">
                    <label className="field-label-5">
                      Votes Needed to Cancel
                    </label>
                    {currentBounty.needsToVote.map((submitter) => (
                      <ContributorInfo
                        user={submitter.user}
                        key={submitter.userid}
                      />
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
