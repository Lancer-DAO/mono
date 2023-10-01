import dynamic from "next/dynamic";

// @animations
const LogoShield = dynamic(() => import("./@animations/LogoShield"));
const ProfileCreated = dynamic(() => import("./@animations/ProfileCreated"));
const QuestCreated = dynamic(() => import("./@animations/QuestCreated"));
const QuestCompleted = dynamic(() => import("./@animations/QuestCompleted"));

// @icons
const Alert = dynamic(() => import("./@icons/Alert"));
const Close = dynamic(() => import("./@icons/Close"));
const Coins = dynamic(() => import("./@icons/Coins"));
const ExternalLinkIcon = dynamic(() => import("./@icons/ExternalLinkIcon"));
const Flame = dynamic(() => import("./@icons/Flame"));
const LancerOnboardingEmblem = dynamic(
  () => import("./@icons/LancerOnboardingEmblem")
);
const LancerOnboardingHelmet = dynamic(
  () => import("./@icons/LancerOnboardingHelmet")
);
/*
const EmptyUpdatesHistory = dynamic(
  () => import("./@icons/EmptyUpdatesHistory")
);
*/
const LockIcon = dynamic(() => import("./@icons/LockIcon"));
const Logo = dynamic(() => import("./@icons/Logo"));
const Mail = dynamic(() => import("./@icons/Mail"));
const Message = dynamic(() => import("./@icons/Message"));
const NextArrow = dynamic(() => import("./@icons/NextArrow"));
const NobleOnboardingEmblem = dynamic(
  () => import("./@icons/NobleOnboardingEmblem")
);
const NobleOnboardingHelmet = dynamic(
  () => import("./@icons/NobleOnboardingHelmet")
);
const PhantomLogo = dynamic(() => import("./@icons/PhantomLogo"));
const ServiceBell = dynamic(() => import("./@icons/ServiceBell"));
const Rocket = dynamic(() => import("./@icons/Rocket"));
const StarIcon = dynamic(() => import("./@icons/StarIcon"));
const USDC = dynamic(() => import("./@icons/USDC"));

// atoms
const Button = dynamic(() => import("./atoms/Button"));
const ChatButton = dynamic(() => import("./atoms/ChatButton"));
const CoinflowOfframp = dynamic(() => import("./atoms/CoinflowOfframp"));
const ContributorInfo = dynamic(() => import("./atoms/ContributorInfo"));
const LinkButton = dynamic(() => import("./atoms/LinkButton"));
const LoadingBar = dynamic(() => import("./atoms/LoadingBar"));
const PreviewCardBase = dynamic(() => import("./atoms/PreviewCardBase"));
const PriceTag = dynamic(() => import("./atoms/PriceTag"));
const ProgressBar = dynamic(() => import("./atoms/Progress"));
const PubKey = dynamic(() => import("./atoms/PubKey"));
const Toggle = dynamic(() => import("./atoms/Toggle"));
const Tooltip = dynamic(() => import("./atoms/Tooltip"));
const TweetShareButton = dynamic(() => import("./atoms/TweetShareButton"));

// molecules
const AccountHeaderOptions = dynamic(
  () => import("./molecules/AccountHeaderOptions")
);
const AddReferrerModal = dynamic(() => import("./molecules/AddReferrerModal"));
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));
const CoinflowFund = dynamic(() => import("./molecules/CoinflowFund"));
const CopyLinkField = dynamic(() => import("./molecules/CopyLinkField"));
const ImageUpload = dynamic(() => import("./molecules/ImageUpload"));
const IndustryDropdown = dynamic(() => import("./molecules/IndustryDropdown"));
const IndustryOptions = dynamic(() => import("./molecules/IndustryOptions"));
const MintsDropdown = dynamic(() => import("./molecules/MintsDropdown"));
const Modal = dynamic(() => import("./molecules/Modal"));
const MultiSelectDropdown = dynamic(
  () => import("./molecules/MultiSelectDropdown")
);
const RangeSlider = dynamic(() => import("./molecules/RangeSlider"));
const ReferenceDialogue = dynamic(
  () => import("./molecules/ReferenceDialogue")
);
const SelectOptions = dynamic(() => import("./molecules/SelectOptions"));
const SidePanel = dynamic(() => import("./molecules/sidebar/index"));
const TutorialsModal = dynamic(() => import("./molecules/TutorialsModal"));
const UpdateTableItem = dynamic(() => import("./molecules/UpdateTableItem"));
const WalletInfo = dynamic(() => import("./molecules/WalletInfo"));

// organisms
const CashoutModal = dynamic(() => import("./organisms/CashoutModal"));
const DisputeModal = dynamic(() => import("./organisms/DisputeModal"));
const FundQuestModal = dynamic(() => import("./organisms/FundQuestModal"));
const Header = dynamic(() => import("./organisms/Header"));
const JoyrideWrapper = dynamic(() => import("./organisms/JoyrideWrapper"));
const UpdateTable = dynamic(() => import("./organisms/UpdateTable"));

// templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  // @animations
  LogoShield,
  ProfileCreated,
  QuestCreated,
  QuestCompleted,

  // @icons
  Alert,
  Close,
  Coins,
  ExternalLinkIcon,
  Flame,
  LancerOnboardingEmblem,
  LancerOnboardingHelmet,
  //EmptyUpdatesHistory,
  LockIcon,
  Logo,
  Mail,
  Message,
  NextArrow,
  NobleOnboardingEmblem,
  NobleOnboardingHelmet,
  PhantomLogo,
  ServiceBell,
  Rocket,
  StarIcon,
  USDC,

  // atoms
  Button,
  ChatButton,
  CoinflowOfframp,
  ContributorInfo,
  LinkButton,
  LoadingBar,
  PreviewCardBase,
  PriceTag,
  ProgressBar,
  PubKey,
  Toggle,
  Tooltip,
  TweetShareButton,

  // molecules
  AccountHeaderOptions,
  AddReferrerModal,
  ApiKeyModal,
  CoinflowFund,
  CopyLinkField,
  ImageUpload,
  IndustryDropdown,
  IndustryOptions,
  MintsDropdown,
  Modal,
  MultiSelectDropdown,
  RangeSlider,
  ReferenceDialogue,
  SelectOptions,
  SidePanel,
  TutorialsModal,
  UpdateTableItem,
  WalletInfo,

  // organisms
  CashoutModal,
  DisputeModal,
  FundQuestModal,
  Header,
  JoyrideWrapper,
  UpdateTable,

  // templates
  DefaultLayout,
};
