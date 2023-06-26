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

describe("cancel feature tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;


    it ("test voteToCancel",async () => {
        // Add your test here.
        let creator = await createKeypair(provider);
        const submitter = await createKeypair(provider);
         ;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        const submitter_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter,
          WSOL_ADDRESS,
          submitter.publicKey
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
    
        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
    
        
        let approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 

        // Should be false already
        assert.equal(acc.requestSubmitted, false);
        const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            creator.publicKey, 
            submitter.publicKey,
            submitter_wsol_account.address,
            program
        )

        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter])
        
        // creator cancels feature(VoteToCancel)
        let voteToCancelIx = await voteToCancelInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          creator.publicKey,
          true,
          program
        );
        tx = await provider.sendAndConfirm(new Transaction().add(voteToCancelIx), [creator]);

        acc = await program.account.featureDataAccount.fetch(feature_data_account);

        assert.equal(acc.funderCancel, true);
        assert.equal(acc.payoutCancel, false);
        assert.equal(acc.requestSubmitted, true);

        console.log("voteToCancel Tx(1) = ", tx);        

        // submitter cancels feature(VoteToCancel)
        voteToCancelIx = await voteToCancelInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter.publicKey,
          true,
          program
        );
        tx = await provider.sendAndConfirm(new Transaction().add(voteToCancelIx), [submitter]);

        console.log("voteToCancel Tx(2) = ", tx);
        acc = await program.account.featureDataAccount.fetch(feature_data_account);

        assert.equal(acc.funderCancel, true);
        assert.equal(acc.payoutCancel, true);
        assert.equal(acc.payoutAccount.toString(), PublicKey.default.toString());
        assert.equal(acc.currentSubmitter.toString(), PublicKey.default.toString());
        assert.equal(acc.requestSubmitted, false);

    })
