import Head from "next/head";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();
import Header from "@/src/components/organisms/Header";
import { useState } from "react";
import ReactSwitch from 'react-switch';
import styles from "./account/style.module.css";
import { useLancer } from "@/src/providers";
import {
  DefaultLayout,
  CreateBountyForm,
  FundBountyForm,
} from "@/src/components/";
import { PublicKey } from "@solana/web3.js";
import { LinkButtonProps } from "@/src/components/atoms/LinkButton";

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
  const [checked, setChecked] = useState(true);
  const [checked1, notprivate] = useState(true);
  const handleChange = val => {
    setChecked(val)
  }
  const isPrivate = val2 => {
    notprivate(val2)
  }
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
          <p className={styles.sen}>You're almost done.</p>
          <p className={styles.sub}>Please follow the steps to set up your bounty and post it.</p>
        </div>

        <div className={styles.area}>
          <p className={styles.sen2}>Bounty Details</p>
          <div className={styles.createFund}>

            <div className={styles.Escrow + ' ' + styles.common}>
              <div className={styles.createHead}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1131168057675493477/image.png?width=45&height=45" alt="" className={styles.down} />&nbsp;
                Create Escrow
              </div>
              <p className={styles.dot}>This ensures the safe delivery of payment for services.</p>
              <p className={styles.dot}>Learn more about <span className={styles.terms}>Terms and Conditions &nbsp;<img src="https://media.discordapp.net/attachments/874259441384574976/1131171994994479196/image.png?width=31&height=31" alt="" className={styles.go} /></span></p>
              <button className={styles.import + ' ' + styles.full}>Create</button>
            </div>


            <div className={styles.fund + ' ' + styles.common}>
              <div className={styles.createHead}>
                <img src="https://media.discordapp.net/attachments/874259441384574976/1131168057675493477/image.png?width=45&height=45" alt="" className={styles.down} />&nbsp;
                Fund Bounty
              </div>
              <p className={styles.weight}>Funding Amount</p>
              <div className={styles.fundArea}>
                <input className={styles.enterFund} placeholder="1000 USD" ></input>
                <div className={styles.usd}>
                  <p className={styles.usdc}><span className={styles.white}>USD</span>/USDC</p>
                  <ReactSwitch className={styles.toggle}
                    onColor="#333;"
                    offColor="#333;"
                    offHandleColor="#111;"
                    checked={checked}
                    onChange={handleChange}
                    uncheckedIcon
                    checkedIcon
                  />
                </div>
              </div>
              <button className={styles.import + ' ' + styles.full}>Fund</button>
            </div>
          </div>

          <div className={styles.createFund}>
            <div className={styles.name1}>
              <p className={styles.weight}>Bounty Name</p>
              <input type="text" className={styles.entername} placeholder="my first bounty" />
            </div>
            <div className={styles.time}>
              <p className={styles.weight}>Est. Completion Time (hrs)</p>
              <input type="text" className={styles.entername} placeholder="6.8" />
            </div>
          </div>


          <div className={styles.framework}>
            <p className={styles.weight}>Frameworks / Languages</p>
            <div className={styles.bar}>
              <div className={styles.langs}>
                <div className={styles.sim + ' ' + styles.react}>React</div>
                <div className={styles.sim + ' ' + styles.html}>HTML</div>
                <div className={styles.sim + ' ' + styles.css}>CSS</div>
                <div className={styles.sim + ' ' + styles.js}>JavaScript</div>
              </div>
              <img src="https://media.discordapp.net/attachments/874259441384574976/1131168057675493477/image.png?width=45&height=45" alt="" className={styles.down + ' ' + styles.fix} />
            </div>
          </div>

          <div className={styles.description}>
            <div className={styles.dHead}>
              <p className={styles.weight}>
                Description
              </p>
              <button className={styles.prev}>Preview</button>
            </div>
            <input type="text" className={styles.dArea} />
            <div className={styles.private}>Is this Issue Private
              <ReactSwitch className={styles.toggle + ' ' + styles.pfix}
                onColor="#333;"
                offColor="#333;"
                offHandleColor="#111;"
                checked={checked1}
                onChange={isPrivate}
                uncheckedIcon
                checkedIcon
              /></div>
          </div>
          <button className={styles.import + ' ' + styles.full +' '+ styles.post}>Post Bounty</button>
        </div>

      </div>

    </div>
  );
}
