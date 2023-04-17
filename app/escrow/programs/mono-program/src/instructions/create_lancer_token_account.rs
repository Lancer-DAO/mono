use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Mint, Token};

use crate::{constants::{LANCER_DAO, MONO_DATA, LANCER_ADMIN}, errors::MonoError};

#[derive(Accounts)]
pub struct CreateLancerTokenAccount<'info>
{
    // TODO: Can only be called by lancer admin
    #[account(
        mut,
        address = LANCER_ADMIN @ MonoError::InvalidAdmin,
    )]
    pub lancer_admin: Signer<'info>,

    #[account()]
    pub funds_mint: Account<'info, Mint>,

    #[account(
        init,
        seeds = [
            MONO_DATA.as_bytes(),
            LANCER_DAO.as_bytes(),
            funds_mint.key().as_ref(),
        ],
        bump,
        payer = lancer_admin,
        token::mint = funds_mint,
        token::authority = program_authority,
    )]
    pub lancer_dao_token_account: Account<'info, TokenAccount>,

    ///CHECK: Controls lancer funds
    #[account(
        seeds = [
            LANCER_DAO.as_bytes(),
        ],
        bump,
    )]
    pub program_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

}

pub fn handler(_ctx: Context<CreateLancerTokenAccount>) -> Result<()>
{
    Ok(())
}