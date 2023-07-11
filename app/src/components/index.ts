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
const AccountHeaderOptions = dynamic(
  () => import("./molecules/AccountHeaderOptions")
);
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));
const BountyActions = dynamic(() => import("./organisms/BountyActions"));
const BountyNFTCard = dynamic(() => import("./molecules/BountyNFTCard"));
const CoinflowFund = dynamic(() => import("./molecules/CoinflowFund"));
const MultiSelectDropdown = dynamic(
  () => import("./molecules/MultiSelectDropdown")
);
const ProfileNFTCard = dynamic(() => import("./molecules/ProfileNFTCard"));
const RangeSlider = dynamic(() => import("./molecules/RangeSlider"));
const SubmitterSection = dynamic(() => import("./molecules/SubmitterSection"));
const TutorialsModal = dynamic(() => import("./molecules/TutorialsModal"));
const WalletInfo = dynamic(() => import("./molecules/WalletInfo"));

// Organisms
const BountyFilters = dynamic(() => import("./organisms/BountyFilters"));
const BountyTable = dynamic(() => import("./organisms/BountyTable"));
const CreateBountyForm = dynamic(() => import("./organisms/CreateBountyForm"));
const FundBountyForm = dynamic(() => import("./organisms/FundBountyForm"));
const Header = dynamic(() => import("./organisms/Header"));
const JoyrideWrapper = dynamic(() => import("./organisms/JoyrideWrapper"));
const LancerBounty = dynamic(() => import("./organisms/LancerBounty"));

// Templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  // atoms
  Button,
  CoinflowOfframp,
  ContributorInfo,
  LinkButton,
  LoadingBar,
  ProgressBar,
  PubKey,

  // molecules
  AccountHeaderOptions,
  ApiKeyModal,
  BountyActions,
  BountyNFTCard,
  CoinflowFund,
  MultiSelectDropdown,
  ProfileNFTCard,
  RangeSlider,
  SubmitterSection,
  TutorialsModal,
  WalletInfo,

  // organisms
  BountyFilters,
  BountyTable,
  CreateBountyForm,
  FundBountyForm,
  Header,
  JoyrideWrapper,
  LancerBounty,

  // templates
  DefaultLayout,
};
