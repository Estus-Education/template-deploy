const fs = require('fs');
const axios = require('axios');
const JSZip = require('jszip');

const BASE_URL = process.env.BASE_URL;
const ROUTE = process.env.ROUTE_SUBMISSION;

const buildContents = fs.readFileSync("./build.js").toString();
const hardhatContents = fs.readFileSync("./hardhat.config.js").toString();
const packageLockContents = fs.readFileSync("./package-lock.json").toString();
const packageContents = fs.readFileSync("./package.json").toString();
const runContents = fs.readFileSync("./run").toString();

const testContents = fs.readFileSync("./src/test.js").toString();
const tokenContents = fs.readFileSync("./src/token.sol").toString();

function formatStream(outputStream) {
    return atob(outputStream.replace(/(\r\n|\n|\r)/gm, ""));
}

const url = `${BASE_URL}/${ROUTE}/?base64_encoded=true`;

(async () => {
    const zip = new JSZip();
    zip.file("build.js", buildContents);
    zip.file("hardhat.config.js", hardhatContents);
    zip.file("package-lock.json", packageLockContents);
    zip.file("package.json", packageContents);
    zip.file("run", runContents);

    const contractsFolder = zip.folder("src");
    contractsFolder.file("test.js", testContents)
    contractsFolder.file("token.sol", tokenContents)

    const content = await zip.generateAsync({ type: "base64" });

    try {
      console.time('call');  
      const response = await axios.post(url, {
        language_id: 89,
        memory_limit: 1024000,
        stack_limit: 512000,
        additional_files: content,
      });

        const { token } = response.data;

        const fetchURL = `${BASE_URL}/${ROUTE}/${token}`;

        setInterval(async () => {
            const response = await axios.get(fetchURL);

            const { data: { status, stdout, stderr } } = response;

            if (status.id > 2) {
                if (stderr) {
                    console.timeEnd('call'); 
                    console.log(formatStream(stderr));
                }
                else {
                    console.timeEnd('call'); 
                    console.log(formatStream(stdout));
                }
                
                process.exit();
            }
        }, 1000);
    } catch (err) {
        console.log(err.message);
    }
})();