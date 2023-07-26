import { FC } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const Form: FC<Props> = ({ title, children }) => {
  return (
    <div className="form-container">
      <div className="form">
        <>
          <div id="job-information" className="form-layout-flex">
            <h2
              id="w-node-a3d1ad77-e5aa-114b-bcd7-cde3db1bb746-0ae9cdc2"
              className="form-subtitle"
            >
              {title}
            </h2>
            {children}
          </div>
        </>
      </div>
    </div>
  );
};

export default Form;
