

use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Token, self, Transfer, CloseAccount, MintTo, Mint}};

use crate::{constants::{MONO_DATA, PERCENT, LANCER_DAO, COMPLETER_FEE, LANCER_ADMIN, MINT_DECIMALS, LANCER_COMPLETER_TOKENS, LANCER_COMPANY_TOKENS, MINT_AUTHORITY, THIRD_PARTY_FEE}, state::FeatureDataAccount, errors::MonoError};

#[derive(Accounts)]
pub struct ApproveRequestThirdParty<'info>
{
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub third_party: Account<'info, TokenAccount>,

    #[account(mut)]
    pub submitter: SystemAccount<'info>,

    #[account(
        mut,
        token::mint = feature_data_account.funds_mint,
        token::authority = submitter,
    )]
    pub payout_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = lancer_completer_tokens,
        token::authority = submitter,
    )]
    pub payout_completer_tokens_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = lancer_company_tokens,
        // token::authority = feature_data_account.creator,
    )]
    pub creator_company_tokens_account: Box<Account<'info, TokenAccount>>,


    #[account(
        mut, 
        close = creator,
        seeds = [
            MONO_DATA.as_bytes(),
            feature_data_account.unix_timestamp.as_ref(),
            creator.key.as_ref(),
        ],
        bump = feature_data_account.funds_data_account_bump,
        constraint = feature_data_account.creator == creator.key() @ MonoError::NotTheCreator,
        constraint = feature_data_account.request_submitted == true @ MonoError::NoActiveRequest,
    )]
    pub feature_data_account: Box<Account<'info, FeatureDataAccount>>,

    #[account(
        mut,
        seeds = [
            MONO_DATA.as_bytes(),
            feature_data_account.unix_timestamp.as_ref(),
            creator.key.as_ref(),
            feature_data_account.funds_mint.key().as_ref(),        
        ],
        bump = feature_data_account.funds_token_account_bump,
        token::mint = feature_data_account.funds_mint,
        token::authority = program_authority,
        constraint = feature_token_account.mint == feature_data_account.funds_mint @ MonoError::InvalidMint
    )]
    pub feature_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [
            MONO_DATA.as_bytes(),
            LANCER_DAO.as_bytes(),
            feature_token_account.mint.key().as_ref(),
        ],
        bump,
        token::mint = feature_token_account.mint,
        token::authority = lancer_token_program_authority,
    )]
    pub lancer_dao_token_account: Box<Account<'info, TokenAccount>>,

    ///CHECK: Controls lancer funds(Token)
    #[account(
        seeds = [
            LANCER_DAO.as_bytes(),
        ],
        bump,
    )]
    pub lancer_token_program_authority: UncheckedAccount<'info>,

    ///CHECK: PDA Authority to move out of PDA
    #[account(
        seeds = [
            MONO_DATA.as_bytes(),
        ],
        bump = feature_data_account.program_authority_bump
    )]
    pub program_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            LANCER_ADMIN.as_ref(),
            LANCER_COMPLETER_TOKENS.as_bytes()
        ],
        bump,
        mint::decimals = MINT_DECIMALS,
        mint::authority = program_mint_authority,
    )]
    pub lancer_completer_tokens: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            LANCER_ADMIN.as_ref(),
            LANCER_COMPANY_TOKENS.as_bytes()
        ],
        bump,
        mint::decimals = MINT_DECIMALS,
        mint::authority = program_mint_authority,
    )]
    pub lancer_company_tokens: Account<'info, Mint>,

    ///CHECK: mint authority
    #[account(
        seeds = [
            MINT_AUTHORITY.as_bytes()
        ],
        bump,
    )]
    pub program_mint_authority: UncheckedAccount<'info>,


    pub token_program: Program<'info, Token>,

}

impl<'info> ApproveRequestThirdParty<'info> {
    fn transfer_bounty_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
          Transfer {
            from: self.feature_token_account.to_account_info(),
            to: self.payout_account.to_account_info(),
            authority: self.program_authority.to_account_info(),
        })
    }

    fn transfer_bounty_fee_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
          Transfer {
            from: self.feature_token_account.to_account_info(),
            to: self.lancer_dao_token_account.to_account_info(),
            authority: self.program_authority.to_account_info(),
        })
    }

    fn transfer_bounty_third_party_fee_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
          Transfer {
            from: self.feature_token_account.to_account_info(),
            to: self.third_party.to_account_info(),
            authority: self.program_authority.to_account_info(),
        })
    }


    fn close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
          CloseAccount {
            account: self.feature_token_account.to_account_info(),
            destination: self.creator.to_account_info(),
            authority: self.program_authority.to_account_info(),
        })
    }

    fn mint_completer_tokens(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
             MintTo {
                mint: self.lancer_completer_tokens.to_account_info(),
                to: self.payout_completer_tokens_account.to_account_info(),
                authority: self.program_mint_authority.to_account_info(),
             }
        )
    }

    fn mint_company_tokens(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
             MintTo {
                mint: self.lancer_company_tokens.to_account_info(),
                to: self.creator_company_tokens_account.to_account_info(),
                authority: self.program_mint_authority.to_account_info(),
             }
        )
    }

}

pub fn handler(ctx: Context<ApproveRequestThirdParty>, bump: u8) -> Result<()>
{

    let transfer_seeds = &[
        MONO_DATA.as_bytes(),
        &[ctx.accounts.feature_data_account.program_authority_bump]
    ];
    let transfer_signer = [&transfer_seeds[..]];

    let mint_seeds = &[
        MINT_AUTHORITY.as_bytes(),
        &[bump]
    ];
    let mint_signer = [&mint_seeds[..]];


    let bounty_amount = ctx.accounts.feature_data_account.amount;
    // pay the completer 95%
    let completer_fee = bounty_amount
        .checked_mul(COMPLETER_FEE as u64)
        .unwrap()
        .checked_div(PERCENT)
        .unwrap();
    
    msg!("completer fee amount = {}", completer_fee);
    
    token::transfer(
        ctx.accounts.transfer_bounty_context().with_signer(&transfer_signer), 
        completer_fee
    )?;
    ctx.accounts.feature_token_account.reload()?;

    let third_party_fee = ctx.accounts.feature_token_account.amount
        .checked_mul(THIRD_PARTY_FEE)
        .unwrap()
        .checked_div(PERCENT)
        .unwrap();
    
    msg!("third party fee = {}", third_party_fee);
    token::transfer(
        ctx.accounts.transfer_bounty_third_party_fee_context().with_signer(&transfer_signer), 
        third_party_fee
    )?;

    ctx.accounts.feature_token_account.reload()?;
    msg!("lancer fee = {}", ctx.accounts.feature_token_account.amount);
    token::transfer(
        ctx.accounts.transfer_bounty_fee_context().with_signer(&transfer_signer), 
        ctx.accounts.feature_token_account.amount
    )?;


    token::mint_to(
        ctx.accounts.mint_completer_tokens().with_signer(&mint_signer), 
        ctx.accounts.feature_data_account.amount
    )?;
    token::mint_to(
        ctx.accounts.mint_company_tokens().with_signer(&mint_signer), 
        ctx.accounts.feature_data_account.amount
    )?;    

    // Close token account owned by program that stored funds
    token::close_account(
            ctx.accounts.close_context().with_signer(&transfer_signer)
    )
}