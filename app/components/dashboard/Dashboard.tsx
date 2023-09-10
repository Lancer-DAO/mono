import { ResumeTable } from "./components/ResumeTable";

export const Dashboard = () => {
  return (
    <>
      <div className="flex flex-col w-full md:w-[90%] mx-auto px-4 md:px-0 py-24">
        <div className="flex items-center">
          <h1 className="pb-2">Dashboard</h1>
        </div>
        <div className="w-full flex items-start gap-5">
          <ResumeTable />
        </div>
      </div>
    </>
  )
};