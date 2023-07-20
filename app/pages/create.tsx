import Head from "next/head";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();
import Header from "@/src/components/organisms/Header";
import { useState } from "react";
import styles from "./account/style.module.css";
import { useLancer } from "@/src/providers";
import {
  DefaultLayout,
  CreateBountyForm,
  FundBountyForm,
} from "@/src/components/";
import { PublicKey } from "@solana/web3.js";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";  
const HEADER_LINKS: LinkButtonProps[] = [
  { href: "/create2", children: "New Bounty", id: "create-bounty-link" },
  { href: "/bounties", children: "Bounties", id: "bounties-link" },
];
export type FORM_SECTION = "CREATE" | "FUND";

export default function Home() {
  return (
    <>
      <Head>
        <title>Lancer | New Bounty</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <main>
        <App />
      </main>
    </>
  );
}

function App() {
  const { provider, program } = useLancer();
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const createAccountPoll = (publicKey: PublicKey) => {
    provider.connection.onAccountChange(publicKey, (callback) => {
      setIsAccountCreated(true);
    });
  };
  return (
    <div className={styles.create}>
      <Header />

      <div className={styles.MainC} >
        <div className={styles.wrps}>
          <p className={styles.sen}>Lets get some work done</p>
          <p className={styles.sub}>To post a new bounty, import an existing Git Repository.</p>
        </div>

        <div className={styles.area}>
          <p className={styles.sen2}>Import Git Repository</p>
          <div className={styles.search}>
            <div className={styles.change}>
              <img src="https://media.discordapp.net/attachments/874259441384574976/1130144500090671114/image.png?width=31&height=31" alt="" className={styles.git} />
              <p className={styles.repo}>JackStuart</p>
            </div>
            <div className={styles.sc}>
              <img src="https://media.discordapp.net/attachments/874259441384574976/1130555471091216384/image.png?width=45&height=45" alt="" className={styles.git} />
              Search...
            </div>
          </div>



          <div className={styles.repoTable}>

          <div className={styles.row}>
              <div className={styles.right}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130919952480731186/image.png?width=49&height=50" alt="" className={styles.repoLogo} />
                <p className={styles.repoName}>project-alpha</p>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130923634341466202/image.png?width=31&height=32" alt="" className={styles.ifLocked} />
                <p className={styles.dot}>.</p>
                <p className={styles.days}>4d ago</p>
              </div>

             <a href="/create2"> <button className={styles.import}>Import</button></a>
            </div><div className={styles.row}>
              <div className={styles.right}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130919952480731186/image.png?width=49&height=50" alt="" className={styles.repoLogo} />
                <p className={styles.repoName}>project-alpha</p>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130923634341466202/image.png?width=31&height=32" alt="" className={styles.ifLocked} />
                <p className={styles.dot}>.</p>
                <p className={styles.days}>4d ago</p>
              </div>

             <a href="/create2"> <button className={styles.import}>Import</button></a>
            </div><div className={styles.row}>
              <div className={styles.right}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130919952480731186/image.png?width=49&height=50" alt="" className={styles.repoLogo} />
                <p className={styles.repoName}>project-alpha</p>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130923634341466202/image.png?width=31&height=32" alt="" className={styles.ifLocked} />
                <p className={styles.dot}>.</p>
                <p className={styles.days}>4d ago</p>
              </div>

             <a href="/create2"> <button className={styles.import}>Import</button></a>
            </div>
            
            <div className={styles.row}>
              <div className={styles.right}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130919952480731186/image.png?width=49&height=50" alt="" className={styles.repoLogo} />
                <p className={styles.repoName}>project-alpha</p>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1130923634341466202/image.png?width=31&height=32" alt="" className={styles.ifLocked} />
                <p className={styles.dot}>.</p>
                <p className={styles.days}>4d ago</p>
              </div>

             <a href="/create2"> <button className={styles.import}>Import</button></a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
