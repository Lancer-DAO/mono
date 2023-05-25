export const LOCAL_EXT_ID = "nenaophjhbollmlklbamcmbbfgjlcjpk";
export const LIVE_EXT_ID = "nenaophjhbollmlklbamcmbbfgjlcjpk";
export const EXTENSION_ID =
  process.env.NODE_ENV === "production" ? LIVE_EXT_ID : LOCAL_EXT_ID;
