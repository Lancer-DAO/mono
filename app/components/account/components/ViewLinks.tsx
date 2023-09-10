import Link from "next/link";

const ViewLinks = ({
  website,
  twitter,
  github,
  linkedin,
}: {
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
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
      {!website && !github && !linkedin && (
        <div className="w-full text-center">No Links yet!</div>
      )}
      <div className="w-full flex flex-col gap-4 py-5">
        {website && (
          <div className="w-full">
            <p className="text-textGreen uppercase text-sm">Portfolio</p>
            <Link
              className="underline text-textPrimary"
              href={website}
              target="_blank"
              rel="noreferrer noopener"
            >
              {formatLinks(website)}
            </Link>
          </div>
        )}
        {twitter && (
          <div className="w-full">
            <p className="text-textGreen uppercase text-sm">Twitter</p>
            <Link
              className="underline text-textPrimary"
              href={twitter}
              target="_blank"
              rel="noreferrer noopener"
            >
              {formatLinks(twitter)}
            </Link>
          </div>
        )}
        {github && (
          <div className="w-full">
            <p className="text-textGreen uppercase text-sm">Github</p>
            <Link
              className="underline text-textPrimary"
              href={github}
              target="_blank"
              rel="noreferrer noopener"
            >
              {formatLinks(github)}
            </Link>
          </div>
        )}
        {linkedin && (
          <div className="w-full">
            <p className="text-textGreen uppercase text-sm">Linkedin</p>
            <Link
              className="underline text-textPrimary"
              href={linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              {formatLinks(linkedin)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewLinks;
