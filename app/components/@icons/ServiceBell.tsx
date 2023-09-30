const ServiceBell = ({ height, width }: { height: string; width: string }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="12" fill="#FAEDF6" />
      <circle cx="14" cy="14" r="13.5" stroke="#FAEDF6" />
      <path
        d="M9 16C9 15.7348 9.10536 15.4804 9.29289 15.2929C9.48043 15.1054 9.73478 15 10 15H18C18.2652 15 18.5196 15.1054 18.7071 15.2929C18.8946 15.4804 19 15.7348 19 16V17H9V16Z"
        stroke="#CC7AB2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 15C18 13.9391 17.5786 12.9217 16.8284 12.1716C16.0783 11.4214 15.0609 11 14 11C12.9391 11 11.9217 11.4214 11.1716 12.1716C10.4214 12.9217 10 13.9391 10 15"
        stroke="#CC7AB2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9V11"
        stroke="#CC7AB2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 9H15"
        stroke="#CC7AB2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default ServiceBell;
