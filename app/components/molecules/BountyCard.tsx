import { FC, SVGAttributes, useEffect, useState } from "react";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyPreview,
  FormData,
  IAsyncResult,
} from "@/types/";
import { ContributorInfo, PriceTag, StarIcon } from "@/components";
import { useUserWallet } from "@/src/providers";
import Image from "next/image";

export interface BountyCardProps extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: FormData;
}

const BountyCard: FC<BountyCardProps> = ({ bounty, formData }) => {
  const { currentUser } = useUserWallet();

  const creator = bounty?.users.find((user) =>
    user.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
  );

  const displayedTags = bounty
    ? bounty.tags.slice(0, 4)
    : formData.tags.slice(0, 4);

  const tagOverflow = bounty
    ? bounty.tags.length > 4
    : formData.tags.length > 4;

  useEffect(() => {
    console.log("bounty: ", bounty);
    console.log("formData: ", formData);
  }, [bounty, formData]);

  // TODO: based on industry of bounty, change the color of the card

  return (
    <div className="relative w-[291px] h-[292px]">
      <div className="absolute left-1/2 -translate-x-[53%] top-[6px] w-7">
        <Image src="/assets/icons/eng.png" width={28} height={28} alt="eng" />
      </div>
      <svg
        width="291"
        height="62"
        className="absolute top-0 left-0 z-[-1]"
        viewBox="0 0 291 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 14.8808C0 6.66235 6.66234 0 14.8808 0H277.02C284.606 0 290.756 6.14985 290.756 13.7361V61.2475H0V14.8808Z"
          fill="#C8F4C4"
          opacity={0.7}
        />
      </svg>
      <svg
        width="291"
        height="292"
        viewBox="0 0 291 292"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.4934 37.5642C36.2887 37.2139 82.2671 36.5558 105.954 36.5558C113.9 36.5558 118.408 34.9034 121.143 31.9889C123.558 29.4157 124.43 25.9805 125.293 22.583C125.384 22.226 125.474 21.8695 125.566 21.5145C126.625 17.4374 128.181 12.5031 131.192 8.61988C134.158 4.79523 138.56 1.9558 145.484 2.06049C149.973 2.12838 153.585 4.41935 156.513 7.9006C159.454 11.3964 161.639 16.0221 163.227 20.5421C166.348 29.4281 173.939 36.9116 183.612 37.319C189.471 37.5657 195.721 37.7778 199.911 37.7778H199.969H200.028H200.087H200.146H200.205H200.265H200.324H200.384H200.443H200.503H200.562H200.622H200.682H200.742H200.802H200.863H200.923H200.983H201.044H201.104H201.165H201.226H201.286H201.347H201.408H201.469H201.531H201.592H201.653H201.714H201.776H201.837H201.899H201.961H202.022H202.084H202.146H202.208H202.27H202.332H202.394H202.457H202.519H202.581H202.644H202.706H202.769H202.831H202.894H202.957H203.02H203.083H203.146H203.209H203.272H203.335H203.398H203.461H203.524H203.588H203.651H203.714H203.778H203.841H203.905H203.969H204.032H204.096H204.16H204.224H204.287H204.351H204.415H204.479H204.543H204.607H204.671H204.735H204.8H204.864H204.928H204.992H205.057H205.121H205.185H205.25H205.314H205.379H205.443H205.507H205.572H205.637H205.701H205.766H205.83H205.895H205.96H206.024H206.089H206.154H206.219H206.283H206.348H206.413H206.478H206.543H206.607H206.672H206.737H206.802H206.867H206.932H206.997H207.061H207.126H207.191H207.256H207.321H207.386H207.451H207.516H207.581H207.646H207.711H207.776H207.84H207.905H207.97H208.035H208.1H208.165H208.23H208.295H208.36H208.424H208.489H208.554H208.619H208.684H208.748H208.813H208.878H208.943H209.007H209.072H209.137H209.201H209.266H209.331H209.395H209.46H209.524H209.589H209.653H209.718H209.782H209.847H209.911H209.975H210.039H210.104H210.168H210.232H210.296H210.36H210.424H210.489H210.553H210.617H210.68H210.744H210.808H210.872H210.936H210.999H211.063H211.127H211.19H211.254H211.317H211.381H211.444H211.507H211.571H211.634H211.697H211.76H211.823H211.886H211.949H212.012H212.075H212.137H212.2H212.263H212.325H212.388H212.45H212.513H212.575H212.637H212.699H212.761H212.823H212.885H212.947H213.009H213.071H213.133H213.194H213.256H213.317H213.378H213.44H213.501H213.562H213.623H213.684H213.745H213.806H213.866H213.927H213.988H214.048H214.108H214.169H214.229H214.289H214.349H214.409H214.469H214.529H214.588H214.648H214.707H214.767H214.826H214.885H214.944H215.003H215.062H215.121H215.179H215.238H215.296H215.355H215.413H215.471H215.529H215.587H215.645H215.702H215.76H215.817H215.875H215.932H215.989H216.046H216.103H216.16H216.216H216.273H216.329H216.386H216.442H216.498H216.554H216.61H216.665H216.721H216.776H216.832H216.887H216.942H216.997H217.051H217.106H217.161H217.215H217.269H217.323H217.377H217.431H217.485H217.538H217.592H217.645H217.698H217.751H217.804H217.857H217.91H217.962H218.014H218.066H218.118H218.17H218.222H218.273H218.325H218.376H218.427H218.478H218.529H218.579H218.63H218.68H218.73H218.78H218.83H218.88H218.929H218.979H219.028H219.077H219.126H219.174H219.223H219.271H219.32H219.368H219.415H219.463H219.511H219.558H219.605H219.652H219.699H219.745H219.792H219.838H219.884H219.93H219.976H220.022H220.067H220.112H220.157H220.202H220.247H220.291H220.335H220.379H220.423H220.467H220.511H220.554H220.597H220.64H220.683H220.725H220.768H220.81H220.852H220.894H220.935H220.976H221.018H221.059H221.099H221.14H221.18H221.22H221.26H221.3H221.34H221.379H221.418H221.457H221.496H221.534H221.572H221.61H221.648H221.686H221.723H221.761H221.798H221.834H221.871H221.907H221.943H221.979H222.015H222.05H222.085H222.12H222.155H222.19H222.224H222.258H222.292H222.326H222.359H222.392H222.425H222.458H222.49H222.522H222.554H222.586H222.618H222.649H222.68H222.711H222.741H222.772H222.802H222.831H222.861H222.89H222.919H222.948H222.977H223.005H223.033H223.061H223.089H223.116H223.143H223.17H223.197H223.223H223.249H223.275H223.3H223.326H223.351H223.375H223.4H223.424H223.448H223.472H223.495H223.518H223.541H223.564H223.586H223.608H223.63H223.652H223.673H223.694H223.715H223.735H223.756H223.776H223.795H223.815H223.834H223.853H223.871H223.889H223.907H223.925H223.942H223.959H223.976H223.993H224.009H224.025H224.041H224.056H224.071H224.086H224.101H224.115H224.129H224.142H224.156H224.169H224.182H224.194H224.206H224.218H224.23H224.241H224.252H224.262H224.273H224.283H224.293H224.302H224.311H224.32H224.328H224.337H224.344H224.352H224.359H224.366H224.373H224.379H224.385H224.391H224.396H224.401H224.406H224.41H224.414H224.418H224.422H224.425H224.428H224.43H224.432H224.434H224.436H224.437H224.438H224.438C224.438 37.7778 224.438 37.7778 224.438 36.7055V37.7778H277.204C284.22 37.7778 289.898 43.4812 289.868 50.4966L288.881 277.525C288.85 284.497 283.19 290.134 276.217 290.134H13.7361C6.74209 290.134 1.07234 284.464 1.07234 277.47V50.2156C1.07234 43.3001 6.58643 37.6703 13.4934 37.5642Z"
          fill="white"
          stroke="#C8F4C4"
          stroke-width="2.14467"
        />
      </svg>
      <div className="absolute top-1 left-1">
        <PriceTag
          price={bounty ? bounty?.escrow.amount : Number(formData.issuePrice)}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col p-4">
        <div className="w-full flex items-center justify-between mt-8">
          {/* creator profile */}
          {creator && <ContributorInfo user={creator.user} />}

          {formData && (
            <div className="flex items-center gap-3">
              <Image
                src={currentUser?.picture}
                width={25}
                height={25}
                alt="user picture"
                className="rounded-full overflow-hidden"
              />
              <p className="text-xs font-bold">{currentUser?.name}</p>
            </div>
          )}
          {/* testing */}
          <div className="flex items-center gap-[1px]">
            <StarIcon fill="#29CE17" />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
        </div>
        <div className="mt-8">
          <p className="text-2xl font-bold">
            {bounty ? bounty.title : formData.issueTitle}
          </p>
          <p>{bounty ? bounty.description : formData.issueDescription}</p>
        </div>
        <div className="relative w-full pr-10 flex flex-wrap items-center gap-1 mt-auto">
          {bounty &&
            displayedTags.map((tag) => (
              <div
                className="border border-neutralBtnBorder rounded-full 
                px-3 py-1 flex items-center justify-center"
                key={tag.name}
              >
                {tag.name}
              </div>
            ))}
          {formData &&
            displayedTags.map((tag) => (
              <div
                className="border border-neutralBtnBorder rounded-full 
                px-3 py-1 flex items-center justify-center"
                key={tag}
              >
                {tag}
              </div>
            ))}
          {tagOverflow && <p className="text-xs">+ more</p>}
        </div>
      </div>
    </div>
  );
};

export default BountyCard;
