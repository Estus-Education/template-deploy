require("@nomicfoundation/hardhat-toolbox");

// require('./build.js');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: '0.8.5',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
  },
  paths: {
    sources: './src',
    tests: './src'
  }
};
