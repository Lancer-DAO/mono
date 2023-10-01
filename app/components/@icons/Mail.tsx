const Mail = ({
  height,
  width,
  version,
}: {
  height: string;
  width: string;
  version: "orange" | "green" | "purple" | "blue";
}) => {
  switch (version) {
    case "orange":
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
          <g clip-path="url(#clip0_838_14329)">
            <path
              d="M20.2831 16.3644V12.4826C20.2831 12.1885 20.176 11.9064 19.9853 11.6984C19.7947 11.4904 19.5361 11.3735 19.2665 11.3735H11.1331C10.8635 11.3735 10.6049 11.4904 10.4142 11.6984C10.2236 11.9064 10.1165 12.1885 10.1165 12.4826V19.1372C10.1165 19.7472 10.574 20.2463 11.1331 20.2463H15.1998"
              stroke="#F46036"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.2831 13.0371L15.7234 16.198C15.5664 16.3053 15.385 16.3622 15.1998 16.3622C15.0146 16.3622 14.8331 16.3053 14.6762 16.198L10.1165 13.0371"
              stroke="#F46036"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.2327 19.6921L18.2493 20.8012L20.2827 18.583"
              stroke="#F46036"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_838_14329">
              <rect
                width="12.2"
                height="12.2"
                fill="white"
                transform="translate(9.09961 9.70996)"
              />
            </clipPath>
          </defs>
        </svg>
      );
    case "green":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="12" fill="#DCF5DF" />
          <circle cx="15" cy="15" r="14" stroke="#DCF5DF" />
          <g clip-path="url(#clip0_838_14329)">
            <path
              d="M20.2831 16.3644V12.4826C20.2831 12.1885 20.176 11.9064 19.9853 11.6984C19.7947 11.4904 19.5361 11.3735 19.2665 11.3735H11.1331C10.8635 11.3735 10.6049 11.4904 10.4142 11.6984C10.2236 11.9064 10.1165 12.1885 10.1165 12.4826V19.1372C10.1165 19.7472 10.574 20.2463 11.1331 20.2463H15.1998"
              stroke="#6BB374"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.2831 13.0371L15.7234 16.198C15.5664 16.3053 15.385 16.3622 15.1998 16.3622C15.0146 16.3622 14.8331 16.3053 14.6762 16.198L10.1165 13.0371"
              stroke="#6BB374"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.2327 19.6921L18.2493 20.8012L20.2827 18.583"
              stroke="#6BB374"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_838_14329">
              <rect
                width="12.2"
                height="12.2"
                fill="white"
                transform="translate(9.09961 9.70996)"
              />
            </clipPath>
          </defs>
        </svg>
      );
    case "blue":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="12" fill="#EDF0FA" />
          <circle cx="15" cy="15" r="14" stroke="#EDF0FA" />
          <g clip-path="url(#clip0_838_14290)">
            <path
              d="M20.2831 15.3644V11.4826C20.2831 11.1885 20.176 10.9064 19.9853 10.6984C19.7947 10.4904 19.5361 10.3735 19.2665 10.3735H11.1331C10.8635 10.3735 10.6049 10.4904 10.4142 10.6984C10.2236 10.9064 10.1165 11.1885 10.1165 11.4826V18.1372C10.1165 18.7472 10.574 19.2463 11.1331 19.2463H15.1998"
              stroke="#6B7699"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.2831 12.0371L15.7234 15.198C15.5664 15.3053 15.385 15.3622 15.1998 15.3622C15.0146 15.3622 14.8331 15.3053 14.6762 15.198L10.1165 12.0371"
              stroke="#6B7699"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.2327 18.6921L18.2493 19.8012L20.2827 17.583"
              stroke="#6B7699"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_838_14290">
              <rect
                width="12.2"
                height="12.2"
                fill="white"
                transform="translate(9.09961 8.70996)"
              />
            </clipPath>
          </defs>
        </svg>
      );
    case "purple":
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="15" cy="15" r="12" fill="#FAEDF6" />
          <circle cx="15" cy="15" r="14" stroke="#FAEDF6" />
          <g clip-path="url(#clip0_838_14342)">
            <path
              d="M20.2851 16.3644V12.4826C20.2851 12.1885 20.178 11.9064 19.9873 11.6984C19.7966 11.4904 19.538 11.3735 19.2684 11.3735H11.1351C10.8654 11.3735 10.6068 11.4904 10.4162 11.6984C10.2255 11.9064 10.1184 12.1885 10.1184 12.4826V19.1372C10.1184 19.7472 10.5759 20.2463 11.1351 20.2463H15.2017"
              stroke="#CC7AB2"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.2851 13.0371L15.7253 16.198C15.5684 16.3053 15.3869 16.3622 15.2017 16.3622C15.0165 16.3622 14.8351 16.3053 14.6782 16.198L10.1184 13.0371"
              stroke="#CC7AB2"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.2346 19.6921L18.2513 20.8012L20.2846 18.583"
              stroke="#CC7AB2"
              strokeWidth="1.05903"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_838_14342">
              <rect
                width="12.2"
                height="12.2"
                fill="white"
                transform="translate(9.10156 9.70996)"
              />
            </clipPath>
          </defs>
        </svg>
      );
  }
};

export default Mail;
