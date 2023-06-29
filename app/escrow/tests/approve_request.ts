import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAccount, createInitializeAccount3Instruction, createMint, createSyncNativeInstruction, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintToChecked, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { COMPLETER_FEE, LANCER_FEE, LANCER_FEE_MINUS_REFERRAL, MINT_DECIMALS, MONO_DEVNET, REFERRAL_FEE, WSOL_ADDRESS } from "../sdk/constants";
import { ComputeBudgetInstruction, ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findLancerCompanyTokens, findLancerCompleterTokens, findLancerProgramAuthority, findLancerTokenAccount, findProgramAuthority, findProgramMintAuthority, findReferralDataAccount } from "../sdk/pda";
import { addApprovedSubmittersInstruction, approveRequestInstruction, approveRequestMultipleTransaction, approveRequestWithReferralInstruction, cancelFeatureInstruction, createFeatureFundingAccountInstruction, createLancerTokenAccountInstruction, denyRequestInstruction, enableMultipleSubmittersInstruction, fundFeatureInstruction, removeApprovedSubmittersInstruction, setShareMultipleSubmittersInstruction, submitRequestInstruction, submitRequestMultipleInstruction, voteToCancelInstruction, withdrawTokensInstruction } from "../sdk/instructions";
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

//       it ("test referral fees ",async () => {
//         let creator = await createKeypair(provider);
    
         
//         const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
//             provider.connection,
//             creator,
//             WSOL_ADDRESS,
//             creator.publicKey
//         );
//         await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
    
//         const create_FFA_ix = await createFeatureFundingAccountInstruction(
//           WSOL_ADDRESS,
//           creator.publicKey,
//           program
//         );
//         let tx = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), [creator]);
//         console.log("createFFA(2nd test) transaction signature", tx);
    
//         // transfer 1 WSOL
//         let amount = 1 * LAMPORTS_PER_SOL;
//         const accounts = await provider.connection.getParsedProgramAccounts(
//           program.programId, 
//           {
//             filters: [
//               {
//                 dataSize: 381, // number of bytes
//               },
//               {
//                 memcmp: {
//                   offset: 8, // number of bytes
//                   bytes: creator.publicKey.toBase58(), // base58 encoded string
//                 },
//               },
//             ],      
//           }
//         );
    
//         let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
//         // Add funds to FFA token account(FundFeature)
//         let fund_feature_ix = await fundFeatureInstruction(
//           amount,
//           acc.unixTimestamp,
//           creator.publicKey,
//           WSOL_ADDRESS,
//           program
//         );
    
//       tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
//       console.log("fundFeature transaction signature", tx);

//       // add pubkey to list of accepted submitters(AddApprovedSubmitters)
//       const submitter1 = await createKeypair(provider);
        
//           const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
//             provider.connection,
//             submitter1,
//             WSOL_ADDRESS,
//             submitter1.publicKey
//         );
//           let addApproveSubmitterIx = await addApprovedSubmittersInstruction(
//             acc.unixTimestamp,
//             creator.publicKey,
//             submitter1.publicKey,
//             program
//           )
          
//           tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), [creator]); 
    
//           // test approve request fails if there is no submitted request(ApproveRequest)  
//           let [feature_data_account] = await findFeatureAccount(
//             acc.unixTimestamp,
//             creator.publicKey,
//             program
//           );    
//           let [feature_token_account] = await findFeatureTokenAccount(
//             acc.unixTimestamp,
//             creator.publicKey,
//             WSOL_ADDRESS,
//             program
//           );
//           let [program_authority] = await findProgramAuthority(program);
      
//           const [lancer_dao_token_account] = await findLancerTokenAccount(
//             WSOL_ADDRESS,
//             program
//           );
//           let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
//           const [lancer_token_program_authority] = await findLancerProgramAuthority(
//             program
//           );
      
//           // submit request for merging(SubmitRequest)
//           const submitRequestIx = await submitRequestInstruction(
//             acc.unixTimestamp, 
//             creator.publicKey, 
//             submitter1.publicKey,
//             submitter1_wsol_account.address,
//             program
//         )
//         acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
//         tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])

//         // approve request(merge and send funds)(ApproveRequest)
//           const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
//           const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)

//           acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

