import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { GetServerSidePropsContext } from "next";
import { NextSeo } from "next-seo";

import * as queries from "@/prisma/queries";
import { useState } from "react";
import { Class, Option } from "@/types";
import { useRouter } from "next/router";
import { api } from "@/src/utils";
import toast from "react-hot-toast";
import { ChooseYourClass } from "@/components/onboarding/ChooseYourClass";
import { CreateYourProfile } from "@/components/onboarding/CreateYourProfile";
import { GoodToGo } from "@/components/onboarding/GoodToGo";
import { useUserWallet } from "@/src/providers";
import { BADGES_PROJECT_PARAMS } from "@/src/constants";
import dayjs from "dayjs";
import { createUnderdogClient } from "@underdog-protocol/js";
const underdogClient = createUnderdogClient({});
export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string; req; res }>
) {
  withPageAuthRequired();
  const { req, res } = context;
  const metadata = await getSession(req, res);
  if (!metadata?.user) {
    return {
      redirect: {
        destination: "/api/auth/login",
        permanent: false,
      },
    };
  }

  const { email, sub, nickname, picture } = metadata.user;

  const user = await queries.user.getOrCreateByEmail(
    email,
    sub,
    nickname,
    picture
  );

  if (user && user.hasFinishedOnboarding) {
    const referrer = req.url.split("?r=");

    return {
      redirect: {
        destination: referrer.length === 2 ? `/?r=${referrer[1]}` : "/",
        permanent: false,
      },
    };
  }

  const allIndustries = await queries.industry.getMany();
  return {
    props: {
      currentUser: JSON.stringify(user),

      allIndustries: JSON.stringify(allIndustries),
    },
  };
}

const WelcomePage: React.FC<{
  allIndustries: string;
}> = ({ allIndustries }) => {
  const [page, setPage] = useState(0);
  const [selectedClass, setSelectedClass] = useState<Class>("Noble");
  const { currentUser, currentWallet } = useUserWallet();
  const router = useRouter();
  const { mutateAsync: registerOnboardingInfo } =
    api.users.addOnboardingInformation.useMutation();

  const { mutateAsync: registerOnboardingBadge } =
    api.users.registerOnboardingBadge.useMutation();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState<Option>({
    label: "Engineering",
    value: "Engineering",
  });
  const industries = allIndustries ? JSON.parse(allIndustries) : [];
  const industryOptions = industries.map((industry) => {
    return {
      label: industry.name,
      value: industry.name,
    };
  });

  const handleUpdateProfile = async () => {
    const toastId = toast.loading("Creating your profile...");
    try {
      await registerOnboardingInfo({
        industryId: industries.find((i) => i.name === industry.value).id,
        name,
        company,
        companyDescription: description,
        bio: description,
        selectedClass,
      });

      toast.success("Profile created successfully!", { id: toastId });
      setTimeout(() => {
        toast.dismiss(toastId);
        router.push("/");
      }, 2000);
      if (currentWallet?.publicKey) {
        await underdogClient.createNft({
          params: BADGES_PROJECT_PARAMS,
          body: {
            name: `Onboarded as ${selectedClass}`,
            image:
              selectedClass === "Noble"
                ? "https://utfs.io/f/11550d3d-02d0-4c11-954d-70708786d0db-ejso1z.png"
                : "https://utfs.io/f/f0b4011d-763e-486a-bc38-9866ed10affd-ejso3p.png",
            description: `${name} has onboarded as a ${selectedClass}!}`,
            attributes: {
              completed: dayjs().toISOString(),
            },
            upsert: false,
            receiverAddress: currentWallet.publicKey.toString(),
          },
        });
        await registerOnboardingBadge();
      }
    } catch (e) {
      toast.error("Error updating profile", { id: toastId });
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly py-24 ">
      <NextSeo
        title="Lancer | Onboarding"
        description="Start your journey with Lancer"
      />
      {
        [
          <ChooseYourClass
            key={0}
            setPage={setPage}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />,
          <CreateYourProfile
            key={1}
            setPage={setPage}
            selectedClass={selectedClass}
            name={name}
            setName={setName}
            company={company}
            setCompany={setCompany}
            description={description}
            setDescription={setDescription}
            industry={industry}
            setIndustry={setIndustry}
            industryOptions={industryOptions}
          />,
          <GoodToGo
            key={2}
            selectedClass={selectedClass}
            updateProfile={handleUpdateProfile}
          />,
        ][page]
      }
    </div>
  );
};

export default WelcomePage;
