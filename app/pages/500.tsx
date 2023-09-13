import { ProfileCreated } from "@/components";

export const Error = () => {
  return (
    <div className="w-full h-full">
      <div className="h-[390px]">
        <ProfileCreated width="w-96" height="w-96" />
      </div>
      <div className="text-lg text-center">
        Uh-Oh, seems like you&apos;ve broken something.
      </div>
    </div>
  );
};

export default Error;
