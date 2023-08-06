import dynamic from "next/dynamic";

// @icons
const Logo = dynamic(() => import("./@icons/Logo"));
const PhantomLogo = dynamic(() => import("./@icons/PhantomLogo"));
const USDC = dynamic(() => import("./@icons/USDC"));

// atoms
const Button = dynamic(() => import("./atoms/Button"));
const CoinflowOfframp = dynamic(() => import("./atoms/CoinflowOfframp"));
const ContributorInfo = dynamic(() => import("./atoms/ContributorInfo"));
const LoadingBar = dynamic(() => import("./atoms/LoadingBar"));
const ProgressBar = dynamic(() => import("./atoms/progressBar"));
const PubKey = dynamic(() => import("./atoms/PubKey"));

// molecules
const AccountHeaderOptions = dynamic(
  () => import("./molecules/AccountHeaderOptions")
);
const AddReferrerModal = dynamic(() => import("./molecules/AddReferrerModal"));
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));
const CoinflowFund = dynamic(() => import("./molecules/CoinflowFund"));
const MultiSelectDropdown = dynamic(
  () => import("./molecules/MultiSelectDropdown")
);
const RangeSlider = dynamic(() => import("./molecules/RangeSlider"));
const TutorialsModal = dynamic(() => import("./molecules/TutorialsModal"));
const WalletInfo = dynamic(() => import("./molecules/WalletInfo"));

// organisms
const CreateBountyForm = dynamic(() => import("./organisms/CreateBountyForm"));
const FundBountyForm = dynamic(() => import("./organisms/FundBountyForm"));
const Header = dynamic(() => import("./organisms/Header"));
const JoyrideWrapper = dynamic(() => import("./organisms/JoyrideWrapper"));

// templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  // @icons
  Logo,
  PhantomLogo,
  USDC,

  // atoms
  Button,
  CoinflowOfframp,
  ContributorInfo,
  LoadingBar,
  ProgressBar,
  PubKey,

  // molecules
  AccountHeaderOptions,
  AddReferrerModal,
  ApiKeyModal,
  CoinflowFund,
  MultiSelectDropdown,
  RangeSlider,
  TutorialsModal,
  WalletInfo,

  // organisms
  CreateBountyForm,
  FundBountyForm,
  Header,
  JoyrideWrapper,

  // templates
  DefaultLayout,
};
