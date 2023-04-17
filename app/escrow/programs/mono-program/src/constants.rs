use anchor_lang::{prelude::Pubkey, solana_program::pubkey};


pub const MAX_NO_OF_SUBMITTERS: usize = 3;
pub const MIN_NO_OF_SUBMITTERS: usize = 1;
pub const MONO_DATA: &str = "mono";
pub const LANCER_COMPLETER_TOKENS: &str = "lancer_completer_tokens";
pub const LANCER_COMPANY_TOKENS: &str = "lancer_company_tokens";
pub const FEE: u64 = 5;
pub const COMPLETER_FEE: u64 = 95;
pub const THIRD_PARTY_FEE: u64 = 10;
pub const MINT_DECIMALS: u8 = 9;
pub static LANCER_ADMIN: Pubkey = pubkey!("GkPdSq1LMrJDGHrxdpTntFuhkrjmBm6RyJCSWPGSZg8J");
pub const MINT_AUTHORITY: &str = "mint_authority";
pub const PERCENT: u64 = 100;
pub const LANCER_DAO: &str = "LANCER_DAO";