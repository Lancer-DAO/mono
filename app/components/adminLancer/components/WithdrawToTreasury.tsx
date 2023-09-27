import { AnchorProvider, Program } from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useState } from "react";
import { MonoProgram } from "../../../escrow/sdk/types/mono_program";
import MonoProgramJSON from "@/escrow/sdk/idl/mono_program.json";
import { PublicKey, Transaction } from "@solana/web3.js";
import { BONK_MINT, MONO_ADDRESS, USDC_MINT } from "../../../src/constants";
import {
  createLancerTokenAccountInstruction,
  withdrawTokensInstruction,
} from "../../../escrow/sdk/instructions";
import dynamic from "next/dynamic";
import { useUserWallet } from "@/src/providers";
import { currentUser } from "@/server/api/routers/users/currentUser";

const WalletDisconnectButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletDisconnectButton,
  { ssr: false }
);
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const WithdrawToTreasury: FC = () => {
  const { connection } = useConnection();
  const { currentWallet, provider, program } = useUserWallet();

  const [formData, setFormData] = useState({
    fundingAmount: null,
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const createFeesAccount = useCallback(async () => {
    // if (!publicKey) throw new WalletNotConnectedError();
    // const provider = new AnchorProvider(
    //   connection,
    //   { ...wallet, signAllTransactions, signTransaction, publicKey },
    //   {}
    // );
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_ADDRESS),
      provider
    );
    const create_lancer_token_account_ix =
      await createLancerTokenAccountInstruction(
        new PublicKey(BONK_MINT),
        program
      );
    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_token_account_ix),
      []
    );
  }, [currentWallet, connection]);

  const withdrawTokens = useCallback(async () => {
    const program = new Program<MonoProgram>(
      MonoProgramJSON as unknown as MonoProgram,
      new PublicKey(MONO_ADDRESS),
      provider
    );
    const withdrawer = new PublicKey(
      "9TWkAtKRLffNrdZpdXmuXYkou7txZAFfjhPQeArZRHqF"
    );
    // const withdrawerTokenAccount = await getAssociatedTokenAddress(
    //   new PublicKey(USDC_MINT),
    //   withdrawer
    // );
    const create_lancer_token_account_ix = await withdrawTokensInstruction(
      formData.fundingAmount * 10 ** 6,
      new PublicKey(USDC_MINT),
      withdrawer,
      new PublicKey("8JUa3qKQrRN9dhotQLtxMcKxZZieioBsgc2W6Q34S6CH"),
      program
    );
    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_token_account_ix),
      []
    );
  }, [currentWallet, connection, formData]);

  return (
    connection && (
      <div className="ml-10 mt-40">
        <button onClick={createFeesAccount} disabled={!currentWallet}>
          Create New Mint Fees Account
        </button>
        <>
          <input
            type="number"
            className="input w-input ml-2"
            name="fundingAmount"
            placeholder="1000 (USD)"
            id="Issue"
            value={formData.fundingAmount}
            onChange={handleChange}
          />

          <button onClick={withdrawTokens} disabled={!currentWallet}>
            Withdraw Tokens
          </button>
        </>
      </div>
    )
  );
};
