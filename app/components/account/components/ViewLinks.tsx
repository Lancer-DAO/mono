import Link from "next/link";

const ViewLinks = ({
  website,
  github,
  linkedin,
}: {
  website: string;
  github: string;
  linkedin: string;
}) => {
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
              {website}
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
              {github}
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
              {linkedin}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewLinks;
