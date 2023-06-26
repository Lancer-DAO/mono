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

describe("approve submitter tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;

    it ("test approveSubmitter", async () => {
        // Add your test here.
        let creator = await createKeypair(provider);
         ;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );

        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

        
        const ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          creator.publicKey,
          program
        );
    
        const [program_authority] = await findProgramAuthority(program);
    
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

        const acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );

        const submitter1 = await createKeypair(provider);
        let approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter1.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 

        let data_account = await program.account.featureDataAccount.fetch(feature_data_account);
        //Testing no of submitters
        let no_of_submitters = 1;
        assert.equal(no_of_submitters, data_account.noOfSubmitters);
        assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
        assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[1].toString());
        assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[2].toString());

        // Adding 2nd submitter
        const submitter2 = await createKeypair(provider);
        approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter2.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 
        data_account = await program.account.featureDataAccount.fetch(feature_data_account);
        
        no_of_submitters += 1;
        assert.equal(no_of_submitters, data_account.noOfSubmitters);
        assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
        assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
        assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[2].toString());

        // Adding 3rd submitter
        const submitter3 = await createKeypair(provider);
        approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter3.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 
        data_account = await program.account.featureDataAccount.fetch(feature_data_account);
        
        no_of_submitters += 1;
        assert.equal(no_of_submitters, data_account.noOfSubmitters);
        assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
        assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
        assert.equal(submitter3.publicKey.toString(), data_account.approvedSubmitters[2].toString());

        // Adding 4th submitter
        const submitter4 = await createKeypair(provider);
        approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter4.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 
        data_account = await program.account.featureDataAccount.fetch(feature_data_account);
        
        no_of_submitters += 1;
        assert.equal(no_of_submitters, data_account.noOfSubmitters);
        assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
        assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
        assert.equal(submitter3.publicKey.toString(), data_account.approvedSubmitters[2].toString());
        assert.equal(submitter4.publicKey.toString(), data_account.approvedSubmitters[3].toString());
                // Adding 5th submitter
        const submitter5 = await createKeypair(provider);
        approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter5.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 
        data_account = await program.account.featureDataAccount.fetch(feature_data_account);
        
        no_of_submitters += 1;
        assert.equal(no_of_submitters, data_account.noOfSubmitters);
        assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
        assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
        assert.equal(submitter3.publicKey.toString(), data_account.approvedSubmitters[2].toString());
        assert.equal(submitter4.publicKey.toString(), data_account.approvedSubmitters[3].toString());
        assert.equal(submitter5.publicKey.toString(), data_account.approvedSubmitters[4].toString());
      
      // Adding 6th Submitter(Should fail)
      try{
        const submitter6 = await createKeypair(provider)
        await program.methods.addApprovedSubmitters()
                .accounts({
                  creator: creator.publicKey,
                  submitter: submitter6.publicKey,
                  featureDataAccount: feature_data_account
                }).signers([creator]).rpc();  
        
      }catch(err){
        assert.equal((err as AnchorError).error.errorMessage, "Max Number of Approved Submitters already reached")
      }
        
    })

    it ("removed approved submitters", async () => {
        // Add your test here.
        let creator = await createKeypair(provider);
         ;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

        const ix = await createFeatureFundingAccountInstruction(
          WSOL_ADDRESS,
          creator.publicKey,
          program
        );
        const [program_authority] = await findProgramAuthority(program);
        let tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
        console.log("createFFA transaction signature", tx);

        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);

        let accounts = await provider.connection.getParsedProgramAccounts(
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
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
        try {
          await program.methods.removeApprovedSubmitters()
            .accounts({
              creator: creator.publicKey,
              submitter: submitter1.publicKey,
              featureDataAccount: feature_data_account
            }).signers([creator]).rpc()
        } catch (err) {
            assert.equal((err as AnchorError).error.errorMessage, "Min Number of Approved Submitters already reached");
        }
        accounts = await provider.connection.getParsedProgramAccounts(
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
        let approveSubmitterIx1 = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter1.publicKey,
          program
        )
        let approveSubmitterIx2 = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter2.publicKey,
          program
        )
        let approveSubmitterIx3 = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter3.publicKey,
          program
        )

        tx = await provider.sendAndConfirm(
          new Transaction().add(approveSubmitterIx1).add(approveSubmitterIx2).add(approveSubmitterIx3), 
          [creator]
        ); 
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

        assert.equal(acc.approvedSubmitters[0].toString(), submitter1.publicKey.toString());
        assert.equal(acc.approvedSubmitters[1].toString(), submitter2.publicKey.toString());
        assert.equal(acc.approvedSubmitters[2].toString(), submitter3.publicKey.toString());
    
          let removeApprovedSubmittersIx = await removeApprovedSubmittersInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            program
          );
          tx = await provider.sendAndConfirm(
            new Transaction().add(removeApprovedSubmittersIx), 
            [creator]
          );
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), PublicKey.default.toString());

          await program.methods.addApprovedSubmitters()
            .accounts({
              creator: creator.publicKey,
              submitter: submitter1.publicKey,
              featureDataAccount: feature_data_account,
            }).signers([creator]).rpc();
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), submitter1.publicKey.toString());
    
          removeApprovedSubmittersIx = await removeApprovedSubmittersInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter3.publicKey,
            program
          );
          tx = await provider.sendAndConfirm(
            new Transaction().add(removeApprovedSubmittersIx), 
            [creator]
          );          
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter1.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), PublicKey.default.toString());

          await program.methods.addApprovedSubmitters()
          .accounts({
            creator: creator.publicKey,
            submitter: submitter3.publicKey,
            featureDataAccount: feature_data_account,
          }).signers([creator]).rpc();

          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter1.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), submitter3.publicKey.toString());

          removeApprovedSubmittersIx = await removeApprovedSubmittersInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter3.publicKey,
            program
          );
          tx = await provider.sendAndConfirm(
            new Transaction().add(removeApprovedSubmittersIx), 
            [creator]
          );
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter1.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), PublicKey.default.toString());

    })

    it ("prevent adding the same submitter Pubkey in the list twice", async () => {
      let creator = await createKeypair(provider);
      ;
     const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
         provider.connection,
         creator,
         WSOL_ADDRESS,
         creator.publicKey
     );

     await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

     
     const ix = await createFeatureFundingAccountInstruction(
       WSOL_ADDRESS,
       creator.publicKey,
       program
     );
 
     const [program_authority] = await findProgramAuthority(program);
 
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

     const acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

     const [feature_data_account] = await findFeatureAccount(
       acc.unixTimestamp,
       creator.publicKey,
       program
     );

     const submitter1 = await createKeypair(provider);
     let approveSubmitterIx = await addApprovedSubmittersInstruction(
       acc.unixTimestamp,
       creator.publicKey,
       submitter1.publicKey,
       program
     )
     
     tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 

     let data_account = await program.account.featureDataAccount.fetch(feature_data_account);
     //Testing no of submitters
     let no_of_submitters = 1;
     assert.equal(no_of_submitters, data_account.noOfSubmitters);
     assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
     assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[1].toString());
     assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[2].toString());

     // Adding 2nd submitter
     const submitter2 = await createKeypair(provider);
     approveSubmitterIx = await addApprovedSubmittersInstruction(
       acc.unixTimestamp,
       creator.publicKey,
       submitter2.publicKey,
       program
     )
     
     tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 
     data_account = await program.account.featureDataAccount.fetch(feature_data_account);
     
     no_of_submitters += 1;
     assert.equal(no_of_submitters, data_account.noOfSubmitters);
     assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
     assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
     assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[2].toString());

    // Adding 3rd submitter that is already present(should fail)
    try {
      await program.methods.addApprovedSubmitters()
        .accounts({
          creator: creator.publicKey,
          submitter: submitter1.publicKey,
          featureDataAccount: feature_data_account,
        }).signers([creator]).rpc();
    } catch (err) {
      assert.equal((err as AnchorError).error.errorMessage, "Submitter Key Already Present in ApprovedSubmitters List")
    }

    data_account = await program.account.featureDataAccount.fetch(feature_data_account);
    
    assert.equal(no_of_submitters, data_account.noOfSubmitters);
    assert.equal(submitter1.publicKey.toString(), data_account.approvedSubmitters[0].toString());
    assert.equal(submitter2.publicKey.toString(), data_account.approvedSubmitters[1].toString());
    assert.equal(PublicKey.default.toString(), data_account.approvedSubmitters[2].toString());

    })
      
})