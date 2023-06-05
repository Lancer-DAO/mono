import dynamic from "next/dynamic";

// Atoms
const Button = dynamic(() => import("./atoms/Button"));
const CoinflowOfframp = dynamic(() => import("./atoms/CoinflowOfframp"));
const ContributorInfo = dynamic(() => import("./atoms/ContributorInfo"));
const LinkButton = dynamic(() => import("./atoms/LinkButton"));
const LoadingBar = dynamic(() => import("./atoms/LoadingBar"));
const ProgressBar = dynamic(() => import("./atoms/ProgressBar"));
const PubKey = dynamic(() => import("./atoms/PubKey"));

// Molecules
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));
const BountyNFTCard = dynamic(() => import("./molecules/BountyNFTCard"));
const MultiSelectDropdown = dynamic(
  () => import("./molecules/MultiSelectDropdown")
);
const ProfileNFTCard = dynamic(() => import("./molecules/ProfileNFTCard"));
const RangeSlider = dynamic(() => import("./molecules/RangeSlider"));
const WalletInfo = dynamic(() => import("./molecules/WalletInfo"));

// Organisms
const BountyFilters = dynamic(() => import("./organisms/BountyFilters"));
const BountyTable = dynamic(() => import("./organisms/BountyTable"));
const Header = dynamic(() => import("./organisms/Header"));
const LancerBounty = dynamic(() => import("./organisms/LancerBounty"));

// Templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  ContributorInfo,
  LinkButton,
  Header,
  DefaultLayout,
  LoadingBar,
  ApiKeyModal,
  ProfileNFTCard,
  CoinflowOfframp,
  Button,
  ProgressBar,
  PubKey,
  BountyNFTCard,
  MultiSelectDropdown,
  RangeSlider,
  WalletInfo,
  BountyFilters,
  BountyTable,
  LancerBounty,
};
