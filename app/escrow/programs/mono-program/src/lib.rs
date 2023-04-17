use anchor_lang::prelude::*;


mod constants;
mod errors;
mod state;
mod instructions;

use crate::instructions::*;


declare_id!("Gu2VCpw4RagQ5gtxENrdXydPjyioEZqXgcyP2mf89xfA");


#[program]
pub mod mono_program {
    use super::*;

    pub fn create_feature_funding_account(
        ctx: Context<CreateFeatureFundingAccount>,
        unix_timestamp: String,
    ) -> Result<()> {
        create_feature_funding_account::handler(ctx, unix_timestamp)
    }

    pub fn fund_feature(ctx: Context<FundFeature>, amount: u64) -> Result<()>
    {
        fund_feature::handler(ctx, amount)
    }

    pub fn add_approved_submitters(ctx: Context<AddApprovedSubmitters>) -> Result<()>
    {
        add_approved_submitters::handler(ctx)
    }

    pub fn submit_request(ctx: Context<SubmitRequest>) -> Result<()>
    {
        submit_request::handler(ctx)
    }

    pub fn approve_request(ctx: Context<ApproveRequest>, mint_bump: u8) -> Result<()>
    {
        approve_request::handler(ctx, mint_bump)
    }

    pub fn deny_request(ctx: Context<DenyRequest>) -> Result<()>
    {
        deny_request::handler(ctx)
    }

    pub fn vote_to_cancel(ctx: Context<VoteToCancel>, is_cancel: bool) -> Result<()>
    {
        vote_to_cancel::handler(ctx, is_cancel)
    }

    pub fn cancel_feature(ctx: Context<CancelFeature>) -> Result<()>
    {
        cancel_feature::handler(ctx)
    }

    pub fn remove_approved_submitters(ctx: Context<RemoveApprovedSubmitters>) -> Result<()>
    {
        remove_approved_submitters::handler(ctx)
    }

    pub fn create_lancer_token_account(ctx: Context<CreateLancerTokenAccount>) -> Result<()>
    {
        create_lancer_token_account::handler(ctx)
    }

    pub fn create_lancer_tokens(ctx: Context<CreateLancerTokens>) -> Result<()>
    {
        create_lancer_tokens::handler(ctx)
    }

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64, withdraw_bump: u8) -> Result<()> {
        withdraw_tokens::handler(ctx, amount, withdraw_bump)
    }

    pub fn approve_request_third_party(ctx: Context<ApproveRequestThirdParty>, bump: u8) -> Result<()> {
        approve_request_third_party::handler(ctx, bump)
    }

}



