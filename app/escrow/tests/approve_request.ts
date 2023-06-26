import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAccount, createInitializeAccount3Instruction, createMint, createSyncNativeInstruction, getAccount, getMint, getOrCreateAssociatedTokenAccount, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { COMPLETER_FEE, LANCER_FEE, LANCER_FEE_THIRD_PARTY, MINT_DECIMALS, MONO_DEVNET, THIRD_PARTY, WSOL_ADDRESS } from "../sdk/constants";
import { ComputeBudgetInstruction, ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findLancerCompanyTokens, findLancerCompleterTokens, findLancerProgramAuthority, findLancerTokenAccount, findProgramAuthority, findProgramMintAuthority } from "../sdk/pda";
import { addApprovedSubmittersInstruction, approveRequestInstruction, approveRequestMultipleTransaction, approveRequestThirdPartyInstruction, cancelFeatureInstruction, createFeatureFundingAccountInstruction, createLancerTokenAccountInstruction, denyRequestInstruction, enableMultipleSubmittersInstruction, fundFeatureInstruction, removeApprovedSubmittersInstruction, setShareMultipleSubmittersInstruction, submitRequestInstruction, submitRequestMultipleInstruction, voteToCancelInstruction, withdrawTokensInstruction } from "../sdk/instructions";
import { assert } from "chai";
import { min } from "bn.js";

