import Link from "next/link";
import { useLocation } from "react-router-dom";
import Logo from "../assets/Logo";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
export const Header = () => {
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
          <Link href={`/create`} className="button-primary">
            New Bounty
          </Link>
          <Link href={`/my_bounties`} className="button-primary">
            My bounties
          </Link>
          <Link href={`/bounties`} className="button-primary">
            All bounties
          </Link>
          <Link
            href={`/account`}
            data-node-type="commerce-cart-open-link"
            className="w-commerce-commercecartopenlink cart-buttno w-inline-block"
          >
            <img
              src="assets/images/noun-wallet-database-763815.png"
              width="50"
              alt="Bag - Jobs Webflow Template"
            />
          </Link>
          <div className={styles.walletButtons}>
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </div>
    </div>
  );
};
