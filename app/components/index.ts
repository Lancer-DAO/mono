import dynamic from "next/dynamic";

// @icons
const Close = dynamic(() => import("./@icons/Close"));
const ExternalLinkIcon = dynamic(() => import("./@icons/ExternalLinkIcon"));
const Logo = dynamic(() => import("./@icons/Logo"));
const PhantomLogo = dynamic(() => import("./@icons/PhantomLogo"));
const StarIcon = dynamic(() => import("./@icons/StarIcon"));
const USDC = dynamic(() => import("./@icons/USDC"));

// atoms
const BountyCardFrame = dynamic(() => import("./atoms/BountyCardFrame"));
const Button = dynamic(() => import("./atoms/Button"));
const CoinflowOfframp = dynamic(() => import("./atoms/CoinflowOfframp"));
const ContributorInfo = dynamic(() => import("./atoms/ContributorInfo"));
const MarketingIcon = dynamic(() => import("./@icons/MarketingIcon"));
const LoadingBar = dynamic(() => import("./atoms/LoadingBar"));
const PreviewCardBase = dynamic(() => import("./atoms/PreviewCardBase"));
const PriceTag = dynamic(() => import("./atoms/PriceTag"));
const ProgressBar = dynamic(() => import("./atoms/progressBar"));
const PubKey = dynamic(() => import("./atoms/PubKey"));
const TweetShareButton = dynamic(() => import("./atoms/TweetShareButton"));

// molecules
const AccountHeaderOptions = dynamic(
  () => import("./molecules/AccountHeaderOptions")
);
const AddReferrerModal = dynamic(() => import("./molecules/AddReferrerModal"));
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));
const BountyCard = dynamic(() => import("./molecules/BountyCard"));
const CoinflowFund = dynamic(() => import("./molecules/CoinflowFund"));
const CopyLinkField = dynamic(() => import("./molecules/CopyLinkField"));
const ImageUpload = dynamic(() => import("./molecules/ImageUpload"));
const MultiSelectDropdown = dynamic(
  () => import("./molecules/MultiSelectDropdown")
);
const RangeSlider = dynamic(() => import("./molecules/RangeSlider"));
const MintsDropdown = dynamic(() => import("./molecules/MintsDropdown"));
const Toggle = dynamic(() => import("./molecules/Toggle"));
const TutorialsModal = dynamic(() => import("./molecules/TutorialsModal"));
const WalletInfo = dynamic(() => import("./molecules/WalletInfo"));

// organisms
const Header = dynamic(() => import("./organisms/Header"));
const JoyrideWrapper = dynamic(() => import("./organisms/JoyrideWrapper"));

// templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  // @icons
  Close,
  ExternalLinkIcon,
  MarketingIcon,
  Logo,
  PhantomLogo,
  StarIcon,
  USDC,

  // atoms
  BountyCardFrame,
  Button,
  CoinflowOfframp,
  ContributorInfo,
  LoadingBar,
  PreviewCardBase,
  PriceTag,
  ProgressBar,
  PubKey,
  TweetShareButton,

  // molecules
  AccountHeaderOptions,
  AddReferrerModal,
  ApiKeyModal,
  BountyCard,
  CoinflowFund,
  CopyLinkField,
  ImageUpload,
  MultiSelectDropdown,
  RangeSlider,
  MintsDropdown,
  Toggle,
  TutorialsModal,
  WalletInfo,

  // organisms
  Header,
  JoyrideWrapper,

  // templates
  DefaultLayout,
};
