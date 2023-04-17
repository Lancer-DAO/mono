use anchor_lang::{prelude::*, };
use anchor_spl::token::{Mint, Token};
use anchor_lang::prelude::Pubkey;
use crate::{
    constants::{
        MINT_AUTHORITY, MINT_DECIMALS, LANCER_ADMIN, LANCER_COMPLETER_TOKENS, LANCER_COMPANY_TOKENS
    }, errors::MonoError
};


#[derive(Accounts)]
pub struct CreateLancerTokens<'info> 
{
    #[account(
        mut, 
        address = LANCER_ADMIN @ MonoError::InvalidAdmin,
    )]
    pub admin: Signer<'info>,

    #[account(
        init,
        seeds = [
            admin.key.as_ref(),
            LANCER_COMPLETER_TOKENS.as_bytes()
        ],
        payer = admin,
        bump,
        mint::decimals = MINT_DECIMALS,
        mint::authority = program_mint_authority,
    )]
    pub lancer_completer_tokens: Account<'info, Mint>,

    #[account(
        init,
        seeds = [
            admin.key.as_ref(),
            LANCER_COMPANY_TOKENS.as_bytes()
        ],
        payer = admin,
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

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(_ctx: Context<CreateLancerTokens>) -> Result<()>
{
    Ok(())
}