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
      {(!website && !github && !linkedin) && (
        <div className="w-full text-center">No Links yet!</div>
      )}
      {website && (
        <div className="my-4 w-3/4">
          <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Portfolio</p>
          <Link href={website} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
            {website}
          </Link>
        </div>
      )}
      {github && (
        <div className="my-4 w-3/4">
          <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Github</p>
          <Link href={github} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
            {github}
          </Link>
        </div>
      )}
      {linkedin && (
        <div className="my-4 w-3/4">
          <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">Linkedin</p>
          <Link href={linkedin} target="_blank" className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
            {linkedin}
          </Link>
        </div>
      )}
    </>
  )
};

export default ViewLinks;