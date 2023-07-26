export interface Bounty {
  id: number;
  createdAt: string;
  description: string;
  estimatedTime: string;
  isPrivate: boolean;
  state: string;
  title: string;
  type?: any;
  escrowid: number;
  milestoneid?: string;
  projectid?: string;
  guildid?: string;
  repositoryid?: string;
  repository?: any;
  escrow: Escrow;
  users: User[];
  issue?: any;
  tags: Tag[];
  pullRequests: any[];
}

export interface Escrow {
  id: number;
  amount: string;
  publicKey: string;
  timestamp: string;
  chainid: number;
  milestoneid?: string;
  mintid: number;
  transactions: Transaction[];
  mint: Mint;
}

export interface Mint {
  id: number;
  name: string;
  ticker: string;
  logo: string;
  publicKey: string;
  website?: string;
  decimals: number;
  defaultOffset: number;
}

export interface Transaction {
  id: number;
  signature: string;
  timestamp: string;
  label: string;
  chainid: number;
  escrowid: number;
  wallets: Wallet[];
}

export interface Wallet {
  walletid: number;
  transactionid: number;
  relations: string;
}

export interface Tag {
  id: number;
  color?: string;
  description?: string;
  name: string;
}

export interface User {
  userid: number;
  bountyid: number;
  walletid: number;
  relations: string;
  onChainPublicKey: string;
  user: UserClass;
}

export interface UserClass {
  id: number;
  isAdmin?: boolean;
  verified?: boolean;
  hasProfileNFT: boolean;
  githubID?: string;
  googleID?: string;
  githubLogin: string;
  picture: string;
  name?: string;
  discord?: string;
  twitter?: string;
  instagram?: string;
  email: string;
  profileWalletID: number;
  refferralTreasuryKey?: string;
  referralID?: string;
  createdAt: string;
}
