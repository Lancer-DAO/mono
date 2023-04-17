use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Mint, TokenAccount, Transfer, self};

use crate::{constants::{MONO_DATA, LANCER_DAO, LANCER_ADMIN}, errors::MonoError};


#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    
    #[account(
        mut,
        address = LANCER_ADMIN @ MonoError::InvalidAdmin,
    )]
    pub lancer_admin: Signer<'info>,

    #[account()]
    pub withdrawer: SystemAccount<'info>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = withdrawer,
    )]
    pub withdrawer_token_account: Account<'info, TokenAccount>,

    #[account()]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [
            MONO_DATA.as_bytes(),
            LANCER_DAO.as_bytes(),
            mint.key().as_ref(),
        ],
        bump,
        token::mint = mint,
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


    pub token_program: Program<'info, Token>,

}

impl<'info> WithdrawTokens<'info> {
    fn withdraw_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info().clone(),
          Transfer {
            from: self.lancer_dao_token_account.to_account_info(),
            to: self.withdrawer_token_account.to_account_info(),
            authority: self.lancer_token_program_authority.to_account_info(),
        })
    }
}

pub fn handler(ctx: Context<WithdrawTokens>, amount: u64, withdraw_bump: u8) -> Result<()>
{
    let withdraw_seeds = &[
        LANCER_DAO.as_bytes(),
        &[withdraw_bump]
    ];
    let withdraw_signer = [&withdraw_seeds[..]];

    token::transfer(
        ctx.accounts.withdraw_context().with_signer(&withdraw_signer),
        amount
    )?;
    
    Ok(())
}