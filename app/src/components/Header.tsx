import Link from "next/link";
import Logo from "../assets/Logo";
import { PubKey } from "@/src/components/PublicKey";
import { useLancer } from "@/src/providers";
import { getWalletProviderImage } from "@/src/utils";
import { useState } from "react";

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
          <Link href={`/create`} className="button-primary">
            New Bounty
          </Link>
          <Link href={`/my_bounties`} className="button-primary">
            My bounties
          </Link>
          <Link href={`/bounties`} className="button-primary">
            All bounties
          </Link>

          <Link href={`/account`} className="button-primary">
            Account
          </Link>

          {currentWallet && (
            <div
              data-delay="0"
              data-hover="false"
              id="w-node-b1521c3c-4fa1-4011-ae36-88dcb6e746fb-0ae9cdc2"
              className="w-dropdown hug"
              onClick={toggleWalletSelectOpen}
            >
              <main className="dropdown-toggle-3 w-dropdown-toggle-3">
                <div className="header-current-wallet">
                  {getWalletProviderImage(currentWallet.providerName)}
                  <PubKey pubKey={currentWallet.publicKey} noCopy />
                </div>
                <div className="w-icon-dropdown-toggle"></div>
              </main>
              {isWalletSelectOpen && wallets && (
                <div
                  className="w-dropdown-list"
                  onMouseLeave={() => setIsWalletSelectOpen(false)}
                >
                  {wallets.map((wallet) => (
                    <div
                      className="header-current-wallet"
                      onClick={() => {
                        setCurrentWallet(wallet);
                      }}
                    >
                      {getWalletProviderImage(wallet.providerName)}
                      <PubKey pubKey={wallet.publicKey} noCopy />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
