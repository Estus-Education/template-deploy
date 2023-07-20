const { run } = require('hardhat');
const fs = require('fs');
const chmodr = require('chmodr');
const path = require('path');

async function writeCache(){
    const srcSolc = path.resolve(
      __dirname,
      '..',
      'usr',
      '.cache',
      'hardhat-nodejs',
      'compilers-v2',
      'linux-amd64',
    );

    const destSolc = path.resolve(
      __dirname,
      '..',
      'tmp',
      '.cache',
      'hardhat-nodejs',
      'compilers-v2',
      'linux-amd64',
    );

    await Promise.all(
      [
        fs.copyFile(
            `${srcSolc}/list.json`, 
            `${destSolc}/list.json`, 
            () => {}
        ),
        fs.copyFile(
          `${srcSolc}/${process.argv[2]}`,
          `${destSolc}/${process.argv[2]}`,
          () => {}
        ),
      ]
    )

    chmodr(destSolc, 0o777, (err) => {
        if (err) {
            console.log('error');
        } else {
            run('test');
        }
    }); 
}

writeCache()