// TODO - Add to tests.yaml
    it ("test cancelFeature", async () => {
        // Add your test here.
        let creator = await createKeypair(provider);
        const submitter = await createKeypair(provider);
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        const submitter_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter,
          WSOL_ADDRESS,
          submitter.publicKey
        );
        let amount = 1 * LAMPORTS_PER_SOL;
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

        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );
    
        const [feature_token_account] = await findFeatureTokenAccount(
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );
        
        let approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 

        // Should be false already
        assert.equal(acc.requestSubmitted, false);
        const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            creator.publicKey, 
            submitter.publicKey,
            submitter_wsol_account.address,
            program
        )
        let fund_feature_ix = await fundFeatureInstruction(
          amount,
          acc.unixTimestamp,
          creator.publicKey,
          WSOL_ADDRESS,
          program
        );

        tx = await provider.sendAndConfirm(new Transaction().add(fund_feature_ix).add(submitRequestIx), [submitter, creator])
    
        // creator votes to cancel feature(VoteToCancel)
        let voteToCancelIxByCreator = await voteToCancelInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          creator.publicKey,
          true,
          program
        );


        try {
        // testing funder_cancel = true & payout_cancel = false
        await program.methods.cancelFeature()
        .accounts({
            creator: creator.publicKey,
            creatorTokenAccount: creator_wsol_account.address,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID
        }).signers([creator]).rpc();
            
        } catch (error) {
        assert.equal((error as AnchorError).error.errorMessage, "Cannot Cancel Feature")
        }

        try {
        // testing funder_cancel = true & request_submitted = false
        let denyRequestIx = await denyRequestInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter.publicKey,
            program
        );
        tx = await provider.sendAndConfirm(new Transaction().add(denyRequestIx), [creator])
        await program.methods.cancelFeature()
        .accounts({
            creator: creator.publicKey,
            creatorTokenAccount: creator_wsol_account.address,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID
        }).signers([creator]).rpc();
            
        } catch (error) {
        assert.equal((error as AnchorError).error.errorMessage, "Cannot Cancel Feature")
        }

        // creator votes to not cancel feature(voteToCancel)
        try{
        let voteToCancelIxBySubmitter = await voteToCancelInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter.publicKey,
            false,
            program
          );
        let creatorRevotesToCancelIx = await voteToCancelInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            creator.publicKey,
            false,
            program
        );

            tx = await provider.sendAndConfirm(
            new Transaction().add(voteToCancelIxByCreator).add(voteToCancelIxBySubmitter).add(creatorRevotesToCancelIx), 
            [creator, submitter]
            );

            acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
            assert.equal(acc.payoutCancel, false);
            assert.equal(acc.funderCancel, false);
            assert.equal(acc.requestSubmitted, false)


            await program.methods.cancelFeature()
            .accounts({
            creator: creator.publicKey,
            creatorTokenAccount: creator_wsol_account.address,
            featureDataAccount: feature_data_account,
            featureTokenAccount: feature_token_account,
            programAuthority: program_authority,
            tokenProgram: TOKEN_PROGRAM_ID
            }).signers([creator]).rpc()
          }catch(err)
          {
              assert.equal((err as AnchorError).error.errorMessage, "Cannot Cancel Feature")
          }
        // submitter votes to cancel Feature(VoteToCancel)
        let voteToCancelIxBySubmitter = await voteToCancelInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter.publicKey,
          true,
          program
        );

        tx = await provider.sendAndConfirm(
        new Transaction().add(voteToCancelIxByCreator).add(voteToCancelIxBySubmitter), 
        [creator, submitter]
        );

        const creator_token_account_before_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)

        let vote_to_cancel_ix = await voteToCancelInstruction(
          acc.unixTimestamp, 
          creator.publicKey, 
          creator.publicKey, 
          true, 
          program
        )
        let cancelFeatureIx = await cancelFeatureInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          creator_wsol_account.address,
          WSOL_ADDRESS,
          program
        )

        tx = await provider.sendAndConfirm(new Transaction().add(vote_to_cancel_ix).add(cancelFeatureIx), [creator])
        console.log("cancel Feature Tx = ", tx);

        const creator_token_account_after_balance = await provider.connection.getTokenAccountBalance(creator_wsol_account.address)
        assert.equal(
        creator_token_account_after_balance.value.amount, 
        (
            ((LANCER_FEE + COMPLETER_FEE) * amount) + parseInt(creator_token_account_before_balance.value.amount)
        ).toString()
        );
        let closed_token_account = await provider.connection.getBalance(feature_token_account);
        let closed_data_account = await provider.connection.getBalance(feature_data_account);

        assert.equal(0, parseInt(closed_data_account.toString()));
        assert.equal(0, parseInt(closed_token_account.toString()));

    })


    it ("cancel vote if creator = submitter", async () => {
        let creator = await createKeypair(provider);
        const submitter = creator;
        ;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        const submitter_wsol_account = await getOrCreateAssociatedTokenAccount(
          provider.connection,
          submitter,
          WSOL_ADDRESS,
          submitter.publicKey
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

        let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        
        const [feature_data_account] = await findFeatureAccount(
          acc.unixTimestamp,
          creator.publicKey,
          program
        );

        
        let approveSubmitterIx = await addApprovedSubmittersInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          submitter.publicKey,
          program
        )
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitterIx), [creator]); 

        // Should be false already
        assert.equal(acc.requestSubmitted, false);
        const submitRequestIx = await submitRequestInstruction(
            acc.unixTimestamp, 
            creator.publicKey, 
            submitter.publicKey,
            submitter_wsol_account.address,
            program
        )

        tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter])
        
        // creator cancels feature(VoteToCancel)
        let voteToCancelIx = await voteToCancelInstruction(
        acc.unixTimestamp,
        creator.publicKey,
        creator.publicKey,
        true,
        program
        );
        tx = await provider.sendAndConfirm(new Transaction().add(voteToCancelIx), [creator]);

        acc = await program.account.featureDataAccount.fetch(feature_data_account);

        assert.equal(acc.funderCancel, true);
        assert.equal(acc.payoutCancel, true);
        assert.equal(acc.requestSubmitted, false);

        console.log("voteToCancel Tx(1) = ", tx);        

    })


})