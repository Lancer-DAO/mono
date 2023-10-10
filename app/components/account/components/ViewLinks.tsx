import { ResumeCard } from "./ResumeCard";

const ViewLinks = ({
  website,
  twitter,
  github,
  linkedin,
  resumeUrl,
}: {
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}) => {
  // if links don't include http, add it
  const formatLinks = (link: string) => {
    if (link.includes("http")) {
      return link;
    } else {
      return `https://${link}`;
    }
  };

  return (
    <>
      {!website && !github && !linkedin && !twitter && (
        <div className="w-full text-center">No Links yet!</div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-4">
          {website && (
            <div className="w-full flex items-center gap-2">
              <p className="text-neutral600 w-14 text-sm">Portfolio</p>
              <a
                className="w-64 text-sm border border-neutral200 bg-neutral100
                text-neutral600 rounded-md p-2 truncate"
                href={formatLinks(website)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {formatLinks(website)}
              </a>
            </div>
          )}
          {github && (
            <div className="w-full flex items-center gap-2">
              <p className="text-neutral600 w-14 text-sm">GitHub</p>
              <a
                className="w-64 text-sm border border-neutral200 bg-neutral100
                text-neutral600 rounded-md p-2 truncate"
                href={formatLinks(github)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {formatLinks(github)}
              </a>
            </div>
          )}
          {twitter && (
            <div className="w-full flex items-center gap-2">
              <p className="text-neutral600 w-14 text-sm">Twitter</p>
              <a
                className="w-64 text-sm border border-neutral200 bg-neutral100
                text-neutral600 rounded-md p-2 truncate"
                href={formatLinks(twitter)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {formatLinks(twitter)}
              </a>
            </div>
          )}
          {linkedin && (
            <div className="w-full flex items-center gap-2">
              <p className="text-neutral600 w-14 text-sm">LinkedIn</p>
              <a
                className="w-64 text-sm border border-neutral200 bg-neutral100
                text-neutral600 rounded-md p-2 truncate"
                href={formatLinks(linkedin)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {formatLinks(linkedin)}
              </a>
            </div>
          )}
        </div>
        <ResumeCard
          resumeUrl={resumeUrl}
          setResumeUrl={() => null}
          editing={false}
        />
      </div>
    </>
  );
};

export default ViewLinks;
