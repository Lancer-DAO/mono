import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { api, decimalToNumber, getSolscanAddress } from "@/utils";
import { marked } from "marked";
import dayjs from "dayjs";
import { PublicKey } from "@solana/web3.js";
import { Clock } from "react-feather";
import { ContributorInfo, ExternalLinkIcon, Logo } from "@/components";
import { SubmitterSection, BountyActions } from "./components";
import { useBounty } from "@/src/providers/bountyProvider";
import { useUserWallet } from "@/src/providers";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { User } from "@prisma/client";

interface BountyActionsUserProps {
  title: string;
  users: User[];
}

const BountActionsUser: FC<BountyActionsUserProps> = ({ title, users }) => (
  <>
    <label className="font-bold text-sm">{title}</label>
    {users.map((user, index) => (
      <ContributorInfo user={user} key={index} />
    ))}
  </>
);

export const Bounty = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const [pollId, setPollId] = useState(null);
  const [bountyAmount, setBountyAmount] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const router = useRouter();
  const { mutateAsync: getBounty } = api.bounties.getBounty.useMutation();

  const formatString = (str: string) => {
    return str
      .replaceAll("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const previewMarkup = () => {
    const markdown = marked.parse(currentBounty.description, { breaks: true });
    return { __html: markdown };
  };

  useEffect(() => {
    if (router.isReady && currentUser?.id) {
      const getB = async () => {
        const bounty = await getBounty({
          id: parseInt(router.query.quest as string),
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

  useEffect(() => {
    if (currentBounty?.links) {
      const links = currentBounty?.links?.split(",");
      setLinks(links);
    }
  }, [currentBounty]);

  if (!currentUser || !currentBounty) {
    return <></>;
  }

  return (
    <>
      <div className="w-full h-full flex justify-evenly mt-10">
        {/* quest info */}
        <div className="flex flex-col gap-5 w-[380px]">
          {currentBounty?.state && (
            <div className="bg-white w-fit px-3 py-2 rounded-md">
              <p className="text-sm">{formatString(currentBounty?.state)}</p>
            </div>
          )}
          <h1>{currentBounty?.title}</h1>
          <div className="flex gap-5 items-center">
            <div className="flex gap-2 items-center">
              <p>
                {`Created: ${dayjs
                  .unix(parseInt(currentBounty.createdAt) / 1000)
                  .format("MMM D, YYYY")}`}
              </p>
              <div className="h-[30px] w-[1px] bg-neutralBtnBorder mx-3" />
              <Image
                src={currentBounty?.escrow?.mint?.logo}
                width={25}
                height={25}
                alt="mint logo"
              />
              <p>{`${bountyAmount} in escrow`}</p>
              <motion.a
                {...smallClickAnimation}
                href={getSolscanAddress(
                  new PublicKey(currentBounty?.escrow?.publicKey)
                )}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon />
              </motion.a>
            </div>
          </div>
          <div className="h-[1px] w-full bg-neutralBtnBorder" />
          <div>
            <p className="font-bold text-sm">Job description</p>
            <div dangerouslySetInnerHTML={previewMarkup()} className="pt-1" />
          </div>
          {currentBounty.links.length > 0 && currentBounty.links[0] !== "" && (
            <div>
              <p className="font-bold text-sm">Links</p>
              <div className="flex flex-col w-full gap-1">
                {links?.map((link) => {
                  const formattedLink =
                    link.startsWith("http://") || link.startsWith("https://")
                      ? link
                      : `http://${link}`;
                  return (
                    <a
                      href={formattedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-500"
                    >
                      {formattedLink}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          {currentBounty.tags.length > 0 &&
            currentBounty.tags[0].name !== "" && (
              <div>
                <p className="font-bold text-sm">Required skills</p>
                <div className="flex flex-wrap w-full gap-2 pt-2">
                  {currentBounty.tags.map((tag) => (
                    <div
                      className="bg-white w-fit px-2 py-1 text-sm rounded-md"
                      key={tag.name}
                      // style={{ color: tag.color }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        {/* bountyactions */}
        <div className="bg-white w-[540px] h-fit rounded-md flex flex-col gap-10 p-10">
          <div className="flex flex-col gap-5" id="contributors-section">
            {currentBounty?.creator && (
              <BountActionsUser
                title="Client"
                users={[currentBounty.creator.user]}
              />
            )}
            {currentBounty && currentBounty.deniedRequesters.length > 0 && (
              <BountActionsUser
                title="Denied Requesters"
                users={currentBounty.deniedRequesters.map(
                  (submitter) => submitter.user
                )}
              />
            )}
            {currentBounty &&
              currentBounty.requestedSubmitters.length > 0 &&
              currentBounty.isCreator && (
                <>
                  <label className="font-bold text-sm">
                    Requested Applicants
                  </label>
                  {currentBounty.requestedSubmitters.map((submitter, index) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="requested"
                      key={`requested-submitters-${submitter.userid}`}
                      index={index}
                    />
                  ))}
                </>
              )}

            {currentBounty &&
              currentBounty.approvedSubmitters.length > 0 &&
              currentBounty.isCreator && (
                <>
                  <label className="font-bold text-sm">
                    Approved Applicants
                  </label>
                  {currentBounty.approvedSubmitters.map((submitter, index) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="approved"
                      key={`approved-submitters-${submitter.userid}`}
                      index={index}
                    />
                  ))}
                </>
              )}
            {currentBounty &&
              currentBounty.currentSubmitter &&
              currentBounty.isCreator && (
                <BountActionsUser
                  title="Submissions"
                  users={[currentBounty.currentSubmitter.user]}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.changesRequestedSubmitters.length > 0 && (
                <BountActionsUser
                  title="Changes Requested"
                  users={currentBounty.changesRequestedSubmitters.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.deniedSubmitters.length > 0 && (
                <BountActionsUser
                  title="Denied Submitters"
                  users={currentBounty.deniedSubmitters.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.completer && (
              <BountActionsUser
                title="Completed By"
                users={[currentBounty.completer.user]}
              />
            )}
            {currentBounty.isCreator &&
              currentBounty.votingToCancel.length > 0 && (
                <BountActionsUser
                  title="Voting To Cancel"
                  users={currentBounty.votingToCancel.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.needsToVote.length > 0 && (
                <BountActionsUser
                  title="Votes Needed to Cancel"
                  users={currentBounty.needsToVote.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            <BountyActions />
          </div>
        </div>
      </div>
    </>

    // <section className="section-job-post wf-section">
    //   <div className="container-default">
    //     <div className="w-layout-grid grid-job-post">
    //       <div
    //         id="task-container"
    //         data-w-id="9d97a6aa-31d5-1276-53c2-e76c8908f874"
    //         className="job-post-container mb-20"
    //       >
    //         <div
    //           id="w-node-_9d97a6aa-31d5-1276-53c2-e76c8908f876-fde9cdb1"
    //           className="job-post-primary-info"
    //         >
    //           <div className="contributor-picture-large">
    //             <Logo width="100px" height="100px" />
    //           </div>
    //           <div className="bounty-page-title-section">
    //             <div className="bounty-title-row-1">
    //               {currentBounty.repository && (
    //                 <a
    //                   href={`https://github.com/${currentBounty.repository.organization}`}
    //                   className="job-post-company-name"
    //                   target="_blank"
    //                   rel="noreferrer"
    //                   id="task-organization-link"
    //                 >
    //                   {currentBounty.repository.organization}
    //                 </a>
    //               )}
    //               <div
    //                 className={`currentBounty-state ${currentBounty.state} text-start`}
    //                 id="task-state"
    //               >
    //                 {currentBounty.state.split("_").join(" ")}
    //               </div>
    //             </div>
    //             {currentBounty.repository ? (
    //               <a
    //                 className="job-post-title"
    //                 href={`${currentBounty.repository.githubLink}/issues/${currentBounty.issue.number}`}
    //                 target="_blank"
    //                 rel="noreferrer"
    //                 id="task-title"
    //               >
    //                 {currentBounty.title}
    //               </a>
    //             ) : (
    //               <div className="job-post-title" id="task-title">
    //                 {currentBounty.title}
    //               </div>
    //             )}

    //             <div className="bounty-title-row-1">
    //               <div className="job-post-date" id="task-posted-date">
    //                 {`${dayjs
    //                   .unix(parseInt(currentBounty.createdAt) / 1000)
    //                   .format("MMMM D, YYYY h:mm A")}`}
    //               </div>
    //               {currentBounty.escrow.publicKey && (
    //                 <a
    //                   href={getSolscanAddress(
    //                     new PublicKey(currentBounty.escrow.publicKey)
    //                   )}
    //                   className="job-post-company-name"
    //                   target="_blank"
    //                   rel="noreferrer"
    //                   id="task-escrow-link"
    //                 >
    //                   Escrow Contract
    //                 </a>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //         <div></div>
    //         <div className="job-post-middle">
    //           <div className="job-post-info-container" id="task-estimated-time">
    //             <Clock />
    //             <div className="job-post-info-text icon-left">
    //               {`${currentBounty.estimatedTime}`} HOURS
    //             </div>
    //           </div>
    //           <div className="job-post-info-divider"></div>
    //           <div className="job-post-info-container" id="task-requirements">
    //             <div className="tag-list">
    //               {currentBounty.tags.map((tag) => (
    //                 <div
    //                   className="tag-item"
    //                   key={tag.name}
    //                   style={{ color: tag.color }}
    //                 >
    //                   {tag.name}
    //                 </div>
    //               ))}
    //             </div>
    //           </div>
    //           <div className="job-post-info-divider"></div>
    //           <div className="job-post-info-container" id="task-funded-amount">
    //             <div className="job-post-info-text icon-right">
    //               {bountyAmount}
    //             </div>
    //             <Image
    //               className="rounded-[50%]"
    //               src={currentBounty.escrow.mint.logo}
    //               alt={currentBounty.escrow.mint.name ?? "mint icon"}
    //               width={36}
    //               height={36}
    //             />
    //           </div>
    //         </div>
    //         <div className="job-post-bottom">
    //           <div id="task-description">
    //             <h2 className="job-post-subtitle">Job description</h2>
    //             <div
    //               className="bounty-markdown-full"
    //               dangerouslySetInnerHTML={previewMarkup()}
    //             />
    //           </div>
    //           {<BountyActions />}
    //         </div>
    //       </div>
    //       <div
    //         id="w-node-_272b1d4e-bae1-2928-a444-208d5db4485b-fde9cdb1"
    //         className="w-form"
    //       >
    //         <div className="contributors-section" id="links-section">
    //           {currentBounty.issue && (
    //             <>
    //               <h2>Links</h2>
    //               <a
    //                 href={`${currentBounty.repository.githubLink}/issues/${currentBounty.issue.number}`}
    //                 target="_blank"
    //                 rel="noreferrer"
    //                 id="task-issue-link"
    //               >
    //                 GitHub Issue
    //               </a>
    //             </>
    //           )}
    //           {currentBounty.pullRequests.length > 0 && (
    //             <a
    //               href={`${currentBounty.repository.githubLink}/issues/${currentBounty.pullRequests[0].number}`}
    //               target="_blank"
    //               rel="noreferrer"
    //               id="task-pull-request-link"
    //             >
    //               GitHub Pull Request
    //             </a>
    //           )}
    //         </div>

    //       </div>
    //     </div>
    //   </div>
    // </section>
  );
};
