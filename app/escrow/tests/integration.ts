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

describe("integration tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider =  anchor.getProvider() as anchor.AnchorProvider;

  const program = new Program<MonoProgram>(
        MonoProgramJSON as unknown as MonoProgram, 
        new PublicKey(MONO_DEVNET), 
        provider
    );
    const WSOL_AMOUNT = 2 * LAMPORTS_PER_SOL;


  it("test createFFAInstruction works", async () => {
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
      const acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
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
  });

  it ("test toggle on enable multiple submitters", async () => {
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
    const enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      program
    );
    await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), [creator]);
    acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
  
    assert.equal(acc.isMultipleSubmitters, true);
  })

  it ("set shares of multiple submitters", async () => {
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
    const enable_multiple_submitters_ix = await enableMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      program
    );
    await provider.sendAndConfirm(new Transaction().add(enable_multiple_submitters_ix), [creator]);
    acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    const [feature_data_account] = await findFeatureAccount(
      acc.unixTimestamp,
      creator.publicKey,
      program
    );

    assert.equal(acc.isMultipleSubmitters, true);

    const submitter1 = await createKeypair(provider);
    const submitter2 = await createKeypair(provider);
    const submitter3 = await createKeypair(provider);
    const submitter4 = await createKeypair(provider);
    const submitter5 = await createKeypair(provider);

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

    let tx = await provider.sendAndConfirm(
      new Transaction()
        .add(approveSubmitter1Ix)
        .add(approveSubmitter2Ix)
        .add(approveSubmitter3Ix)
        .add(approveSubmitter4Ix)
        .add(approveSubmitter5Ix), 
        [creator]
    ); 
    const submitter6 = await createKeypair(provider);
    try {
    
      await program.methods.addApprovedSubmitters()
        .accounts({
          creator: creator.publicKey,
          submitter: submitter6.publicKey,
          featureDataAccount: feature_data_account
        }).signers([creator]).rpc()
    } catch (err) {
      assert.equal((err as AnchorError).error.errorMessage, "Max Number of Approved Submitters already reached")
    }
    console.log("adding 5 approved submitters tx = ", tx);

    acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    assert.equal(acc.approvedSubmitters[0].toString(), submitter1.publicKey.toString());
    assert.equal(acc.approvedSubmitters[1].toString(), submitter2.publicKey.toString());
    assert.equal(acc.approvedSubmitters[2].toString(), submitter3.publicKey.toString());
    assert.equal(acc.approvedSubmitters[3].toString(), submitter4.publicKey.toString());
    assert.equal(acc.approvedSubmitters[4].toString(), submitter5.publicKey.toString());

    // add shares to the submitters
    try {
      // test user a share above 100 percent cannot be added
      await program.methods.setShareMultipleSubmitters(submitter1.publicKey, 101)
        .accounts({
          creator: creator.publicKey,
          featureDataAccount: feature_data_account
        }).signers([creator]).rpc()
    } catch (err) {
      assert.equal((err as AnchorError).error.errorMessage, "Share Cannot Exceed 100")
    }

    try {
      // check for creator
      let fake_creator = await createKeypair(provider);
      await program.methods.setShareMultipleSubmitters(submitter1.publicKey, 101)
        .accounts({
          creator: fake_creator.publicKey,
          featureDataAccount: feature_data_account
        }).signers([fake_creator]).rpc()
    } catch (err) {
      // console.log("ERR = ", err);
      assert.equal((err as AnchorError).error.errorMessage, "A seeds constraint was violated")
    }

    let submitter1_share_ix = await setShareMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      submitter1.publicKey,
      20,
      program
    )
    let submitter2_share_ix = await setShareMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      submitter2.publicKey,
      20,
      program
    )
    let submitter3_share_ix = await setShareMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      submitter3.publicKey,
      20,
      program
    )
    let submitter4_share_ix = await setShareMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      submitter4.publicKey,
      20,
      program
    )
    let submitter5_share_ix = await setShareMultipleSubmittersInstruction(
      acc.unixTimestamp,
      creator.publicKey,
      submitter5.publicKey,
      20,
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

    try {
      await program.methods.setShareMultipleSubmitters(submitter6.publicKey, 10)
      .accounts({
        creator: creator.publicKey,
        featureDataAccount: feature_data_account
      }).signers([creator]).rpc()
    } catch (err) {
      assert.equal((err as AnchorError).error.errorMessage, "You do not have permissions to submit")
    }

    acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    assert.equal(acc.approvedSubmittersShares[0], 20);
    assert.equal(acc.approvedSubmittersShares[1], 20);
    assert.equal(acc.approvedSubmittersShares[2], 20);
    assert.equal(acc.approvedSubmittersShares[3], 20);
    assert.equal(acc.approvedSubmittersShares[4], 20);



  })


  it ("withdraw tokens after depositing ", async () => {
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
  
      const [lancer_dao_token_account] = await findLancerTokenAccount(
        WSOL_ADDRESS,
        program
      );
      let info = await provider.connection.getAccountInfo(lancer_dao_token_account);

      const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
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

    // approve request(merge and send funds)(ApproveRequest)
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

      const fake_lancer_admin = await createKeypair(provider);
      const withdrawer = await createKeypair(provider);
      const withdrawer_wsol_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        withdrawer,
        WSOL_ADDRESS,
        withdrawer.publicKey,
      )

      try {
        await program.methods.withdrawTokens(new anchor.BN(0.1 * amount), lancer_token_program_authority_bump)
          .accounts({
            lancerAdmin: fake_lancer_admin.publicKey,
            withdrawer: withdrawer.publicKey,
            withdrawerTokenAccount: withdrawer_wsol_account.address,
            mint: WSOL_ADDRESS,
            lancerDaoTokenAccount: lancer_dao_token_account,
            lancerTokenProgramAuthority: lancer_token_program_authority,
            tokenProgram: TOKEN_PROGRAM_ID,
          }).signers([fake_lancer_admin]).rpc()
      } catch (error) {
        // console.log("err: ", error);
        assert.equal((error as AnchorError).error.errorMessage, "You are not the Admin")
      }

      let lancer_dao_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      let withdrawer_wsol_account_before_balance = await provider.connection.getTokenAccountBalance(withdrawer_wsol_account.address);

      let withdraw_tokens_ix = await withdrawTokensInstruction(
        LANCER_FEE * amount,
        WSOL_ADDRESS,
        withdrawer.publicKey,
        withdrawer_wsol_account.address,
        program,
      );
      await provider.sendAndConfirm(new Transaction().add(withdraw_tokens_ix));
     
      let lancer_dao_token_account_after_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account);
      let withdrawer_wsol_account_after_balance = await provider.connection.getTokenAccountBalance(withdrawer_wsol_account.address);
      assert.equal(
        lancer_dao_token_account_before_balance.value.amount,
        (
          (LANCER_FEE * amount) + parseInt(lancer_dao_token_account_after_balance.value.amount)
        ).toString()
      )
      
      assert.equal(
        withdrawer_wsol_account_after_balance.value.amount,
        (
          parseInt(withdrawer_wsol_account_before_balance.value.amount) + (LANCER_FEE * amount)
        ).toString()
      )
  } )
  

});
