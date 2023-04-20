#  PREREQUESITES
   [solana-cli](https://docs.solana.com/cli/install-solana-cli-tools)
   
   [anchor-cli](https://www.anchor-lang.com/docs/installation)
# How to Deploy

    mkdir deploy
    cd deploy

    solana-keygen grind --starts-with Lanc:1
    

This will create a pubkey where the program will be deployed, the program will have an address that begins with `Lanc`.
You can obtain the generated address using 
`solana address -k Lanc......json`

Copy the pubkey of the generated address(Lanc.......json) and replace it in the constant(MONO_DEVNET) at `src/constants.ts` and `declare_id!("Lanc.....")` at `src/lib.rs`. Then replace constant(LANCER_ADMIN) in `sdk/constants.ts` and`src/constants.rs` with your `ADMIN_PUBKEY`. This tells the deployed contract to give restricted access to this pubkey alone.
You can also replace the pubkey in `Anchor.toml`

    [programs.localnet]
    mono_program = "LancmbegcoDpgsDHwkgyMA6Aezqh7uPrNCX5V4gsWx8"
 This will deploy the contract to the same address for localnet testing. 

 -----------------------------------------------------------------
 

     anchor build

This will copy the executable to be deployed.

    cp ../target/deploy/mono_program.so lancer.so

Copy the executable to the newly created folder specifically to deploy.




    solana config set --url <URL_PROVIDER>
    
 
 This sets the network environment on which the program will be deployed. 
 

    solana program deploy LancmbegcoDpgsDHwkgyMA6Aezqh7uPrNCX5V4gsWx8.so
This will deploy the program to the selected network at our generated address.

Instructions with restricted access for only the admin Include

    createLancerTokenAccountInstruction - creates a new token account per mint(this is where lancer fees are stored). Can be called only once.
    
    createLancerTokensInstruction - creates 2 new tokens Lancer Company and Lancer Completer tokens. Can only be Called once.

    withdrawTokensInstruction - Instruction to withdraw tokens from lancer token account(works for any mint). Can be called multiple times.
