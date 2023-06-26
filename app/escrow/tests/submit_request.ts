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

describe("submit Request tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;

    it ("test submitRequest", async () => {
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
            acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);

            assert.equal(acc.requestSubmitted, true);
            assert.equal(acc.currentSubmitter.toString(), submitter.publicKey.toString());
            assert.equal(acc.payoutAccount.toString(), submitter_wsol_account.address.toString())

            try {
                await program.methods.submitRequest()
                .accounts({
                creator: creator.publicKey,
                submitter: submitter.publicKey,
                payoutAccount: submitter_wsol_account.address,
                featureDataAccount: feature_data_account,
                }).signers([submitter]).rpc()
            }catch(err)
            {
                assert.equal((err as AnchorError).error.errorMessage, "There is an active request already present")
            }        
    })

    it ("test submitRequest fails when enable multiple submitters is turmed on", async () => {
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

        let enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
        acc.unixTimestamp,
        creator.publicKey,
        program
        );
        await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), [creator]);

        try {
            await program.methods.submitRequest()
            .accounts({
            creator: creator.publicKey,
            submitter: submitter.publicKey,
            payoutAccount: submitter_wsol_account.address,
            featureDataAccount: feature_data_account,
            }).signers([submitter]).rpc()
        }catch(err)
        {
            assert.equal((err as AnchorError).error.errorMessage, "This Instruction is used for only a single submitter.")
        }        
    })

    it ("unapproved submitter cannot submit request", async () => {
        let creator = await createKeypair(provider);
        const unapproved_submitter = await createKeypair(provider);
        ;
        const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            creator,
            WSOL_ADDRESS,
            creator.publicKey
        );
        const unapproved_submitter_wsol_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        unapproved_submitter,
        WSOL_ADDRESS,
        unapproved_submitter.publicKey
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

        // Should be false already
        assert.equal(acc.requestSubmitted, false);

        try {
            await program.methods.submitRequest()
            .accounts({
            creator: creator.publicKey,
            submitter: unapproved_submitter.publicKey,
            payoutAccount: unapproved_submitter_wsol_account.address,
            featureDataAccount: feature_data_account,
            }).signers([unapproved_submitter]).rpc()
        }catch(err)
        {
            assert.equal((err as AnchorError).error.errorMessage, "You do not have permissions to submit")
        }        

    })

    it ("test submit Request Multiple parties", async () => {
        let creator = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        
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
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitter1Ix,approveSubmitter2Ix), [creator]); 

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

        await provider.sendAndConfirm(new Transaction().add(submitRequestMultipleIx1).add(submitRequestMultipleIx2), [submitter1, submitter2])

    })

    it ("test submit Request Multiple can be called by creator", async () => {
        let creator = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        
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
        
        tx = await provider.sendAndConfirm(new Transaction().add(approveSubmitter1Ix,approveSubmitter2Ix), [creator]); 

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
        );

        let submit_request_by_creator_ix = await submitRequestMultipleInstruction(
            acc.unixTimestamp,
            creator.publicKey,
            creator.publicKey,
            program
        )

        await provider.sendAndConfirm(
            new Transaction()
            .add(submitRequestMultipleIx1)
            .add(submitRequestMultipleIx2)
            .add(submit_request_by_creator_ix), 
            [submitter1, submitter2, creator]
        )
    })


})