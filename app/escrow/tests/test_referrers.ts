import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAccount, createInitializeAccount3Instruction, createMint, createSyncNativeInstruction, getAccount, getMint, getOrCreateAssociatedTokenAccount, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { COMPLETER_FEE, LANCER_FEE, LANCER_FEE_THIRD_PARTY, MINT_DECIMALS, MONO_DEVNET, THIRD_PARTY, WSOL_ADDRESS } from "../sdk/constants";
import { ComputeBudgetInstruction, ComputeBudgetProgram, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findLancerCompanyTokens, findLancerCompleterTokens, findLancerProgramAuthority, findLancerTokenAccount, findProgramAuthority, findProgramMintAuthority, findReferralDataAccount } from "../sdk/pda";
import { addApprovedSubmittersInstruction, addApprovedSubmittersV1Instruction, approveRequestInstruction, approveRequestMultipleTransaction, approveRequestThirdPartyInstruction, cancelFeatureInstruction, createFeatureFundingAccountInstruction, createLancerTokenAccountInstruction, createReferralDataAccountInstruction, denyRequestInstruction, enableMultipleSubmittersInstruction, fundFeatureInstruction, removeApprovedSubmittersInstruction, removeApprovedSubmittersV1Instruction, setShareMultipleSubmittersInstruction, submitRequestInstruction, submitRequestMultipleInstruction, voteToCancelInstruction, withdrawTokensInstruction } from "../sdk/instructions";
import { assert } from "chai";
import { min } from "bn.js";

