/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-waffle");

const { PrivateKey } = require('./secret.json');

module.exports = {
   defaultNetwork: 'testnet',

   networks: {
      hardhat: {},
      testnet: {
         url: 'https://rpc.test2.btcs.network',
         accounts: ['e0a951788665661e6e049e6adbf8d732de612898e5cba335cc64bd27ad8c661d'], 
         chainId: 1114, 
      }
   },
   solidity: {
      compilers: [
        {
           version: '0.8.24', 
           settings: {
              evmVersion: 'shanghai', 
              optimizer: {
                 enabled: true,
                 runs: 200,
              },
           },
        },
      ],
   },
   paths: {
      sources: './contracts',
      cache: './cache',
      artifacts: './artifacts',
   },
   mocha: {
      timeout: 20000,
   },
};
