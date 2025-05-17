/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-waffle");

const { PrivateKey } = require('./secret.json');

module.exports = {
   defaultNetwork: 'testnet',

   networks: {
      hardhat: {
      },
      testnet: {
         url: 'https://rpc.test.btcs.network',
         accounts: ['e0a951788665661e6e049e6adbf8d732de612898e5cba335cc64bd27ad8c661d'],
         chainId: 1115,  // Ensure this matches the Core testnet chain ID
      }
   },
   solidity: {
      compilers: [
        {
           version: '0.8.21',  // Update to at least 0.8.20 to support the 'paris' EVM
           settings: {
              evmVersion: 'paris',  // Specify 'paris' EVM version
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
      timeout: 20000,  // You can adjust the timeout as needed
   },
};