describe("test referrering system", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const provider =  anchor.getProvider() as anchor.AnchorProvider;
  
    const program = new Program<MonoProgram>(
          MonoProgramJSON as unknown as MonoProgram, 
          new PublicKey(MONO_DEVNET), 
          provider
      );
      const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;

    it("create referrer instruction works", async () => {
            // Add your test here.
    let creator = await createKeypair(provider);
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
    const tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
    console.log("createFFA transaction signature", tx);
    const accounts = await provider.connection.getParsedProgramAccounts(
      program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
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
    )
      let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
      // Check creator in FFA corresponds to expected creator
      assert.equal(creator.publicKey.toString(), acc.creator.toString());
      assert.equal(acc.isMultipleSubmitters, false);

      const token_account_in_TokenAccount = await getAccount(provider.connection, acc.fundsTokenAccount);
      const token_account_in_Account = await provider.connection.getAccountInfo(token_account_in_TokenAccount.address);

      // Check FFA token Account is owned by program Authority Account
      assert.equal(token_account_in_TokenAccount.owner.toString(), program_authority.toString())
      // Check token account mint corresponds with saved funds mint
      assert.equal(token_account_in_TokenAccount.mint.toString(), acc.fundsMint.toString());
      // Check token account owner is already TOKEN_PROGRAM_ID(already done in getAccount()) 
      assert.equal(token_account_in_Account.owner.toString(), TOKEN_PROGRAM_ID.toString());

      //check amount is empty
      // assert.equal(acc.amount.toNumber, 0);
      // Checks that program authority Account is owned by program(may fail if program not created on deployment)
      // const program_authority_in_Account = await provider.connection.getAccountInfo(program_authority);
      // assert.equal(program_authority_in_Account.owner.toString(), program.programId.toString())

      acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
      const [feature_data_account] = await findFeatureAccount(
        acc.unixTimestamp,
        creator.publicKey,
        program
      );
  

      let create_referrer_ix = await createReferralDataAccountInstruction(
        creator.publicKey,
        feature_data_account,
        program
      );
      await provider.sendAndConfirm(new Transaction().add(create_referrer_ix), [creator]);

      let [referrer_data_account, referral_data_account_bump] = await findReferralDataAccount(
        creator.publicKey,
        feature_data_account,
        program
      );
      let reffererData = await program.account.referralDataAccount.fetch(referrer_data_account);
      assert.equal(reffererData.referralDataAccountBump, referral_data_account_bump)
      assert.equal(reffererData.noOfSubmitters, 0);
      assert.equal(reffererData.currentReferrer.toString(), PublicKey.default.toString())
      assert.equal(reffererData.approvedReferrers[0].toString(), PublicKey.default.toString())
      assert.equal(reffererData.approvedReferrers[1].toString(), PublicKey.default.toString())
      assert.equal(reffererData.approvedReferrers[2].toString(), PublicKey.default.toString())
      assert.equal(reffererData.approvedReferrers[3].toString(), PublicKey.default.toString())
      assert.equal(reffererData.approvedReferrers[4].toString(), PublicKey.default.toString())

    })

    it ("test adding a new referrer per submitter",async () => {
        const creator = await createKeypair(provider);
        const submitter = await createKeypair(provider);
        const referrer = await createKeypair(provider);
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
        const tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
        console.log("createFFA transaction signature", tx);
        const accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
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
        )
          let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          // Check creator in FFA corresponds to expected creator
          assert.equal(creator.publicKey.toString(), acc.creator.toString());
          assert.equal(acc.isMultipleSubmitters, false);
    
          const token_account_in_TokenAccount = await getAccount(provider.connection, acc.fundsTokenAccount);
          const token_account_in_Account = await provider.connection.getAccountInfo(token_account_in_TokenAccount.address);
    
          // Check FFA token Account is owned by program Authority Account
          assert.equal(token_account_in_TokenAccount.owner.toString(), program_authority.toString())
          // Check token account mint corresponds with saved funds mint
          assert.equal(token_account_in_TokenAccount.mint.toString(), acc.fundsMint.toString());
          // Check token account owner is already TOKEN_PROGRAM_ID(already done in getAccount()) 
          assert.equal(token_account_in_Account.owner.toString(), TOKEN_PROGRAM_ID.toString());
    
          //check amount is empty
          // assert.equal(acc.amount.toNumber, 0);
          // Checks that program authority Account is owned by program(may fail if program not created on deployment)
          // const program_authority_in_Account = await provider.connection.getAccountInfo(program_authority);
          // assert.equal(program_authority_in_Account.owner.toString(), program.programId.toString())
    
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          const [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            creator.publicKey,
            program
          );
          const [referral_data_account] = await findReferralDataAccount(
            creator.publicKey,
            feature_data_account,
            program,
          );
    
          let create_referrer_ix = await createReferralDataAccountInstruction(
            creator.publicKey,
            feature_data_account,
            program
          );
          await provider.sendAndConfirm(new Transaction().add(create_referrer_ix), [creator])
          try {
            await program.methods.removeApprovedSubmittersV1()
                .accounts({
                    creator: creator.publicKey,
                    submitter: submitter.publicKey,
                    featureDataAccount: feature_data_account,
                    referralDataAccount: referral_data_account
                }).signers([creator]).rpc()
          } catch (err) {
            assert.equal((err as AnchorError).error.errorMessage, "Min Number of Approved Submitters already reached");
          }

          let add_approved_submitters_v1 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer.publicKey,
            submitter.publicKey,
            program
          );
          await provider.sendAndConfirm(new Transaction().add(add_approved_submitters_v1), [creator]);
  
          let data_account_feature = await program.account.featureDataAccount.fetch(feature_data_account);
          let data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);
          //Testing no of submitters
          let no_of_submitters = 1;
          assert.equal(no_of_submitters, data_account_feature.noOfSubmitters);
          assert.equal(submitter.publicKey.toString(), data_account_feature.approvedSubmitters[0].toString());
          assert.equal(PublicKey.default.toString(), data_account_feature.approvedSubmitters[1].toString());
          assert.equal(PublicKey.default.toString(), data_account_feature.approvedSubmitters[2].toString());
          // Testing referrers are registered successfully
          assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[1].toString(), PublicKey.default.toString());
          assert.equal(data_account_referral.approvedReferrers[2].toString(), PublicKey.default.toString());

          // test repetitive submitters are not permitted
          try{
             await program.methods.addApprovedSubmittersV1()
                .accounts({
                    creator: creator.publicKey,
                    referrer: referrer.publicKey,
                    submitter: submitter.publicKey,
                    featureDataAccount: feature_data_account,
                    referralDataAccount: referral_data_account
                }).signers([creator]).rpc();

          }catch(err) {
            assert.equal((err as AnchorError).error.errorMessage, "Submitter Key Already Present in ApprovedSubmitters List")
          }
    })

    it ("testing multiple referrers when there are multiple approved submitters", async () => {
        const creator = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);
        const referrer1 = await createKeypair(provider);
        const referrer2 = await createKeypair(provider);
        const referrer3 = await createKeypair(provider);
        const referrer4 = await createKeypair(provider);
        const referrer5 = await createKeypair(provider);
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
        const tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
        console.log("createFFA transaction signature", tx);
        const accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
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
        )
          let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          // Check creator in FFA corresponds to expected creator
          assert.equal(creator.publicKey.toString(), acc.creator.toString());
          assert.equal(acc.isMultipleSubmitters, false);
    
          const token_account_in_TokenAccount = await getAccount(provider.connection, acc.fundsTokenAccount);
          const token_account_in_Account = await provider.connection.getAccountInfo(token_account_in_TokenAccount.address);
    
          // Check FFA token Account is owned by program Authority Account
          assert.equal(token_account_in_TokenAccount.owner.toString(), program_authority.toString())
          // Check token account mint corresponds with saved funds mint
          assert.equal(token_account_in_TokenAccount.mint.toString(), acc.fundsMint.toString());
          // Check token account owner is already TOKEN_PROGRAM_ID(already done in getAccount()) 
          assert.equal(token_account_in_Account.owner.toString(), TOKEN_PROGRAM_ID.toString());
    
          //check amount is empty
          // assert.equal(acc.amount.toNumber, 0);
          // Checks that program authority Account is owned by program(may fail if program not created on deployment)
          // const program_authority_in_Account = await provider.connection.getAccountInfo(program_authority);
          // assert.equal(program_authority_in_Account.owner.toString(), program.programId.toString())
    
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          const [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            creator.publicKey,
            program
          );
          const [referral_data_account] = await findReferralDataAccount(
            creator.publicKey,
            feature_data_account,
            program,
          );
    
          let create_referrer_ix = await createReferralDataAccountInstruction(
            creator.publicKey,
            feature_data_account,
            program
          );
          
          let add_approved_submitters_v1_ix1 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer1.publicKey,
            submitter1.publicKey,
            program
          );
          let add_approved_submitters_v1_ix2 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer2.publicKey,
            submitter2.publicKey,
            program
          );
          let add_approved_submitters_v1_ix3 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer3.publicKey,
            submitter3.publicKey,
            program
          );
          let add_approved_submitters_v1_ix4 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer4.publicKey,
            submitter4.publicKey,
            program
          );
          let add_approved_submitters_v1_ix5 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer5.publicKey,
            submitter5.publicKey,
            program
          );
          await provider.sendAndConfirm(
            new Transaction()
            .add(create_referrer_ix)
            .add(add_approved_submitters_v1_ix1) 
            .add(add_approved_submitters_v1_ix2) 
            .add(add_approved_submitters_v1_ix3) 
            .add(add_approved_submitters_v1_ix4)
            .add(add_approved_submitters_v1_ix5), 
            [creator]
          );

          let data_account_feature = await program.account.featureDataAccount.fetch(feature_data_account);
          let data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);
          //Testing no of submitters
          let no_of_submitters = 5;
          assert.equal(no_of_submitters, data_account_feature.noOfSubmitters);
          assert.equal(submitter1.publicKey.toString(), data_account_feature.approvedSubmitters[0].toString());
          assert.equal(submitter2.publicKey.toString(), data_account_feature.approvedSubmitters[1].toString());
          assert.equal(submitter3.publicKey.toString(), data_account_feature.approvedSubmitters[2].toString());
          assert.equal(submitter4.publicKey.toString(), data_account_feature.approvedSubmitters[3].toString());
          assert.equal(submitter5.publicKey.toString(), data_account_feature.approvedSubmitters[4].toString());
          // Testing referrers are registered successfully
          assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer1.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer2.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer3.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer4.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[4].toString(), referrer5.publicKey.toString());

    })

    it ("removes a referrer(s) when a submitter(s) is removed", async () => {
        const creator = await createKeypair(provider);
        const submitter1 = await createKeypair(provider);
        const submitter2 = await createKeypair(provider);
        const submitter3 = await createKeypair(provider);
        const submitter4 = await createKeypair(provider);
        const submitter5 = await createKeypair(provider);
        const referrer1 = await createKeypair(provider);
        const referrer2 = await createKeypair(provider);
        const referrer3 = await createKeypair(provider);
        const referrer4 = await createKeypair(provider);
        const referrer5 = await createKeypair(provider);
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
        const tx = await provider.sendAndConfirm(new Transaction().add(ix), [creator]);
        console.log("createFFA transaction signature", tx);
        const accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
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
        )
          let acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          // Check creator in FFA corresponds to expected creator
          assert.equal(creator.publicKey.toString(), acc.creator.toString());
          assert.equal(acc.isMultipleSubmitters, false);
    
          const token_account_in_TokenAccount = await getAccount(provider.connection, acc.fundsTokenAccount);
          const token_account_in_Account = await provider.connection.getAccountInfo(token_account_in_TokenAccount.address);

          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          const [feature_data_account] = await findFeatureAccount(
            acc.unixTimestamp,
            creator.publicKey,
            program
          );
          const [referral_data_account] = await findReferralDataAccount(
            creator.publicKey,
            feature_data_account,
            program,
          );
    
          let create_referrer_ix = await createReferralDataAccountInstruction(
            creator.publicKey,
            feature_data_account,
            program
          );
          
          let add_approved_submitters_v1_ix1 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer1.publicKey,
            submitter1.publicKey,
            program
          );
          let add_approved_submitters_v1_ix2 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer2.publicKey,
            submitter2.publicKey,
            program
          );
          let add_approved_submitters_v1_ix3 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer3.publicKey,
            submitter3.publicKey,
            program
          );
          let add_approved_submitters_v1_ix4 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer4.publicKey,
            submitter4.publicKey,
            program
          );
          let add_approved_submitters_v1_ix5 = await addApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            referrer5.publicKey,
            submitter5.publicKey,
            program
          );
          await provider.sendAndConfirm(
            new Transaction()
            .add(create_referrer_ix)
            .add(add_approved_submitters_v1_ix1) 
            .add(add_approved_submitters_v1_ix2) 
            .add(add_approved_submitters_v1_ix3) 
            .add(add_approved_submitters_v1_ix4)
            .add(add_approved_submitters_v1_ix5), 
            [creator]
          );

          let data_account_feature = await program.account.featureDataAccount.fetch(feature_data_account);
          let data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);
          //Testing no of submitters
          let no_of_submitters = 5;
          assert.equal(no_of_submitters, data_account_feature.noOfSubmitters);
          assert.equal(submitter1.publicKey.toString(), data_account_feature.approvedSubmitters[0].toString());
          assert.equal(submitter2.publicKey.toString(), data_account_feature.approvedSubmitters[1].toString());
          assert.equal(submitter3.publicKey.toString(), data_account_feature.approvedSubmitters[2].toString());
          assert.equal(submitter4.publicKey.toString(), data_account_feature.approvedSubmitters[3].toString());
          assert.equal(submitter5.publicKey.toString(), data_account_feature.approvedSubmitters[4].toString());
          // Testing referrers are registered successfully
          assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer1.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer2.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer3.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer4.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[4].toString(), referrer5.publicKey.toString());

          let remove_approved_submitters_ix1 = await removeApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter1.publicKey,
            program
          );
          await provider.sendAndConfirm(new Transaction().add(remove_approved_submitters_ix1), [creator]);
          //test submitter1 and it's referrer has been removed
          acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
          data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);

          assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
          assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
          assert.equal(acc.approvedSubmitters[2].toString(), submitter4.publicKey.toString());
          assert.equal(acc.approvedSubmitters[3].toString(), submitter5.publicKey.toString());
          assert.equal(acc.approvedSubmitters[4].toString(), PublicKey.default.toString());

          assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer2.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer3.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer4.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer5.publicKey.toString());
          assert.equal(data_account_referral.approvedReferrers[4].toString(), PublicKey.default.toString());


          // add submitter1 again(should now be the last submitter)
          await program.methods.addApprovedSubmittersV1()
            .accounts({
                creator: creator.publicKey,
                referrer: referrer1.publicKey,
                submitter: submitter1.publicKey,
                featureDataAccount: feature_data_account,
                referralDataAccount: referral_data_account,
            }).signers([creator]).rpc();

        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);

        assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
        assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
        assert.equal(acc.approvedSubmitters[2].toString(), submitter4.publicKey.toString());
        assert.equal(acc.approvedSubmitters[3].toString(), submitter5.publicKey.toString());
        assert.equal(acc.approvedSubmitters[4].toString(), submitter1.publicKey.toString());

        assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer2.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer3.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer4.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer5.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[4].toString(), referrer1.publicKey.toString());
 
        // remove submitter4 and it's referrer
        remove_approved_submitters_ix1 = await removeApprovedSubmittersV1Instruction(
            acc.unixTimestamp,
            creator.publicKey,
            submitter4.publicKey,
            program
        );
        await provider.sendAndConfirm(new Transaction().add(remove_approved_submitters_ix1), [creator]);

        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);

        assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
        assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
        assert.equal(acc.approvedSubmitters[2].toString(), submitter5.publicKey.toString());
        assert.equal(acc.approvedSubmitters[3].toString(), submitter1.publicKey.toString());
        assert.equal(acc.approvedSubmitters[4].toString(), PublicKey.default.toString());

        assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer2.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer3.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer5.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer1.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[4].toString(), PublicKey.default.toString());

        // add submitter4 and it's referrer(should be last)
        await program.methods.addApprovedSubmittersV1()
        .accounts({
            creator: creator.publicKey,
            referrer: referrer4.publicKey,
            submitter: submitter4.publicKey,
            featureDataAccount: feature_data_account,
            referralDataAccount: referral_data_account,
        }).signers([creator]).rpc();

        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        data_account_referral = await program.account.referralDataAccount.fetch(referral_data_account);

        assert.equal(acc.approvedSubmitters[0].toString(), submitter2.publicKey.toString());
        assert.equal(acc.approvedSubmitters[1].toString(), submitter3.publicKey.toString());
        assert.equal(acc.approvedSubmitters[2].toString(), submitter5.publicKey.toString());
        assert.equal(acc.approvedSubmitters[3].toString(), submitter1.publicKey.toString());
        assert.equal(acc.approvedSubmitters[4].toString(), submitter4.publicKey.toString());

        assert.equal(data_account_referral.approvedReferrers[0].toString(), referrer2.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[1].toString(), referrer3.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[2].toString(), referrer5.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[3].toString(), referrer1.publicKey.toString());
        assert.equal(data_account_referral.approvedReferrers[4].toString(), referrer4.publicKey.toString());

        // Add another submitter(should fail)
        try{
            let submitter6 = await createKeypair(provider);
            let referrer6 = await createKeypair(provider);

            await program.methods.addApprovedSubmittersV1()
            .accounts({
                creator: creator.publicKey,
                referrer: referrer6.publicKey,
                submitter: submitter6.publicKey,
                featureDataAccount: feature_data_account,
                referralDataAccount: referral_data_account,
            }).signers([creator]).rpc();
        }catch(err)
        {
            assert.equal((err as AnchorError).error.errorMessage, "Max Number of Approved Submitters already reached");
        }

    })
})