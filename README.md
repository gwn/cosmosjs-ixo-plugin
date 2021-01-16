## ixo Plugin for the CosmosJS Client

This plugin extends the Cosmos client provided by the
@cosmostation/cosmosjs package to include ixo specific
functionalities such as DID generation, DID based address
generation and signatures.


### Usage

    const
        cosmosjs = require('@cosmostation/cosmosjs'),
        ixoify = require('@ixo/cosmosjs-ixo-plugin')

    const cosmos = ixoify(cosmosjs.network('blockchain-url', 'chain-id'))

    // You now have access to extra methods on the client instance
    // such as cosmos.getDid


### API

This plugin makes available the following methods on the cosmosjs
client:

- `getDid`: Derive a DID from a given mnemonic

- `getClaimsAddress`: Similar to the original `getAddress` address
  generator method. Derives an address from a DID instead of a
  mnemonic directly. Addresses generated via this function are
  meant to be used with the ixo claim wallets.

- `signClaim`: Similar to the original `sign` method. Signs
  message with a DID instead of a SECP256 private key directly.
  Meant to be used to sign claim related messages.
