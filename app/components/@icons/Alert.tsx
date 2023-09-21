const Alert = ({ height, width }: { height: string; width: string }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="15" r="12" fill="#FAEBE1" />
      <circle cx="15" cy="15" r="14" stroke="#FAEBE1" />
      <g clip-path="url(#clip0_838_14274)">
        <path
          d="M12.5 14C12.5 13.337 12.7634 12.7011 13.2322 12.2322C13.7011 11.7634 14.337 11.5 15 11.5C15.663 11.5 16.2989 11.7634 16.7678 12.2322C17.2366 12.7011 17.5 13.337 17.5 14V17H12.5V14Z"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.5 18C11.5 17.7348 11.6054 17.4804 11.7929 17.2929C11.9804 17.1054 12.2348 17 12.5 17H17.5C17.7652 17 18.0196 17.1054 18.2071 17.2929C18.3946 17.4804 18.5 17.7348 18.5 18V19H11.5V18Z"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.5 14H20"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.25 10.25L18 10.5"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 14H10.5"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 9V9.5"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.4646 10.4648L11.8181 10.8183"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 14V17"
          stroke="#F46036"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_838_14274">
          <rect
            width="12"
            height="12"
            fill="white"
            transform="translate(9 8)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Alert;
