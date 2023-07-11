import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { MONO_DEVNET, WSOL_ADDRESS } from "../sdk/constants";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findProgramAuthority } from "../sdk/pda";
import { addApprovedSubmittersInstruction, createFeatureFundingAccountInstruction, denyRequestInstruction, fundFeatureInstruction, submitRequestInstruction } from "../sdk/instructions";
import { assert } from "chai";

describe("deny Request tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;

      it ("test denyRequest", async () => {
        let creator = await createKeypair(provider);
    
         ;
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
        let tx = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), [creator]);
        console.log("createFFA(2nd test) transaction signature", tx);
    
        // transfer 1 WSOL
        let amount = 1 * LAMPORTS_PER_SOL;
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
    
        // Add funds to FFA token account(FundFeature)
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
    
          tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
          console.log("fundFeature transaction signature", tx);
    
          // add pubkey to list of accepted submitters(AddApprovedSubmitters)
          const submitter1 = await createKeypair(provider);
          const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter1,
            WSOL_ADDRESS,
            submitter1.publicKey
        );
          let addApproveSubmitterIx = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            program
          )
          
          tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), [creator]); 
    
          // test deny request fails if there is no submitted request(ApproveRequest)  
          let [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            creator.publicKey,
            program
          );    
          let [feature_token_account] = await findFeatureTokenAccount(
            acc.unixTimestamp,
            creator.publicKey,
            WSOL_ADDRESS,
            program
          );
          let [program_authority] = await findProgramAuthority(program);
      
          try{
            await program.methods.denyRequest()
            .accounts({
              creator: creator.publicKey,
              submitter: submitter1.publicKey,
              featureDataAccount: feature_data_account,
            }).signers([creator]).rpc();
          }catch(err){
            assert.equal((err as AnchorError).error.errorMessage, "No Request Submitted yet")
          }
          // submit request for merging(SubmitRequest)
          const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            creator.publicKey, 
            submitter1.publicKey,
            submitter1_wsol_account.address,
            program
        )
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
        // deny Request after Submission(denyRequest)
        let denyRequestIx = await denyRequestInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter1.publicKey,
          program
        );
    
        tx = await provider.sendAndConfirm(new Transaction().add(denyRequestIx), [creator])
        console.log("denyRequestTx = ", tx);
    
        acc = await program.account.featureDataAccount.fetch(feature_data_account);
        assert.equal(acc.requestSubmitted, false);
        assert.equal(acc.currentSubmitter.toString(), PublicKey.default.toString());
        assert.equal(acc.payoutAccount.toString(), PublicKey.default.toString());
      })    

})