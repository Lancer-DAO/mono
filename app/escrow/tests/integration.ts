import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAccount, createInitializeAccount3Instruction, createSyncNativeInstruction, getAccount, getMint, getOrCreateAssociatedTokenAccount, NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { MonoProgram } from "../sdk/types/mono_program";
import  MonoProgramJSON  from "../sdk/idl/mono_program.json";
import { COMPLETER_FEE, LANCER_FEE, LANCER_FEE_THIRD_PARTY, MINT_DECIMALS, MONO_DEVNET, THIRD_PARTY, WSOL_ADDRESS } from "../sdk/constants";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { add_more_token, createKeypair } from "./utils";
import { findFeatureAccount, findFeatureTokenAccount, findLancerCompanyTokens, findLancerCompleterTokens, findLancerProgramAuthority, findLancerTokenAccount, findProgramAuthority, findProgramMintAuthority } from "../sdk/pda";
import { addApprovedSubmittersInstruction, approveRequestInstruction, approveRequestThirdPartyInstruction, cancelFeatureInstruction, createFeatureFundingAccountInstruction, createLancerTokenAccountInstruction, createLancerTokensInstruction, denyRequestInstruction, fundFeatureInstruction, removeApprovedSubmittersInstruction, submitRequestInstruction, voteToCancelInstruction, withdrawTokensInstrution } from "../sdk/instructions";
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

  it("test createLancerTokenAccount works", async () => {
    let lancer_admin = await createKeypair(provider);
    
    const [lancer_dao_token_account] = await findLancerTokenAccount(
      WSOL_ADDRESS,
      program
    );
    const [lancer_token_program_authority] = await findLancerProgramAuthority(
      program
    );
  
    try {
      await program.methods.createLancerTokenAccount()
      .accounts({
        lancerAdmin: lancer_admin.publicKey,
        fundsMint: WSOL_ADDRESS,
        lancerDaoTokenAccount: lancer_dao_token_account,
        programAuthority: lancer_token_program_authority,
      }).signers([lancer_admin]).rpc()

    } catch (err) {
      assert.equal((err as AnchorError).error.errorMessage,"You are not the Admin")
    }
  
    const create_lancer_token_account_ix = await createLancerTokenAccountInstruction(
      WSOL_ADDRESS,
      lancer_dao_token_account,
      program
    );
    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_token_account_ix), 
      []
    );

    let lancer_token_account_info = await getAccount(
      provider.connection,
      lancer_dao_token_account
    );
    assert.equal(lancer_token_account_info.mint.toString(), WSOL_ADDRESS.toString())
    assert.equal(
      lancer_token_account_info.owner.toString(), 
      lancer_token_program_authority.toString()
    )
  })

  it ("create lancer completer and lancer company tokens", async () => {
    let lancer_admin = await createKeypair(provider);

    const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
    const [lancer_company_tokens] = await findLancerCompanyTokens(program);
    const [program_mint_authority] = await findProgramMintAuthority(program);

    // console.log("signer = ", provider.publicKey.toString())
    try{
      await program.methods.createLancerTokens()
        .accounts({
          admin: lancer_admin.publicKey,
          lancerCompleterTokens: lancer_completer_tokens,
          lancerCompanyTokens: lancer_company_tokens,
          programMintAuthority: program_mint_authority,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([lancer_admin])
        .rpc();
    }catch(err) {
      // We get this error rather than InvalidAdmin
      assert.equal((err as AnchorError).error.errorMessage, "A seeds constraint was violated")
    };
    let create_lancer_tokens_ix = await createLancerTokensInstruction(program);

    await provider.sendAndConfirm(
      new Transaction().add(create_lancer_tokens_ix),
      []
    );

    const lancer_company_token_account_info = await provider.connection.getAccountInfo(lancer_company_tokens);
    const lancer_completer_token_account_info = await provider.connection.getAccountInfo(lancer_completer_tokens);
    // console.log("lancer token:",lancer_token)
    const lancer_completer_token_mint_info = await getMint(provider.connection, lancer_completer_tokens);
    const lancer_company_token_mint_info = await getMint(provider.connection, lancer_company_tokens);

    // check that lancer tokens created are owned by btoken program
    assert.equal(lancer_completer_token_account_info.owner.toString(), TOKEN_PROGRAM_ID.toString());
    assert.equal(lancer_company_token_account_info.owner.toString(), TOKEN_PROGRAM_ID.toString());

    // check appropriate information exist on the new Mints
    assert.equal(lancer_company_token_mint_info.decimals, MINT_DECIMALS);
    assert.equal(lancer_company_token_mint_info.address.toString(), lancer_company_tokens.toString());
    assert.equal(lancer_company_token_mint_info.supply.toString(), "0");
    assert.equal(lancer_company_token_mint_info.isInitialized, true);
    assert.equal(lancer_company_token_mint_info.mintAuthority.toString(), program_mint_authority.toString());

    assert.equal(lancer_completer_token_mint_info.decimals, MINT_DECIMALS);
    assert.equal(lancer_completer_token_mint_info.address.toString(), lancer_completer_tokens.toString());
    assert.equal(lancer_completer_token_mint_info.supply.toString(), "0");
    assert.equal(lancer_completer_token_mint_info.isInitialized, true);
    assert.equal(lancer_completer_token_mint_info.mintAuthority.toString(), program_mint_authority.toString());
    


  })

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
            dataSize: 296, // number of bytes
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
            dataSize: 296, // number of bytes
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
                dataSize: 296, // number of bytes
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

        // Adding 4th submitter(should fail)
        const submitter4 = await createKeypair(provider);

      try{
        await program.methods.addApprovedSubmitters()
                .accounts({
                  creator: creator.publicKey,
                  submitter: submitter4.publicKey,
                  featureDataAccount: feature_data_account
                }).signers([creator]).rpc();  
        
      }catch(err){
        assert.equal((err as AnchorError).error.errorMessage, "Max Number of Approved Submitters already reached")
      }
        
    })

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
                dataSize: 296, // number of bytes
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

  it ("test approveRequest",async () => {
    let creator = await createKeypair(provider);

     
    const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        WSOL_ADDRESS,
        creator.publicKey
    );
    await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

    const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
    const [lancer_company_tokens] = await findLancerCompanyTokens(program);
    const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

    const creator_company_tokens_account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      lancer_company_tokens,
      creator.publicKey
    )


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
            dataSize: 296, // number of bytes
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
      const payout_completer_tokens_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        lancer_completer_tokens,
        submitter1.publicKey
      )
  
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
        let approveRequestIx = await program.methods.approveRequest(mint_bump)
        .accounts({
          creator: creator.publicKey,
          submitter: submitter1.publicKey,
          lancerCompleterTokens: lancer_completer_tokens,
          lancerCompanyTokens: lancer_company_tokens,
          payoutAccount: submitter1_wsol_account.address,
          featureDataAccount: feature_data_account,
          featureTokenAccount: feature_token_account,
          creatorCompanyTokensAccount: creator_company_tokens_account.address,
          payoutCompleterTokensAccount: payout_completer_tokens_account.address,
          programAuthority: program_authority,
          programMintAuthority: program_mint_authority,
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

     let creator_company_tokens_account_before_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
     let payout_completer_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);

      let approveRequestIx = await approveRequestInstruction(
        acc.unixTimestamp,
        payout_completer_tokens_account.address,
        creator_company_tokens_account.address,
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


        // check that lancer completer and company tokens are minted
        let creator_company_tokens_account_after_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
        let payout_completer_tokens_account_after_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
   
        assert.equal(
          creator_company_tokens_account_after_balance.value.amount,
          parseInt(creator_company_tokens_account_before_balance.value.amount + amount).toString()
        )
        assert.equal(
          payout_completer_tokens_account_after_balance.value.amount,
          parseInt(payout_completer_tokens_account_before_balance.value.amount + amount).toString()
        )


        // Check token account and data account are closed
        let closed_token_account = await provider.connection.getBalance(feature_token_account);
        let closed_data_account = await provider.connection.getBalance(feature_data_account);
   
        assert.equal(0, parseInt(closed_data_account.toString()));
        assert.equal(0, parseInt(closed_token_account.toString()));
  })

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
            dataSize: 296, // number of bytes
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
                dataSize: 296, // number of bytes
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
                dataSize: 296, // number of bytes
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

        let cancelFeatureIx = await cancelFeatureInstruction(
          acc.unixTimestamp,
          creator.publicKey,
          creator_wsol_account.address,
          WSOL_ADDRESS,
          program
        )

        tx = await provider.sendAndConfirm(new Transaction().add(cancelFeatureIx), [creator])
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
                dataSize: 296, // number of bytes
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
          assert.equal((err as AnchorError).error.errorMessage, "Max Number of Approved Submitters already reached");
        }
        accounts = await provider.connection.getParsedProgramAccounts(
          program.programId, 
          {
            filters: [
              {
                dataSize: 296, // number of bytes
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
            dataSize: 296, // number of bytes
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
            dataSize: 296, // number of bytes
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
      const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
      const [lancer_company_tokens] = await findLancerCompanyTokens(program);
      const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

      const creator_company_tokens_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        lancer_company_tokens,
        creator.publicKey
      )
      const payout_completer_tokens_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        lancer_completer_tokens,
        submitter1.publicKey
      )
  
      try{
        await program.methods.approveRequest(mint_bump)
        .accounts({
          creator: creator.publicKey,
          submitter: submitter1.publicKey,
          lancerCompleterTokens: lancer_completer_tokens,
          lancerCompanyTokens: lancer_company_tokens,
          payoutAccount: submitter1_wsol_account.address,
          featureDataAccount: feature_data_account,
          featureTokenAccount: feature_token_account,
          creatorCompanyTokensAccount: creator_company_tokens_account.address,
          payoutCompleterTokensAccount: payout_completer_tokens_account.address,
          programAuthority: program_authority,
          programMintAuthority: program_mint_authority,
          lancerTokenProgramAuthority: lancer_token_program_authority,
          lancerDaoTokenAccount: lancer_dao_token_account,
          tokenProgram: TOKEN_PROGRAM_ID,
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
    acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
    tx = await provider.sendAndConfirm(new Transaction().add(submitRequestIx), [submitter1])


      // approve request(merge and send funds)(ApproveRequest)
        const submitter_token_account_before_balance = await provider.connection.getTokenAccountBalance(submitter1_wsol_account.address)
        acc = await program.account.featureDataAccount.fetch(accounts[0].pubkey);
        let creator_company_tokens_account_before_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
        let payout_completer_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
        const lancer_token_account_before_balance = await provider.connection.getTokenAccountBalance(lancer_dao_token_account)

        let approveRequestIx = await approveRequestInstruction(
          acc.unixTimestamp,
          payout_completer_tokens_account.address,
          creator_company_tokens_account.address,
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


        // check that lancer completer and company tokens are minted
        let creator_company_tokens_account_after_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
        let payout_completer_tokens_account_after_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
   
        assert.equal(
          creator_company_tokens_account_after_balance.value.amount,
          parseInt(creator_company_tokens_account_before_balance.value.amount + amount).toString()
        )
        assert.equal(
          payout_completer_tokens_account_after_balance.value.amount,
          parseInt(payout_completer_tokens_account_before_balance.value.amount + amount).toString()
        )


        // Check token account and data account are closed
        let closed_token_account = await provider.connection.getBalance(feature_token_account);
        let closed_data_account = await provider.connection.getBalance(feature_data_account);
   
        assert.equal(0, parseInt(closed_data_account.toString()));
        assert.equal(0, parseInt(closed_token_account.toString()));
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

    const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
    const [lancer_company_tokens] = await findLancerCompanyTokens(program);
    const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

    const creator_company_tokens_account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      lancer_company_tokens,
      creator.publicKey
    )


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
            dataSize: 296, // number of bytes
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
      const payout_completer_tokens_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        lancer_completer_tokens,
        submitter1.publicKey
      )
  
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
        payout_completer_tokens_account.address,
        creator_company_tokens_account.address,
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


      let withdraw_tokens_ix = await withdrawTokensInstrution(
        LANCER_FEE * amount,
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
  
  it ("test third party fees ",async () => {
    let creator = await createKeypair(provider);

     
    const creator_wsol_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        WSOL_ADDRESS,
        creator.publicKey
    );
    await add_more_token(provider, creator_wsol_account.address, WSOL_AMOUNT);

    const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
    const [lancer_company_tokens] = await findLancerCompanyTokens(program);
    const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

    const creator_company_tokens_account = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      creator,
      lancer_company_tokens,
      creator.publicKey
    )


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
            dataSize: 296, // number of bytes
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
      const payout_completer_tokens_account = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        creator,
        lancer_completer_tokens,
        submitter1.publicKey
      )
  
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

  

      let creator_company_tokens_account_before_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
      let payout_completer_tokens_account_before_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
 
      let approveRequestThirdPartyIx = await approveRequestThirdPartyInstruction(
        acc.unixTimestamp,
        third_party_wsol_account.address,
        payout_completer_tokens_account.address,
        creator_company_tokens_account.address,
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


        // check that lancer completer and company tokens are minted
        let creator_company_tokens_account_after_balance =  await provider.connection.getTokenAccountBalance(creator_company_tokens_account.address);
        let payout_completer_tokens_account_after_balance = await provider.connection.getTokenAccountBalance(payout_completer_tokens_account.address);
   
        assert.equal(
          creator_company_tokens_account_after_balance.value.amount,
          parseInt(creator_company_tokens_account_before_balance.value.amount + amount).toString()
        )
        assert.equal(
          payout_completer_tokens_account_after_balance.value.amount,
          parseInt(payout_completer_tokens_account_before_balance.value.amount + amount).toString()
        )


        // Check token account and data account are closed
        let closed_token_account = await provider.connection.getBalance(feature_token_account);
        let closed_data_account = await provider.connection.getBalance(feature_data_account);
   
        assert.equal(0, parseInt(closed_data_account.toString()));
        assert.equal(0, parseInt(closed_token_account.toString()));

  })

});
