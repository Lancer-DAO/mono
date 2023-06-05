import dynamic from "next/dynamic";

// Atoms
const ContributorInfo = dynamic(() => import("./atoms/ContributorInfo"));
const LinkButton = dynamic(() => import("./atoms/LinkButton"));
const LoadingBar = dynamic(() => import("./atoms/LoadingBar"));

// Molecules
const ApiKeyModal = dynamic(() => import("./molecules/ApiKeyModal"));

// Organisms
const Header = dynamic(() => import("./organisms/Header"));

// Templates
const DefaultLayout = dynamic(() => import("./templates/DefaultLayout"));

export {
  ContributorInfo,
  LinkButton,
  Header,
  DefaultLayout,
  LoadingBar,
  ApiKeyModal,
};
