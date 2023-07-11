import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createTransferInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { COMPLETER_FEE, LANCER_FEE, MONO_DEVNET, WSOL_ADDRESS } from "../sdk/constants";
import { LAMPORTS_PER_SOL, PublicKey, SYSVAR_RENT_PUBKEY, SystemProgram, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findProgramAuthority } from "../sdk/pda";
import { cancelFeatureInstruction, createFeatureFundingAccountInstruction, fundFeatureInstruction, voteToCancelInstruction } from "../sdk/instructions";

import { assert } from "chai";

describe("fund feature tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;

      it ("test fundFeature Works", async () => {
        let creator = await createKeypair(provider);
    
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
    
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const create_FFA_ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          creator.publicKey,
          program
        );
        const tx1 = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), [creator]);
        console.log("createFFA(2nd test) transaction signature", tx1);
    
        // transfer WSOL
        const accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, 
          {
            filters: [
              {
                dataSize: 381, // number of bytes
              },
              {
                memcmp: {
                  offset: 8, // number of bytes
                  bytes: creator.publicKey.toBase58(), // base58 encoded string
                },
              },
            ],      
          }
        );
    
        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
        const [program_authority] = await findProgramAuthority(program);
    
        // test insuffiecient 
        try {
          await program.methods.fundFeature(new anchor.BN(WSOL_AMOUNT))
            .accounts({
              creator: creator.publicKey,
              fundsMint: WSOL_ADDRESS,
              creatorTokenAccount: creator_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            }).signers([creator]).rpc()
        } catch (err) {
          assert.equal((err as AnchorError).error.errorMessage, "Insufficient funds to pay lancer fee")
        }
    
        //add more SOL
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT * 5 / 100);
    
        // check balaance before funding feature
        const FFA_token_account_before_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
        let fund_feature_ix = await fundFeatureInstruction(
          WSOL_AMOUNT,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
    
          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
          console.log("fundFeature transaction signature", tx2);
          const FFA_token_account_after_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
          assert.equal(
            FFA_token_account_after_balance.value.amount, 
            (//token account needs to be able to pay both lancer and completer
              ((LANCER_FEE + COMPLETER_FEE) * WSOL_AMOUNT) + parseInt(FFA_token_account_before_balance.value.amount)
            ).toString()
          );
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
          assert.equal(acc.amount.toNumber(), WSOL_AMOUNT)
    
      });

      // TODO - Add to tests.yaml
      it ("if admin = creator, creator does not pay extra 5% upfront", async () => {
        let payer = await createKeypair(provider);
        let funder = await provider.publicKey;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            WSOL_ADDRESS,
            funder
        );
    
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const timestamp = Date.now().toString();
        const [feature_data_account] = await findFeatureAccount(
          timestamp, 
          funder, 
          program
      );
      const [feature_token_account] = await findFeatureTokenAccount(
          timestamp, 
          funder,
          WSOL_ADDRESS, 
          program,
      );
      const [program_authority] = await findProgramAuthority(
        program,
    );
        let tx = await program.methods.createFeatureFundingAccount(timestamp).
        accounts({
            creator: funder,
            fundsMint: WSOL_ADDRESS,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .signers([]).rpc();
        // const tx1 = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), []);
        console.log("createFFA(2nd test) transaction signature", tx);

        let bal = await provider.connection.getTokenAccountBalance(creator_wsol_account.address);
        let amount = bal.value.uiAmount * LAMPORTS_PER_SOL;
        // test insuffiecient 
        try {
          await program.methods.fundFeature(new anchor.BN(amount + 1))
            .accounts({
              creator: funder,
              fundsMint: WSOL_ADDRESS,
              creatorTokenAccount: creator_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            }).signers([]).rpc();
        } catch (err) {
          assert.equal((err as AnchorError).error.errorMessage, "Insufficient funds to pay lancer fee")
        }
   
        // check balaance before funding feature
        const FFA_token_account_before_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          timestamp,
          funder,
          WSOL_ADDRESS,
          program
        );
    
          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
          console.log("fundFeature transaction signature", tx2);
          const FFA_token_account_after_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
          assert.equal(
            FFA_token_account_after_balance.value.amount, 
            (
              (amount) + parseInt(FFA_token_account_before_balance.value.amount)
            ).toString()
          );

          const creator_token_account_before_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)

          let vote_to_cancel_ix = await voteToCancelInstruction(
            timestamp, 
            funder, 
            funder, 
            true, 
            program
          )
          let cancelFeatureIx = await cancelFeatureInstruction(
            timestamp,
            funder,
            creator_wsol_account.address,
            WSOL_ADDRESS,
            program
          )
  
          tx = await provider.sendAndConfirm(new Transaction().add(vote_to_cancel_ix).add(cancelFeatureIx), [])
          console.log("cancel Feature Tx = ", tx);
  
          const creator_token_account_after_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)
          assert.equal(
          creator_token_account_after_balance.value.amount, 
          (
              ((1) * amount) + parseInt(creator_token_account_before_balance.value.amount)
          ).toString()
          );
          let closed_token_account = await provider.connection.getBalance(feature_token_account);
          let closed_data_account = await provider.connection.getBalance(feature_data_account);
  
          assert.equal(0, parseInt(closed_data_account.toString()));
          assert.equal(0, parseInt(closed_token_account.toString()));
  
          
          // const creator_token_account_before_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)
          // let cancel_ix = await cancelFeatureInstruction(
          //   acc.unixTimestamp,
          //   funder,
          //   creator_wsol_account.address,
          //   WSOL_ADDRESS,
          //   program
          // );
          // const creator_token_account_after_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)

          // const tx3 = await provider.sendAndConfirm(new Transaction().add(cancel_ix));
          // assert.equal(
          //   creator_token_account_after_balance.value.amount, 
          //   (
          //       ((1) * amount) + parseInt(creator_token_account_before_balance.value.amount)
          //   ).toString()
          //   );
          //   let closed_token_account = await provider.connection.getBalance(feature_token_account);
          //   let closed_data_account = await provider.connection.getBalance(feature_data_account);

          //   assert.equal(0, parseInt(closed_data_account.toString()));
          //   assert.equal(0, parseInt(closed_token_account.toString()));
    
      })

      it ("test amount gets added on if fundFeature is called twice", async () => {
        let creator = await createKeypair(provider);
    
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );

        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const create_FFA_ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          creator.publicKey,
          program
        );
        const tx1 = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), [creator]);
        console.log("createFFA(2nd test) transaction signature", tx1);
    
        // transfer WSOL
        const accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, 
          {
            filters: [
              {
                dataSize: 381, // number of bytes
              },
              {
                memcmp: {
                  offset: 8, // number of bytes
                  bytes: creator.publicKey.toBase58(), // base58 encoded string
                },
              },
            ],      
          }
        );
    
        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
        const [program_authority] = await findProgramAuthority(program);
    
        // test insuffiecient 
        try {
          await program.methods.fundFeature(new anchor.BN(WSOL_AMOUNT))
            .accounts({
              creator: creator.publicKey,
              fundsMint: WSOL_ADDRESS,
              creatorTokenAccount: creator_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            }).signers([creator]).rpc()
        } catch (err) {
          assert.equal((err as AnchorError).error.errorMessage, "Insufficient funds to pay lancer fee")
        }
    
        //add more SOL
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        // check balaance before funding feature
        const FFA_token_account_before_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
        let fund_feature_ix1 = await fundFeatureInstruction(
          WSOL_AMOUNT,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
        let fund_feature_ix2 = await fundFeatureInstruction(
          WSOL_AMOUNT,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

        const tx2 = await provider.sendAndConfirm(
          new Transaction()
            .add(fund_feature_ix1)
            .add(fund_feature_ix2),
            [creator]
        );

          console.log("fundFeature transaction signature", tx2);
          const FFA_token_account_after_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
          assert.equal(
            FFA_token_account_after_balance.value.amount, 
            (//token account needs to be able to pay both lancer and completer
              ((LANCER_FEE + COMPLETER_FEE) * (WSOL_AMOUNT + WSOL_AMOUNT)) + parseInt(FFA_token_account_before_balance.value.amount)
            ).toString()
          );
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          
          assert.equal(acc.amount.toNumber(), WSOL_AMOUNT + WSOL_AMOUNT)

      })

      it ("(admin = creator)test amount gets added but still no lancer fee if fundFeature is called twice", async () => {
        let payer = await createKeypair(provider);
        let funder = await provider.publicKey;

        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            WSOL_ADDRESS,
            funder
        );
        const payer_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          payer,
          WSOL_ADDRESS,
          payer.publicKey
      );

        // transfer any funds in funder wallet so we are certain funder wallet is empty before tests
        let creator_current_wsol_amount = await provider.connection.getTokenAccountBalance(
          creator_wsol_account.address          
        )

        let transfer_ix = await createTransferInstruction(
          creator_wsol_account.address,
          payer_wsol_account.address,
          funder,
          parseInt(creator_current_wsol_amount.value.amount)
        )
        await provider.sendAndConfirm(new Transaction().add(transfer_ix), []);
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

        const timestamp = Date.now().toString();
        const [feature_data_account] = await findFeatureAccount(
          timestamp, 
          funder, 
          program
      );
      const [feature_token_account] = await findFeatureTokenAccount(
          timestamp, 
          funder,
          WSOL_ADDRESS, 
          program,
      );
      const [program_authority] = await findProgramAuthority(
        program,
    );
        let tx = await program.methods.createFeatureFundingAccount(timestamp).
        accounts({
            creator: funder,
            fundsMint: WSOL_ADDRESS,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .signers([]).rpc();
        // const tx1 = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), []);
        console.log("createFFA(2nd test) transaction signature", tx);

        // test insuffiecient acc
        try {
          await program.methods.fundFeature(new anchor.BN(WSOL_AMOUNT + WSOL_AMOUNT))
            .accounts({
              creator: funder,
              fundsMint: WSOL_ADDRESS,
              creatorTokenAccount: creator_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            }).signers([]).rpc();  
        } catch (err) {
          assert.equal((err as AnchorError).error.errorMessage, "Insufficient funds to pay lancer fee")
        }

        // check balaance before funding feature
        const FFA_token_account_before_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
        let fund_feature_ix1 = await fundFeatureInstruction(
          WSOL_AMOUNT,
          timestamp,
          funder,
          WSOL_ADDRESS,
          program
        );
        let fund_feature_ix2 = await fundFeatureInstruction(
          WSOL_AMOUNT,
          timestamp,
          funder,
          WSOL_ADDRESS,
          program
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

        const tx2 = await provider.sendAndConfirm(
          new Transaction()
            .add(fund_feature_ix1)
            .add(fund_feature_ix2),
            []
        );
        console.log("fundFeature transaction signature", tx2);

        const FFA_token_account_after_balance = await provider.connection.getTokenAccountBalance(feature_token_account)
          assert.equal(
            FFA_token_account_after_balance.value.amount, 
            (//token account needs to be able to pay both lancer and completer
              ((WSOL_AMOUNT + WSOL_AMOUNT)) + parseInt(FFA_token_account_before_balance.value.amount)
            ).toString()
          );
          let acc = await program.account.featureDataAccount.fetch(feature_data_account);
          
          assert.equal(acc.amount.toNumber(), WSOL_AMOUNT + WSOL_AMOUNT)

      })
        
})