import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextSeo } from "next-seo";

import { ChooseYourClass } from "@/components/onboarding/ChooseYourClass";
import { CreateYourProfile } from "@/components/onboarding/CreateYourProfile";
import { GetServerSidePropsContext } from "next";
import * as queries from "@/prisma/queries";
import { GoodToGo } from "@/components/onboarding/GoodToGo";
import { useState } from "react";
import { Class } from "@/types";
import { Option } from "@/types";

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
  try {
    const { email } = metadata.user;

    const user = await queries.user.getByEmail(email);

    if (!user || !user.hasFinishedOnboarding) {
      return {
        redirect: {
          destination: "/welcome",
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
  } catch (e) {
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
}

const BountiesPage: React.FC<{
  allIndustries: string;
}> = ({ allIndustries }) => {
  const [page, setPage] = useState(0);
  const [selectedClass, setSelectedClass] = useState<Class>("Noble");

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
  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-4 py-24 ">
      <NextSeo title="Lancer | Bounties" description="Lancer Bounties" />
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
          <GoodToGo key={2} selectedClass={selectedClass} />,
        ][page]
      }
    </div>
  );
};

export default BountiesPage;
