// header
import Link from "next/link";
import Logo from "../assets/Logo";
import { PubKey } from "@/src/components/PublicKey";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";
import dynamic from "next/dynamic";

import styles from "@/styles/Home.module.css";

const HEADER_LINKS:HeaderButtonProps[] = [{href:"/create", text: "New Bounty"}, {href: "/my_bounties", text:"My Bounties"}, {href: "/bounties", text:"All Bounties"}, {href: "/account", text:"Bounty"}]

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

interface HeaderButtonProps {
  href: string;
  text: string;
}

const HeaderButton = ({href, text}: HeaderButtonProps) => {
return <Link href={href} className="button-primary">
{text}
</Link>
}
export const Header = () => {
  const { currentWallet, wallets, setCurrentWallet } = useLancer();
  const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);
  const toggleWalletSelectOpen = () =>
    setIsWalletSelectOpen(!isWalletSelectOpen);

  return (
    <div
      data-collapse="medium"
      data-animation="default"
      data-duration="400"
      data-w-id="58db7844-5919-d71b-dd74-2323ed8dffe9"
      data-easing="ease"
      data-easing2="ease"
      role="banner"
      className="header w-nav"
    >
      <div className="container-default container-header w-container">
        <Link href="/" className="brand w-nav-brand">
          <Logo width="auto" height="90px" />
        </Link>
        <div className="header-right">
          {HEADER_LINKS.map(({href, text}) => {
            return <HeaderButton href={href} text={text} />
          })}

          <div className={styles.walletButtons}>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </div>
  );
};


// export {};
// MultiSelectDropdown
// import { useState } from "react";

// interface Props {
//   options: Option[];
//   selected: Option[];
//   onChange: (selected: Option[]) => void;
// }

// interface Option {
//   label: string;
//   value: string;
// }

// const Dropdown: React.FC<Props> = ({ options, selected, onChange }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleOpen = () => setIsOpen(!isOpen);

//   const handleCheckboxChange = (option: Option) => {
//     const alreadySelected = selected.find(
//       (item) => item.value === option.value
//     );

//     if (alreadySelected) {
//       const filteredSelection = selected.filter(
//         (item) => item.value !== option.value
//       );
//       onChange(filteredSelection);
//     } else {
//       const updatedSelection = [...selected, option];
//       onChange(updatedSelection);
//     }
//   };

//   const renderOptions = () => {
//     return options.map((option) => {
//       const isChecked = selected.find((item) => item.value === option.value);
//       return (
//         <label key={option.value} className="dropdown__option">
//           <input
//             type="checkbox"
//             value={option.value}
//             checked={isChecked ? true : false}
//             onChange={() => handleCheckboxChange(option)}
//           />
//           {option.label}
//         </label>
//       );
//     });
//   };

//   return (
//     <div className="dropdown">
//       <div className="dropdown__header" onClick={toggleOpen}>
//         <div className="dropdown__selected">
//           {selected.length === 0
//             ? "Select"
//             : selected.map((item) => item.label).join(", ")}
//         </div>
//         <div className={`dropdown__icon ${isOpen ? "open" : ""}`}>▾</div>
//       </div>
//       {isOpen && (
//         <div
//           className="dropdown__options"
//           onMouseLeave={() => setIsOpen(false)}
//         >
//           {renderOptions()}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dropdown;

// LoadingBar.tsx
// import ReactLoading from "react-loading";

// export const LoadingBar: React.FC<{ title: string }> = ({ title }) => {
//   return (
//     <div className="loading-bar">
//       <div className="loading-bar-title">{title}</div>
//       <ReactLoading type={"bubbles"} color={"#14bb88"} height={"60px"} />
//     </div>
//   );
// };