//           let approveRequestWithReferralIx = await approveRequestWithReferralInstruction(
//             acc.unixTimestamp,
//             creator.publicKey,
//             submitter1.publicKey,
//             submitter1_wsol_account.address,
//             WSOL_ADDRESS,
//             program
//           );
//           tx = await provider.sendAndConfirm(new Transaction().add(approveRequestWithReferralIx), [creator])
//           console.log("approve Request with Referral tx = ", tx);
// // TODO - Referral tests
//           const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
//          const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)

//             assert.equal(
//               submitter_token_account_after_balance.value.amount, 
//               (// submitter gets 95% of bounty amount
//                 (COMPLETER_FEE * amount) + parseInt(submitter_token_account_before_balance.value.amount)
//               ).toString()
//             );
//             assert.equal(
//               lancer_token_account_after_balance.value.amount,
//               (// 5% from both sides
//                 (LANCER_FEE_MINUS_REFERRAL * amount) + parseInt(lancer_token_account_before_balance.value.amount)
//               ).toString()
//             )

//             // Check token account and data account are closed
//             let closed_token_account = await provider.connection.getBalance(feature_token_account);
//             let closed_data_account = await provider.connection.getBalance(feature_data_account);
       
//             assert.equal(0, parseInt(closed_data_account.toString()));
//             assert.equal(0, parseInt(closed_token_account.toString()));