describe("approve Request tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider =  anchor.getProvider() as anchor.AnchorProvider;

  const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram, 
        new PublicKey(MONO_DEVNET), 
        provider
    );
    const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL; 

    it ("test approveRequest",async () => {
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
    
          // test approve request fails if there is no submitted request(ApproveRequest)  
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

          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
          const [lancer_token_program_authority] = await findLancerProgramAuthority(
            program
          );

          try{
            let approveRequestIx = await program.methods.approveRequest()
            .accounts({
              creator: creator.publicKey,
              submitter: submitter1.publicKey,
              payoutAccount: submitter1_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              lancerTokenProgramAuthority: lancer_token_program_authority,
              lancerDaoTokenAccount: lancer_dao_token_account,
              tokenProgram: TOKEN_PROGRAM_ID,
            }).signers([creator]).rpc();
          }catch(err){
            // console.log("err: ", err);
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
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
        // approve request(merge and send funds)(ApproveRequest)
          const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
          const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
    
          let approveRequestIx = await approveRequestInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            submitter1_wsol_account.address,
            WSOL_ADDRESS,
            program
          );
          tx = await provider.sendAndConfirm(new Transaction().add(approveRequestIx), [creator])
          console.log("approve Request tx = ", tx);
    
          const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
            const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
    
            assert.equal(
              submitter_token_account_after_balance.value.amount, 
              (// submitter gets 95% of bounty amount
                (COMPLETER_FEE * amount) + parseInt(submitter_token_account_before_balance.value.amount)
              ).toString()
            );
            assert.equal(
              lancer_token_account_after_balance.value.amount,
              (// 5% from both sides
                (LANCER_FEE * amount) + parseInt(lancer_token_account_before_balance.value.amount)
              ).toString()
            )    
    
            // Check token account and data account are closed
            let closed_token_account = await provider.connection.getBalance(feature_token_account);
            let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
            assert.equal(0, parseInt(closed_data_account.toString()));
            assert.equal(0, parseInt(closed_token_account.toString()));
      })
    
    
      it ("test creator = submitter works perfectly when calling approveRequest", async () => {
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
          const submitter1 = creator;
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
    
          // test approve request fails if there is no submitted request(ApproveRequest)  
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
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );

          const [lancer_token_program_authority] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );

          try{
            await program.methods.approveRequest()
            .accounts({
              creator: creator.publicKey,
              submitter: submitter1.publicKey,
              payoutAccount: submitter1_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              lancerTokenProgramAuthority: lancer_token_program_authority,
              lancerDaoTokenAccount: lancer_dao_token_account,
              tokenProgram: TOKEN_PROGRAM_ID,
            }).signers([creator]).rpc();
          }catch(err){
            // console.log("err ", err);
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
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])

    
          // approve request(merge and send funds)(ApproveRequest)
            const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
            acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
            // let creator_company_tokens_account_before_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
            // let payout_completer_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
            const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
    
            let approveRequestIx = await approveRequestInstruction(
              acc.unixTimestamp,
              creator.publicKey,
              submitter1.publicKey,
              submitter1_wsol_account.address,
              WSOL_ADDRESS,
              program
            );
            tx = await provider.sendAndConfirm(new Transaction().add(approveRequestIx), [creator])
            console.log("approve Request tx = ", tx);
    
            const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
            const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
    
            assert.equal(
              submitter_token_account_after_balance.value.amount, 
              (// submitter gets 95% of bounty amount
                (COMPLETER_FEE * amount) + parseInt(submitter_token_account_before_balance.value.amount)
              ).toString()
            );
            assert.equal(
              lancer_token_account_after_balance.value.amount,
              (// 5% from both sides
                (LANCER_FEE * amount) + parseInt(lancer_token_account_before_balance.value.amount)
              ).toString()
            )
           // Check token account and data account are closed
            let closed_token_account = await provider.connection.getBalance(feature_token_account);
            let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
            assert.equal(0, parseInt(closed_data_account.toString()));
            assert.equal(0, parseInt(closed_token_account.toString()));
      })

      it ("test third party fees ",async () => {
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
    
          // test approve request fails if there is no submitted request(ApproveRequest)  
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
      
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
          const [lancer_token_program_authority] = await findLancerProgramAuthority(
            program
          );
      
          // submit request for merging(SubmitRequest)
          const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            creator.publicKey, 
            submitter1.publicKey,
            submitter1_wsol_account.address,
            program
        )
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
        const third_party = await createKeypair(provider);
        const third_party_wsol_account = await getOrCreateAssociatedTokenAccount(
         provider.connection,
         third_party,
         WSOL_ADDRESS,
         third_party.publicKey
         );
    
        // approve request(merge and send funds)(ApproveRequest)
          const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
          const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
          const third_party_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(third_party_wsol_account.address);
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

          let approveRequestThirdPartyIx = await approveRequestThirdPartyInstruction(
            acc.unixTimestamp,
            third_party_wsol_account.address,
            creator.publicKey,
            submitter1.publicKey,
            submitter1_wsol_account.address,
            WSOL_ADDRESS,
            program
          );
          tx = await provider.sendAndConfirm(new Transaction().add(approveRequestThirdPartyIx), [creator])
          console.log("approve Request Third party tx = ", tx);
    
          const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
         const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
         const third_party_tokens_account_after_balance = await provider.connection.getTokenAccountBalance(third_party_wsol_account.address);

            assert.equal(
              submitter_token_account_after_balance.value.amount, 
              (// submitter gets 95% of bounty amount
                (COMPLETER_FEE * amount) + parseInt(submitter_token_account_before_balance.value.amount)
              ).toString()
            );
            assert.equal(
              lancer_token_account_after_balance.value.amount,
              (// 5% from both sides
                (LANCER_FEE_THIRD_PARTY * amount) + parseInt(lancer_token_account_before_balance.value.amount)
              ).toString()
            )
            assert.equal(
              third_party_tokens_account_after_balance.value.amount,
              (// 10% from lancer fee
                (THIRD_PARTY * amount) + parseInt(third_party_tokens_account_before_balance.value.amount)
              ).toString()
            )

            // Check token account and data account are closed
            let closed_token_account = await provider.connection.getBalance(feature_token_account);
            let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
            assert.equal(0, parseInt(closed_data_account.toString()));
            assert.equal(0, parseInt(closed_token_account.toString()));

      })
    
      it ("approve ReQuest for Multiple Submitters", async () => {
        let creator = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);
         
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter1,
          WSOL_ADDRESS,
          submitter1.publicKey
        );
        const submitter2_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter2,
          WSOL_ADDRESS,
          submitter2.publicKey
        );
        const submitter3_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter3,
          WSOL_ADDRESS,
          submitter3.publicKey
        );
        const submitter4_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter4,
          WSOL_ADDRESS,
          submitter4.publicKey
        );
        const submitter5_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter5,
          WSOL_ADDRESS,
          submitter5.publicKey
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          creator.publicKey,
          program
        );
    
        let tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
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
          let amount = 1 * LAMPORTS_PER_SOL;
        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
    
          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
    
    
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
            program
          );
    
        const [program_authority] = await findProgramAuthority(program);
    
        
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
    
        let approveSubmitter1Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter1.publicKey,
          program
        )
        let approveSubmitter2Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter2.publicKey,
          program
        )
        let approveSubmitter3Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter3.publicKey,
          program
        )
        let approveSubmitter4Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter4.publicKey,
          program
        )
        let approveSubmitter5Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter5.publicKey,
          program
        )
    
        tx = await provider.sendAndConfirm(
          new Transaction()
            .add(approveSubmitter1Ix)
            .add(approveSubmitter2Ix)
            .add(approveSubmitter3Ix)
            .add(approveSubmitter4Ix)
            .add(approveSubmitter5Ix), 
            [creator]
        ); 
    
    
        try
        { 
          await program.methods.submitRequestMultiple()
          .accounts({
            creator: creator.publicKey,
            submitter: submitter1.publicKey,
            featureDataAccount: feature_data_account,
          }).signers([submitter1]).rpc();
        }catch(err)
        {
          assert.equal((err as AnchorError).error.errorMessage, "This Instruction is used for only Multiple submitters.");
        }
    
        let enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
        await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), [creator]);
    
          let submitRequestMultipleIx1 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            program
          )
          
          let submitRequestMultipleIx2 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter2.publicKey,
            program
          )
          let submitRequestMultipleIx3 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter3.publicKey,
            program
          )
          let submitRequestMultipleIx4 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter4.publicKey,
            program
          )
          let submitRequestMultipleIx5 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter5.publicKey,
            program
          )
    
          await provider.sendAndConfirm(new Transaction().add(submitRequestMultipleIx1).add(submitRequestMultipleIx2), [submitter1, submitter2])
          try {
            await program.methods.approveRequestMultiple()
              .accounts({
                creator: creator.publicKey,
                featureDataAccount: feature_data_account,
                featureTokenAccount: feature_token_account,
                lancerDaoTokenAccount: lancer_dao_token_account,
                lancerTokenProgramAuthority: lancer_token_program_authority,
                programAuthority: program_authority,
                tokenProgram: TOKEN_PROGRAM_ID
              }).signers([creator]).rpc();
          } catch (err) {
            assert.equal((err as AnchorError).error.errorMessage, "Share must be 100")
          }
          let submitter1_share = 50;
          let submitter2_share = 25;
          let submitter3_share = 15;
          let submitter4_share = 5;
          let submitter5_share = 5;

          let submitter1_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            submitter1_share,
            program
          )
    
        let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter2.publicKey,
          submitter2_share,
          program
        )
        let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter3.publicKey,
          submitter3_share,
          program
        )
        let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter4.publicKey,
          submitter4_share,
          program
        )
        let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter5.publicKey,
          submitter5_share,
          program
        )
    
        tx = await provider.sendAndConfirm(
          new Transaction()
            .add(submitter1_share_ix)
            .add(submitter2_share_ix)
            .add(submitter3_share_ix)
            .add(submitter4_share_ix)
            .add(submitter5_share_ix), 
            [creator]
        ); 
        
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

    
        let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
        let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
        let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
        let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
    
        let transaction = await approveRequestMultipleTransaction(
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        )
        await provider.sendAndConfirm(transaction, [creator])
    
        let submitter1_after_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
        let submitter2_after_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
        let submitter3_after_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
        let submitter4_after_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let submitter5_after_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
        let lancer_after_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
    
    
        assert.equal(
          parseInt(
            submitter1_before_token_balance.value.amount
          ) + (amount * COMPLETER_FEE * submitter1_share / 100),
          parseInt(
            submitter1_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter2_before_token_balance.value.amount
          ) + (amount * COMPLETER_FEE * submitter2_share / 100),
          parseInt(
            submitter2_after_token_balance.value.amount
          )
        );

        assert.equal(
          parseInt(
            submitter3_before_token_balance.value.amount
          ) + (amount * COMPLETER_FEE * submitter3_share / 100),
          parseInt(
            submitter3_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter4_before_token_balance.value.amount
          ) + (amount * COMPLETER_FEE * submitter4_share / 100),
          parseInt(
            submitter4_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter5_before_token_balance.value.amount
          ) + (amount * COMPLETER_FEE * submitter5_share / 100),
          parseInt(
            submitter5_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            lancer_before_token_balance.value.amount
          ) + (amount * LANCER_FEE),
          parseInt(
            lancer_after_token_balance.value.amount
          )
        );
    
    
      })
    
      it ("test no lancer fees when admin creates bounty and calls approveRequest(Multiple Submitters)", async () => {
        // pays funds for pubkeys
        let payer = await createKeypair(provider);
        let funder = provider.publicKey;
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);
         
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            WSOL_ADDRESS,
            funder
        );
        const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter1,
          WSOL_ADDRESS,
          submitter1.publicKey
        );
        const submitter2_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter2,
          WSOL_ADDRESS,
          submitter2.publicKey
        );
        const submitter3_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter3,
          WSOL_ADDRESS,
          submitter3.publicKey
        );
        const submitter4_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter4,
          WSOL_ADDRESS,
          submitter4.publicKey
        );
        const submitter5_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter5,
          WSOL_ADDRESS,
          submitter5.publicKey
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          funder,
          program
        );
    
        let tx = await provider.sendAndConfirm(new Transaction().add(ix), []);
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
                  bytes: funder.toBase58(), // base58 encoded string
                },
              },
            ],      
          }
        );
          let amount = 1 * LAMPORTS_PER_SOL;
        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          acc.unixTimestamp,
          funder,
          WSOL_ADDRESS,
          program
        );

          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
    
    
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          funder,
          WSOL_ADDRESS,
          program
        );
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
            program
          );
    
        const [program_authority] = await findProgramAuthority(program);

        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          funder,
          program
        );
    
        let approveSubmitter1Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter1.publicKey,
          program
        )
        let approveSubmitter2Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter2.publicKey,
          program
        )
        let approveSubmitter3Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter3.publicKey,
          program
        )
        let approveSubmitter4Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter4.publicKey,
          program
        )
        let approveSubmitter5Ix = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter5.publicKey,
          program
        )
    
        tx = await provider.sendAndConfirm(
          new Transaction()
            .add(approveSubmitter1Ix)
            .add(approveSubmitter2Ix)
            .add(approveSubmitter3Ix)
            .add(approveSubmitter4Ix)
            .add(approveSubmitter5Ix), 
            []
        ); 
    
    
        try
        { 
          await program.methods.submitRequestMultiple()
          .accounts({
            creator: funder,
            submitter: submitter1.publicKey,
            featureDataAccount: feature_data_account,
          }).signers([submitter1]).rpc();
        }catch(err)
        {
          assert.equal((err as AnchorError).error.errorMessage, "This Instruction is used for only Multiple submitters.");
        }
    
        let enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          program
        );
        await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), []);
    
          let submitRequestMultipleIx1 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            funder,
            submitter1.publicKey,
            program
          )

          let submitRequestMultipleIx2 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            funder,
            submitter2.publicKey,
            program
          )
          let submitRequestMultipleIx3 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            funder,
            submitter3.publicKey,
            program
          )
          let submitRequestMultipleIx4 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            funder,
            submitter4.publicKey,
            program
          )
          let submitRequestMultipleIx5 = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            funder,
            submitter5.publicKey,
            program
          )
    
          await provider.sendAndConfirm(new Transaction().add(submitRequestMultipleIx1).add(submitRequestMultipleIx2), [submitter1, submitter2])
          try {
            await program.methods.approveRequestMultiple()
              .accounts({
                creator: funder,
                featureDataAccount: feature_data_account,
                featureTokenAccount: feature_token_account,
                lancerDaoTokenAccount: lancer_dao_token_account,
                lancerTokenProgramAuthority: lancer_token_program_authority,
                programAuthority: program_authority,
                tokenProgram: TOKEN_PROGRAM_ID
              }).signers([]).rpc();
          } catch (err) {
            assert.equal((err as AnchorError).error.errorMessage, "Share must be 100")
          }
          let submitter1_share = 50;
          let submitter2_share = 25;
          let submitter3_share = 15;
          let submitter4_share = 5;
          let submitter5_share = 5;

          let submitter1_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter1.publicKey,
            submitter1_share,
            program
          )
    
        let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter2.publicKey,
          submitter2_share,
          program
        )
        let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter3.publicKey,
          submitter3_share,
          program
        )
        let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter4.publicKey,
          submitter4_share,
          program
        )
        let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
          acc.unixTimestamp,
          funder,
          submitter5.publicKey,
          submitter5_share,
          program
        )
    
        tx = await provider.sendAndConfirm(
          new Transaction()
            .add(submitter1_share_ix)
            .add(submitter2_share_ix)
            .add(submitter3_share_ix)
            .add(submitter4_share_ix)
            .add(submitter5_share_ix), 
            []
        ); 
        
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
  
        let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
        let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
        let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
        let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
        let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
    
        let transaction = await approveRequestMultipleTransaction(
          acc.unixTimestamp,
          funder,
          WSOL_ADDRESS,
          program
        )
        await provider.sendAndConfirm(transaction, [])
    
        let submitter1_after_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
        let submitter2_after_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
        let submitter3_after_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
        let submitter4_after_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let submitter5_after_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
        let lancer_after_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);

        assert.equal(
          parseInt(
            submitter1_before_token_balance.value.amount
          ) + (amount * submitter1_share / 100),
          parseInt(
            submitter1_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter2_before_token_balance.value.amount
          ) + (amount * submitter2_share / 100),
          parseInt(
            submitter2_after_token_balance.value.amount
          )
        );

        assert.equal(
          parseInt(
            submitter3_before_token_balance.value.amount
          ) + (amount * submitter3_share / 100),
          parseInt(
            submitter3_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter4_before_token_balance.value.amount
          ) + (amount * submitter4_share / 100),
          parseInt(
            submitter4_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            submitter5_before_token_balance.value.amount
          ) + (amount * submitter5_share / 100),
          parseInt(
            submitter5_after_token_balance.value.amount
          )
        );
        assert.equal(
          parseInt(
            lancer_before_token_balance.value.amount
          ),
          parseInt(
            lancer_after_token_balance.value.amount
          )
        );

      })

      it ("test third party does not collect fees when admin creates bounty and calls approveRequestThirdParty", async () => {
        let payer = await createKeypair(provider);
    
        let funder = await provider.publicKey;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            WSOL_ADDRESS,
            funder
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const create_FFA_ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          funder,
          program
        );
        let tx = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), []);
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
                  bytes: funder.toBase58(), // base58 encoded string
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
          funder,
          WSOL_ADDRESS,
          program
        );
    
          tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
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
            funder,
            submitter1.publicKey,
            program
          )
          
          tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), []); 
    
          // test approve request fails if there is no submitted request(ApproveRequest)  
          let [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            funder,
            program
          );    
          let [feature_token_account] = await findFeatureTokenAccount(
            acc.unixTimestamp,
            funder,
            WSOL_ADDRESS,
            program
          );
          let [program_authority] = await findProgramAuthority(program);
      
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
          const [lancer_token_program_authority] = await findLancerProgramAuthority(
            program
          );
      
          // submit request for merging(SubmitRequest)
          const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            funder, 
            submitter1.publicKey,
            submitter1_wsol_account.address,
            program
        )
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
        const third_party = await createKeypair(provider);
        const third_party_wsol_account = await getOrCreateAssociatedTokenAccount(
         provider.connection,
         third_party,
         WSOL_ADDRESS,
         third_party.publicKey
         );
    
        // approve request(merge and send funds)(ApproveRequest)
          const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
          const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
          const third_party_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(third_party_wsol_account.address);
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
      
    

          let approveRequestThirdPartyIx = await approveRequestThirdPartyInstruction(
            acc.unixTimestamp,
            third_party_wsol_account.address,
            funder,
            submitter1.publicKey,
            submitter1_wsol_account.address,
            WSOL_ADDRESS,
            program
          );
          tx = await provider.sendAndConfirm(new Transaction().add(approveRequestThirdPartyIx), [])
          console.log("approve Request Third party tx = ", tx);
    
          const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
            const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
            const third_party_tokens_account_after_balance = await provider.connection.getTokenAccountBalance(third_party_wsol_account.address);

            assert.equal(
              submitter_token_account_after_balance.value.amount, 
              (// submitter gets 95% of bounty amount
                amount + parseInt(submitter_token_account_before_balance.value.amount)
              ).toString()
            );
            assert.equal(
              lancer_token_account_after_balance.value.amount,
              (// 5% from both sides
                /*(LANCER_FEE_THIRD_PARTY * amount) + */parseInt(lancer_token_account_before_balance.value.amount)
              ).toString()
            )
            assert.equal(
              third_party_tokens_account_after_balance.value.amount,
              (// 10% from lancer fee
                /*(THIRD_PARTY * amount) + */parseInt(third_party_tokens_account_before_balance.value.amount)
              ).toString()
            )

            // Check token account and data account are closed
            let closed_token_account = await provider.connection.getBalance(feature_token_account);
            let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
            assert.equal(0, parseInt(closed_data_account.toString()));
            assert.equal(0, parseInt(closed_token_account.toString()));

      })

      it ("test no lancer fees when admin creates bounty and calls approveRequest(Single Submitter)", async () => {
        let payer = await createKeypair(provider);
        let funder = await provider.publicKey;
         
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            payer,
            WSOL_ADDRESS,
            funder
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
        const create_FFA_ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          funder,
          program
        );
        let tx = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), []);
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
                  bytes: funder.toBase58(), // base58 encoded string
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
          funder,
          WSOL_ADDRESS,
          program
        );
    
          tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
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
            funder,
            submitter1.publicKey,
            program
          )
          
          tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), []); 
    
          // test approve request fails if there is no submitted request(ApproveRequest)  
          let [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            funder,
            program
          );    
          let [feature_token_account] = await findFeatureTokenAccount(
            acc.unixTimestamp,
            funder,
            WSOL_ADDRESS,
            program
          );
          let [program_authority] = await findProgramAuthority(program);
      
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
          const [lancer_token_program_authority] = await findLancerProgramAuthority(
            program
          );

          try{
            let approveRequestIx = await program.methods.approveRequest()// TODO remove this
            .accounts({
              creator: funder,
              submitter: submitter1.publicKey,
              payoutAccount: submitter1_wsol_account.address,
              featureDataAccount: feature_data_account,
              featureTokenAccount: feature_token_account,
              programAuthority: program_authority,
              lancerTokenProgramAuthority: lancer_token_program_authority,
              lancerDaoTokenAccount: lancer_dao_token_account,
              tokenProgram: TOKEN_PROGRAM_ID,
            }).signers([]).rpc();
          }catch(err){
            // console.log("err: ", err);
            assert.equal((err as AnchorError).error.errorMessage, "No Request Submitted yet")
          }
          // submit request for merging(SubmitRequest)
          const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            funder, 
            submitter1.publicKey,
            submitter1_wsol_account.address,
            program
        )
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
        // approve request(merge and send funds)(ApproveRequest)
          const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
          const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
          let approveRequestIx = await approveRequestInstruction(
            acc.unixTimestamp,
            funder,
            submitter1.publicKey,
            submitter1_wsol_account.address,
            WSOL_ADDRESS,
            program
          );
          tx = await provider.sendAndConfirm(new Transaction().add(approveRequestIx), [])
          console.log("approve Request tx = ", tx);
    
          const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
            const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
    
            assert.equal(
              submitter_token_account_after_balance.value.amount, 
              (// submitter gets 95% of bounty amount
                amount + parseInt(submitter_token_account_before_balance.value.amount)
              ).toString()
            );
            assert.equal(
              lancer_token_account_after_balance.value.amount,
              (// 5% from both sides
                /*(LANCER_FEE * amount)*/ + parseInt(lancer_token_account_before_balance.value.amount)
              ).toString()
            )

            // Check token account and data account are closed
            let closed_token_account = await provider.connection.getBalance(feature_token_account);
            let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
            assert.equal(0, parseInt(closed_data_account.toString()));
            assert.equal(0, parseInt(closed_token_account.toString()));

      })

      it ("test no third party/lancer fees when admin creates bounty and calls approveReQuest(Multiple Submitters)", async () => {
          // pays funds for pubkeys
          let payer = await createKeypair(provider);
          let funder = provider.publicKey;
          const submitter1 = await createKeypair(provider);
          const submitter2 = await createKeypair(provider);
          const submitter3 = await createKeypair(provider);
          const submitter4 = await createKeypair(provider);
          const submitter5 = await createKeypair(provider);
            
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

          const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter1,
            WSOL_ADDRESS,
            submitter1.publicKey
          );
          const submitter2_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter2,
            WSOL_ADDRESS,
            submitter2.publicKey
          );
          const submitter3_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter3,
            WSOL_ADDRESS,
            submitter3.publicKey
          );
          const submitter4_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter4,
            WSOL_ADDRESS,
            submitter4.publicKey
          );
          const submitter5_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter5,
            WSOL_ADDRESS,
            submitter5.publicKey
          );
          await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
          await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
      
          const ix = await createFeatureFundingAccountInstruction(
            WSOL_ADDRESS,
            provider.publicKey,
            program
          );
      
          let tx = await provider.sendAndConfirm(new Transaction().add(ix), []);
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
                    bytes: funder.toBase58(), // base58 encoded string
                  },
                },
              ],      
            }
          );
            let amount = 1 * LAMPORTS_PER_SOL;
          let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          let fund_feature_ix = await fundFeatureInstruction(
            amount,
            acc.unixTimestamp,
            funder,
            WSOL_ADDRESS,
            program
          );
      
            const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
      
      
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
      
          const [feature_token_account] = await findFeatureTokenAccount(
            acc.unixTimestamp,
            funder,
            WSOL_ADDRESS,
            program
          );
            const [lancer_dao_token_account] = await findLancerTokenAccount(
              WSOL_ADDRESS,
              program
            );
            const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
              program
            );
      
          const [program_authority] = await findProgramAuthority(program);
      
          
          const [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            funder,
            program
          );
      
          let approveSubmitter1Ix = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter1.publicKey,
            program
          )
          let approveSubmitter2Ix = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter2.publicKey,
            program
          )
          let approveSubmitter3Ix = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter3.publicKey,
            program
          )
          let approveSubmitter4Ix = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter4.publicKey,
            program
          )
          let approveSubmitter5Ix = await addApprovedSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter5.publicKey,
            program
          )
      
          tx = await provider.sendAndConfirm(
            new Transaction()
              .add(approveSubmitter1Ix)
              .add(approveSubmitter2Ix)
              .add(approveSubmitter3Ix)
              .add(approveSubmitter4Ix)
              .add(approveSubmitter5Ix), 
              []
          ); 
      
      
          try
          { 
            await program.methods.submitRequestMultiple()
            .accounts({
              creator: funder,
              submitter: submitter1.publicKey,
              featureDataAccount: feature_data_account,
            }).signers([submitter1]).rpc();
          }catch(err)
          {
            assert.equal((err as AnchorError).error.errorMessage, "This Instruction is used for only Multiple submitters.");
          }
      
          let enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            program
          );
          await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), []);
      
            let submitRequestMultipleIx1 = await submitRequestMultipleInstruction(
              acc.unixTimestamp,
              funder,
              submitter1.publicKey,
              program
            )
  
            let submitRequestMultipleIx2 = await submitRequestMultipleInstruction(
              acc.unixTimestamp,
              funder,
              submitter2.publicKey,
              program
            )
            let submitRequestMultipleIx3 = await submitRequestMultipleInstruction(
              acc.unixTimestamp,
              funder,
              submitter3.publicKey,
              program
            )
            let submitRequestMultipleIx4 = await submitRequestMultipleInstruction(
              acc.unixTimestamp,
              funder,
              submitter4.publicKey,
              program
            )
            let submitRequestMultipleIx5 = await submitRequestMultipleInstruction(
              acc.unixTimestamp,
              funder,
              submitter5.publicKey,
              program
            )

            await provider.sendAndConfirm(
              new Transaction()
                .add(submitRequestMultipleIx1)
                .add(submitRequestMultipleIx2)
                .add(submitRequestMultipleIx3)
                .add(submitRequestMultipleIx4)
                .add(submitRequestMultipleIx5), 
                [submitter1, submitter2, submitter3, submitter4, submitter5]
            )
            try {
              await program.methods.approveRequestMultiple()
                .accounts({
                  creator: funder,
                  featureDataAccount: feature_data_account,
                  featureTokenAccount: feature_token_account,
                  lancerDaoTokenAccount: lancer_dao_token_account,
                  lancerTokenProgramAuthority: lancer_token_program_authority,
                  programAuthority: program_authority,
                  tokenProgram: TOKEN_PROGRAM_ID
                }).signers([]).rpc();
            } catch (err) {
              assert.equal((err as AnchorError).error.errorMessage, "Share must be 100")
            }
            let submitter1_share = 50;
            let submitter2_share = 25;
            let submitter3_share = 15;
            let submitter4_share = 5;
            let submitter5_share = 5;
  
            let submitter1_share_ix = await setShareMultipleSubmittersInstruction(
              acc.unixTimestamp,
              funder,
              submitter1.publicKey,
              submitter1_share,
              program
            )
      
          let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter2.publicKey,
            submitter2_share,
            program
          )
          let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter3.publicKey,
            submitter3_share,
            program
          )
          let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter4.publicKey,
            submitter4_share,
            program
          )
          let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
            acc.unixTimestamp,
            funder,
            submitter5.publicKey,
            submitter5_share,
            program
          )
      
          tx = await provider.sendAndConfirm(
            new Transaction()
              .add(submitter1_share_ix)
              .add(submitter2_share_ix)
              .add(submitter3_share_ix)
              .add(submitter4_share_ix)
              .add(submitter5_share_ix), 
              []
          ); 
          
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
  
      
          let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
          let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
          let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
          let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
          let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
          let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      
          let transaction = await approveRequestMultipleTransaction(
            acc.unixTimestamp,
            funder,
            WSOL_ADDRESS,
            program,
            payer.publicKey
          )
          await provider.sendAndConfirm(transaction, [])
      
          let submitter1_after_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
          let submitter2_after_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
          let submitter3_after_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
          let submitter4_after_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
          let submitter5_after_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
          let lancer_after_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      
      
          assert.equal(
            parseInt(
              submitter1_before_token_balance.value.amount
            ) + (amount * submitter1_share / 100),
            parseInt(
              submitter1_after_token_balance.value.amount
            )
          );
          assert.equal(
            parseInt(
              submitter2_before_token_balance.value.amount
            ) + (amount * submitter2_share / 100),
            parseInt(
              submitter2_after_token_balance.value.amount
            )
          );
  
          assert.equal(
            parseInt(
              submitter3_before_token_balance.value.amount
            ) + (amount * submitter3_share / 100),
            parseInt(
              submitter3_after_token_balance.value.amount
            )
          );
          assert.equal(
            parseInt(
              submitter4_before_token_balance.value.amount
            ) + (amount * submitter4_share / 100),
            parseInt(
              submitter4_after_token_balance.value.amount
            )
          );
          assert.equal(
            parseInt(
              submitter5_before_token_balance.value.amount
            ) + (amount * submitter5_share / 100),
            parseInt(
              submitter5_after_token_balance.value.amount
            )
          );
          assert.equal(
            parseInt(
              lancer_before_token_balance.value.amount
            ),
            parseInt(
              lancer_after_token_balance.value.amount
            )
          );
        
        

      })
})