//       })
    
      it ("approve ReQuest for Multiple Submitters", async () => {
        let creator = await createKeypair(provider);
        let mint_authority = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);

        const special_mint = await createMint(
          provider.connection,
          mint_authority,
          mint_authority.publicKey,
          mint_authority.publicKey,
          MINT_DECIMALS,
        ); 

        const create_lancer_token_account_ix = await createLancerTokenAccountInstruction(
          special_mint,
          program
        );
        await provider.sendAndConfirm(
          new Transaction().add(create_lancer_token_account_ix), 
          []
        );

        const creator_special_mint_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            special_mint,
            creator.publicKey
        );

        const special_mint_airdrop = await mintToChecked(
          provider.connection,
          mint_authority,
          special_mint,
          creator_special_mint_account.address,
          mint_authority,
          10 * WSOL_AMOUNT,
          MINT_DECIMALS
        );    

        const submitter1_special_mint_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter1,
          special_mint,
          submitter1.publicKey
        );
        const submitter2_special_mint_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter2,
          special_mint,
          submitter2.publicKey
        );
        const submitter3_special_mint_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter3,
          special_mint,
          submitter3.publicKey
        );
        const submitter4_special_mint_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter4,
          special_mint,
          submitter4.publicKey
        );
        const submitter5_special_mint_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter5,
          special_mint,
          submitter5.publicKey
        );


        const ix = await createFeatureFundingAccountInstruction(
          special_mint,
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
          special_mint,
          program
        );

          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), [creator]);
    
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          creator.publicKey,
          special_mint,
          program
        );
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            special_mint,
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

    
        let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address);
        let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_special_mint_account.address);
        let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_special_mint_account.address);
        let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_special_mint_account.address);
        let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_special_mint_account.address);
        let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);

        let [referral_data_account] = await findReferralDataAccount(
          creator.publicKey,
          feature_data_account,
          program,
        );
        const is_referrer = await provider.connection.getAccountInfo(referral_data_account);
        let transaction;
        if (is_referrer == null) {
          transaction = await approveRequestMultipleTransaction(
            acc.unixTimestamp,
            creator.publicKey,
            special_mint,
            false,
            program
          )
            
        } else {
          transaction = await approveRequestMultipleTransaction(
            acc.unixTimestamp,
            creator.publicKey,
            special_mint,
            true,
            program
          )            
        }

        await provider.sendAndConfirm(transaction, [creator])

        let submitter1_after_token_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address);
        let submitter2_after_token_balance = await provider.connection.getTokenAccountBalance(submitter2_special_mint_account.address);
        let submitter3_after_token_balance = await provider.connection.getTokenAccountBalance(submitter3_special_mint_account.address);
        let submitter4_after_token_balance = await provider.connection.getTokenAccountBalance(submitter4_special_mint_account.address);
        let submitter5_after_token_balance = await provider.connection.getTokenAccountBalance(submitter5_special_mint_account.address);
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

      it ("test no lancer fees when admin creates bounty and calls approveRequestMultiple", async () => {
        // pays funds for pubkeys
        let mint_authority = await createKeypair(provider);
        let funder = provider.publicKey;
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);
         
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            mint_authority,
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

        // let tx = await provider.sendAndConfirm(new Transaction().add(ix), []);
          let amount = 1 * LAMPORTS_PER_SOL;
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          timestamp,
          funder,
          WSOL_ADDRESS,
          program
        );

          const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
    
          const [lancer_dao_token_account] = await findLancerTokenAccount(
            WSOL_ADDRESS,
            program
          );
          const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
            program
          );
        
        let approveSubmitter1Ix = await addApprovedSubmittersInstruction(
          timestamp,
          funder,
          submitter1.publicKey,
          program
        )
        let approveSubmitter2Ix = await addApprovedSubmittersInstruction(
          timestamp,
          funder,
          submitter2.publicKey,
          program
        )
        let approveSubmitter3Ix = await addApprovedSubmittersInstruction(
          timestamp,
          funder,
          submitter3.publicKey,
          program
        )
        let approveSubmitter4Ix = await addApprovedSubmittersInstruction(
          timestamp,
          funder,
          submitter4.publicKey,
          program
        )
        let approveSubmitter5Ix = await addApprovedSubmittersInstruction(
          timestamp,
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
          timestamp,
          funder,
          program
        );
        await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), []);
    
          let submitRequestMultipleIx1 = await submitRequestMultipleInstruction(
            timestamp,
            funder,
            submitter1.publicKey,
            program
          )

          let submitRequestMultipleIx2 = await submitRequestMultipleInstruction(
            timestamp,
            funder,
            submitter2.publicKey,
            program
          )
          let submitRequestMultipleIx3 = await submitRequestMultipleInstruction(
            timestamp,
            funder,
            submitter3.publicKey,
            program
          )
          let submitRequestMultipleIx4 = await submitRequestMultipleInstruction(
            timestamp,
            funder,
            submitter4.publicKey,
            program
          )
          let submitRequestMultipleIx5 = await submitRequestMultipleInstruction(
            timestamp,
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
            timestamp,
            funder,
            submitter1.publicKey,
            submitter1_share,
            program
          )
    
        let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
          timestamp,
          funder,
          submitter2.publicKey,
          submitter2_share,
          program
        )
        let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
          timestamp,
          funder,
          submitter3.publicKey,
          submitter3_share,
          program
        )
        let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
          timestamp,
          funder,
          submitter4.publicKey,
          submitter4_share,
          program
        )
        let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
          timestamp,
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
        
  
        let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
        let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
        let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
        let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
        let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
        let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
    
        let transaction = await approveRequestMultipleTransaction(
          timestamp,
          funder,
          WSOL_ADDRESS,
          false,
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

//       it ("test referral does not collect fees when admin creates bounty and calls approveRequestWithReferral", async () => {
//         let mint_authority = await createKeypair(provider);    
//         let funder = await provider.publicKey;

//         const timestamp = Date.now().toString();
//         const [feature_data_account] = await findFeatureAccount(
//           timestamp, 
//           funder, 
//           program
//       );
//       const [feature_token_account] = await findFeatureTokenAccount(
//           timestamp, 
//           funder,
//           special_mint, 
//           program,
//       );
//       const [program_authority] = await findProgramAuthority(
//         program,
//     );

//         const special_mint = await createMint(
//           provider.connection,
//           mint_authority,
//           mint_authority.publicKey,
//           mint_authority.publicKey,
//           MINT_DECIMALS,
//         ); 
//         let tx = await program.methods.createFeatureFundingAccount(timestamp).
//         accounts({
//             creator: funder,
//             fundsMint: special_mint,
//             featureDataAccount: feature_data_account,
//             featureTokenAccount: feature_token_account,
//             programAuthority: program_authority,
//             tokenProgram: TOKEN_PROGRAM_ID,
//             rent: SYSVAR_RENT_PUBKEY,
//             associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//             systemProgram: SystemProgram.programId,
//         })
//         .signers([]).rpc();


//         const create_lancer_token_account_ix = await createLancerTokenAccountInstruction(
//           special_mint,
//           program
//         );
//         await provider.sendAndConfirm(
//           new Transaction().add(create_lancer_token_account_ix), 
//           []
//         );

//         const creator_special_mint_account = await getOrCreateAssociatedTokenAccount(
//             provider.connection,
//             mint_authority,
//             special_mint,
//             funder
//         );

//         const special_mint_airdrop = await mintToChecked(
//           provider.connection,
//           mint_authority,
//           special_mint,
//           creator_special_mint_account.address,
//           mint_authority,
//           10 * WSOL_AMOUNT,
//           MINT_DECIMALS
//         );    


//         console.log("createFFA(2nd test) transaction signature", tx);
    
//         // transfer 1 WSOL
//         let amount = 1 * LAMPORTS_PER_SOL;
//         const accounts = await provider.connection.getParsedProgramAccounts(
//           program.programId, 
//           {
//             filters: [
//               {
//                 dataSize: 381, // number of bytes
//               },
//               {
//                 memcmp: {
//                   offset: 8, // number of bytes
//                   bytes: funder.toBase58(), // base58 encoded string
//                 },
//               },
//             ],      
//           }
//         );
    
//         let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

        
//         const [lancer_dao_token_account] = await findLancerTokenAccount(
//           special_mint,
//           program
//         );

 
//         // Add funds to FFA token account(FundFeature)
//         let fund_feature_ix = await fundFeatureInstruction(
//           amount,
//           timestamp,
//           funder,
//           special_mint,
//           program
//         );

//           tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
//           console.log("fundFeature transaction signature", tx);
   
//           // add pubkey to list of accepted submitters(AddApprovedSubmitters)
//           const submitter1 = await createKeypair(provider);

//           const submitter1_special_mint_account = await getOrCreateAssociatedTokenAccount(
//             provider.connection,
//             submitter1,
//             special_mint,
//             submitter1.publicKey
//         );
//           let addApproveSubmitterIx = await addApprovedSubmittersInstruction(
//             timestamp,
//             funder,
//             submitter1.publicKey,
//             program
//           )

//           tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), []); 
    
//           // test approve request fails if there is no submitted request(ApproveRequest)  
//           let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
//           const [lancer_token_program_authority] = await findLancerProgramAuthority(
//             program
//           );

//           // submit request for merging(SubmitRequest)
//           const submitRequestIx = await submitRequestInstruction(
//             timestamp, 
//             funder, 
//             submitter1.publicKey,
//             submitter1_special_mint_account.address,
//             program
//         )
//         tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
    
//         // approve request(merge and send funds)(ApproveRequest)
//           const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address)
//           const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
          
//           let approveRequestWithReferralIx = await approveRequestWithReferralInstruction(
//             timestamp,
//             funder,
//             submitter1.publicKey,
//             submitter1_special_mint_account.address,
//             special_mint,
//             program
//           );
//           tx = await provider.sendAndConfirm(new Transaction().add(approveRequestWithReferralIx), [])

//           console.log("approve Request Multiple tx = ", tx);
// // TODO - Add Referral tests
//           const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address)
//             const lancer_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)

//             assert.equal(
//               submitter_token_account_after_balance.value.amount, 
//               (// submitter gets 95% of bounty amount
//                 amount + parseInt(submitter_token_account_before_balance.value.amount)
//               ).toString()
//             );
//             assert.equal(
//               lancer_token_account_after_balance.value.amount,
//               (// 5% from both sides
//                 /*(LANCER_FEE(Referral) * amount) + */parseInt(lancer_token_account_before_balance.value.amount)
//               ).toString()
//             )

//             // Check token account and data account are closed
//             let closed_token_account = await provider.connection.getBalance(feature_token_account);
//             let closed_data_account = await provider.connection.getBalance(feature_data_account);

//             assert.equal(0, parseInt(closed_data_account.toString()));
//             assert.equal(0, parseInt(closed_token_account.toString()));

//       })

      it ("test no lancer fees when admin creates bounty and calls approveRequest(Single Submitter)", async () => {
        let mint_authority = await createKeypair(provider);
        let funder = await provider.publicKey;
        const special_mint = await createMint(
          provider.connection,
          mint_authority,
          mint_authority.publicKey,
          mint_authority.publicKey,
          MINT_DECIMALS,
        ); 

        const create_lancer_token_account_ix = await createLancerTokenAccountInstruction(
          special_mint,
          program
        );
        await provider.sendAndConfirm(
          new Transaction().add(create_lancer_token_account_ix), 
          []
        );

        const creator_special_mint_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            mint_authority,
            special_mint,
            funder
        );

        const special_mint_airdrop = await mintToChecked(
          provider.connection,
          mint_authority,
          special_mint,
          creator_special_mint_account.address,
          mint_authority,
          10 * WSOL_AMOUNT,
          MINT_DECIMALS
        );    
        const timestamp = Date.now().toString();
        const [feature_data_account] = await findFeatureAccount(
          timestamp, 
          funder, 
          program
      );
      const [feature_token_account] = await findFeatureTokenAccount(
          timestamp, 
          funder,
          special_mint, 
          program,
      );
      const [program_authority] = await findProgramAuthority(
        program,
    );
        let tx = await program.methods.createFeatureFundingAccount(timestamp).
        accounts({
            creator: funder,
            fundsMint: special_mint,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
            associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .signers([]).rpc();
      // let tx = await provider.sendAndConfirm(new Transaction().add(create_FFA_ix), []);
        console.log("createFFA(2nd test) transaction signature", tx);

        // transfer 1 WSOL
        let amount = 1 * LAMPORTS_PER_SOL;
    
        // Add funds to FFA token account(FundFeature)
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          timestamp,
          funder,
          special_mint,
          program
        );

        const [lancer_dao_token_account] = await findLancerTokenAccount(
          special_mint,
          program
        );

          tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
          console.log("fundFeature transaction signature", tx);

          // add pubkey to list of accepted submitters(AddApprovedSubmitters)
          const submitter1 = await createKeypair(provider);

          const submitter1_special_mint_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            submitter1,
            special_mint,
            submitter1.publicKey
        );
          let addApproveSubmitterIx = await addApprovedSubmittersInstruction(
            timestamp,
            funder,
            submitter1.publicKey,
            program
          )
          
          tx = await provider.sendAndConfirm(new Transaction().add(addApproveSubmitterIx), []); 

          // test approve request fails if there is no submitted request(ApproveRequest)  
          let info = await provider.connection.getAccountInfo(lancer_dao_token_account);
    
          const [lancer_token_program_authority] = await findLancerProgramAuthority(
            program
          );

          try{
            let approveRequestIx = await program.methods.approveRequest()// TODO remove this
            .accounts({
              creator: funder,
              submitter: submitter1.publicKey,
              payoutAccount: submitter1_special_mint_account.address,
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
            timestamp, 
            funder, 
            submitter1.publicKey,
            submitter1_special_mint_account.address,
            program
        )
        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])
        // approve request(merge and send funds)(ApproveRequest)
          const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address)
          const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)
    
          let approveRequestIx = await approveRequestInstruction(
            timestamp,
            funder,
            submitter1.publicKey,
            submitter1_special_mint_account.address,
            special_mint,
            program
          );
          tx = await provider.sendAndConfirm(new Transaction().add(approveRequestIx), [])
          console.log("approve Request tx = ", tx);
    
          const submitter_token_account_after_balance = await provider.connection.getTokenAccountBalance(submitter1_special_mint_account.address)
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

      // it ("test referral/lancer fees when admin creates bounty and calls approveReQuestMultipleWithReferaal", async () => {
      //     // pays funds for pubkeys
      //     let payer = await createKeypair(provider);
      //     let funder = provider.publicKey;
      //     const submitter1 = await createKeypair(provider);
      //     const submitter2 = await createKeypair(provider);
      //     const submitter3 = await createKeypair(provider);
      //     const submitter4 = await createKeypair(provider);
      //     const submitter5 = await createKeypair(provider);
            
      //     const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
      //         provider.connection,
      //         payer,
      //         WSOL_ADDRESS,
      //         funder
      //     );
      //     const payer_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       payer,
      //       WSOL_ADDRESS,
      //       payer.publicKey
      //   );

      //     const submitter1_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       submitter1,
      //       WSOL_ADDRESS,
      //       submitter1.publicKey
      //     );
      //     const submitter2_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       submitter2,
      //       WSOL_ADDRESS,
      //       submitter2.publicKey
      //     );
      //     const submitter3_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       submitter3,
      //       WSOL_ADDRESS,
      //       submitter3.publicKey
      //     );
      //     const submitter4_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       submitter4,
      //       WSOL_ADDRESS,
      //       submitter4.publicKey
      //     );
      //     const submitter5_wsol_account = await getOrCreateAssociatedTokenAccount(
      //       provider.connection,
      //       submitter5,
      //       WSOL_ADDRESS,
      //       submitter5.publicKey
      //     );
      //     await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
      //     await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);
      
      //     const timestamp = Date.now().toString();
      //     const [feature_data_account] = await findFeatureAccount(
      //       timestamp, 
      //       funder, 
      //       program
      //   );
      //   const [feature_token_account] = await findFeatureTokenAccount(
      //       timestamp, 
      //       funder,
      //       WSOL_ADDRESS, 
      //       program,
      //   );
      //   const [program_authority] = await findProgramAuthority(
      //     program,
      // );
      //     let tx = await program.methods.createFeatureFundingAccount(timestamp).
      //     accounts({
      //         creator: funder,
      //         fundsMint: WSOL_ADDRESS,
      //         featureDataAccount: feature_data_account,
      //         featureTokenAccount: feature_token_account,
      //         programAuthority: program_authority,
      //         tokenProgram: TOKEN_PROGRAM_ID,
      //         rent: SYSVAR_RENT_PUBKEY,
      //         associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      //         systemProgram: SystemProgram.programId,
      //     })
      //     .signers([]).rpc();
  
      //       let amount = 1 * LAMPORTS_PER_SOL;
      //     let fund_feature_ix = await fundFeatureInstruction(
      //       amount,
      //       timestamp,
      //       funder,
      //       WSOL_ADDRESS,
      //       program
      //     );
      
      //       const tx2 = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix), []);
      
      //       const [lancer_dao_token_account] = await findLancerTokenAccount(
      //         WSOL_ADDRESS,
      //         program
      //       );
      //       const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
      //         program
      //       );
            
      //     let approveSubmitter1Ix = await addApprovedSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter1.publicKey,
      //       program
      //     )
      //     let approveSubmitter2Ix = await addApprovedSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter2.publicKey,
      //       program
      //     )
      //     let approveSubmitter3Ix = await addApprovedSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter3.publicKey,
      //       program
      //     )
      //     let approveSubmitter4Ix = await addApprovedSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter4.publicKey,
      //       program
      //     )
      //     let approveSubmitter5Ix = await addApprovedSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter5.publicKey,
      //       program
      //     )
      
      //     tx = await provider.sendAndConfirm(
      //       new Transaction()
      //         .add(approveSubmitter1Ix)
      //         .add(approveSubmitter2Ix)
      //         .add(approveSubmitter3Ix)
      //         .add(approveSubmitter4Ix)
      //         .add(approveSubmitter5Ix), 
      //         []
      //     ); 
      
      
      //     try
      //     { 
      //       await program.methods.submitRequestMultiple()
      //       .accounts({
      //         creator: funder,
      //         submitter: submitter1.publicKey,
      //         featureDataAccount: feature_data_account,
      //       }).signers([submitter1]).rpc();
      //     }catch(err)
      //     {
      //       assert.equal((err as AnchorError).error.errorMessage, "This Instruction is used for only Multiple submitters.");
      //     }
      
      //     let enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       program
      //     );
      //     await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), []);
      
      //       let submitRequestMultipleIx1 = await submitRequestMultipleInstruction(
      //         timestamp,
      //         funder,
      //         submitter1.publicKey,
      //         program
      //       )
  
      //       let submitRequestMultipleIx2 = await submitRequestMultipleInstruction(
      //         timestamp,
      //         funder,
      //         submitter2.publicKey,
      //         program
      //       )
      //       let submitRequestMultipleIx3 = await submitRequestMultipleInstruction(
      //         timestamp,
      //         funder,
      //         submitter3.publicKey,
      //         program
      //       )
      //       let submitRequestMultipleIx4 = await submitRequestMultipleInstruction(
      //         timestamp,
      //         funder,
      //         submitter4.publicKey,
      //         program
      //       )
      //       let submitRequestMultipleIx5 = await submitRequestMultipleInstruction(
      //         timestamp,
      //         funder,
      //         submitter5.publicKey,
      //         program
      //       )

      //       await provider.sendAndConfirm(
      //         new Transaction()
      //           .add(submitRequestMultipleIx1)
      //           .add(submitRequestMultipleIx2)
      //           .add(submitRequestMultipleIx3)
      //           .add(submitRequestMultipleIx4)
      //           .add(submitRequestMultipleIx5), 
      //           [submitter1, submitter2, submitter3, submitter4, submitter5]
      //       )
      //       try {
      //         await program.methods.approveRequestMultiple()
      //           .accounts({
      //             creator: funder,
      //             featureDataAccount: feature_data_account,
      //             featureTokenAccount: feature_token_account,
      //             lancerDaoTokenAccount: lancer_dao_token_account,
      //             lancerTokenProgramAuthority: lancer_token_program_authority,
      //             programAuthority: program_authority,
      //             tokenProgram: TOKEN_PROGRAM_ID
      //           }).signers([]).rpc();
      //       } catch (err) {
      //         assert.equal((err as AnchorError).error.errorMessage, "Share must be 100")
      //       }
      //       let submitter1_share = 50;
      //       let submitter2_share = 25;
      //       let submitter3_share = 15;
      //       let submitter4_share = 5;
      //       let submitter5_share = 5;
  
      //       let submitter1_share_ix = await setShareMultipleSubmittersInstruction(
      //         timestamp,
      //         funder,
      //         submitter1.publicKey,
      //         submitter1_share,
      //         program
      //       )
      
      //     let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter2.publicKey,
      //       submitter2_share,
      //       program
      //     )
      //     let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter3.publicKey,
      //       submitter3_share,
      //       program
      //     )
      //     let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter4.publicKey,
      //       submitter4_share,
      //       program
      //     )
      //     let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
      //       timestamp,
      //       funder,
      //       submitter5.publicKey,
      //       submitter5_share,
      //       program
      //     )
      
      //     tx = await provider.sendAndConfirm(
      //       new Transaction()
      //         .add(submitter1_share_ix)
      //         .add(submitter2_share_ix)
      //         .add(submitter3_share_ix)
      //         .add(submitter4_share_ix)
      //         .add(submitter5_share_ix), 
      //         []
      //     ); 
      
      //     let submitter1_before_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
      //     let submitter2_before_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
      //     let submitter3_before_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
      //     let submitter4_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
      //     let submitter5_before_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
      //     let lancer_before_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      
      //     let transaction = await approveRequestMultipleTransaction(
      //       timestamp,
      //       funder,
      //       WSOL_ADDRESS,
      //       true,
      //       program,
      //     )
      //     await provider.sendAndConfirm(transaction, [])
      
      //     let submitter1_after_token_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address);
      //     let submitter2_after_token_balance = await provider.connection.getTokenAccountBalance(submitter2_wsol_account.address);
      //     let submitter3_after_token_balance = await provider.connection.getTokenAccountBalance(submitter3_wsol_account.address);
      //     let submitter4_after_token_balance = await provider.connection.getTokenAccountBalance(submitter4_wsol_account.address);
      //     let submitter5_after_token_balance = await provider.connection.getTokenAccountBalance(submitter5_wsol_account.address);
      //     let lancer_after_token_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      
      
      //     assert.equal(
      //       parseInt(
      //         submitter1_before_token_balance.value.amount
      //       ) + (amount * submitter1_share / 100),
      //       parseInt(
      //         submitter1_after_token_balance.value.amount
      //       )
      //     );
      //     assert.equal(
      //       parseInt(
      //         submitter2_before_token_balance.value.amount
      //       ) + (amount * submitter2_share / 100),
      //       parseInt(
      //         submitter2_after_token_balance.value.amount
      //       )
      //     );
  
      //     assert.equal(
      //       parseInt(
      //         submitter3_before_token_balance.value.amount
      //       ) + (amount * submitter3_share / 100),
      //       parseInt(
      //         submitter3_after_token_balance.value.amount
      //       )
      //     );
      //     assert.equal(
      //       parseInt(
      //         submitter4_before_token_balance.value.amount
      //       ) + (amount * submitter4_share / 100),
      //       parseInt(
      //         submitter4_after_token_balance.value.amount
      //       )
      //     );
      //     assert.equal(
      //       parseInt(
      //         submitter5_before_token_balance.value.amount
      //       ) + (amount * submitter5_share / 100),
      //       parseInt(
      //         submitter5_after_token_balance.value.amount
      //       )
      //     );
      //     assert.equal(
      //       parseInt(
      //         lancer_before_token_balance.value.amount
      //       ),
      //       parseInt(
      //         lancer_after_token_balance.value.amount
      //       )
      //     );
        
        

      // })
})