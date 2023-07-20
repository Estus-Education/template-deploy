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
        enable_network: true,
        language_id: 89,
        additional_files: content,
      });

        const { token } = response.data;

        const fetchURL = `${BASE_URL}/${ROUTE}/${token}?fields=source_code,language_id,stdin,expected_output,stdout,status_id,created_at,finished_at,time,memory,stderr,token,number_of_runs,cpu_time_limit,cpu_extra_time,wall_time_limit,memory_limit,stack_limit,max_processes_and_or_threads,enable_per_process_and_thread_time_limit,enable_per_process_and_thread_memory_limit,max_file_size,exit_code,exit_signal,message,wall_time,compiler_options,command_line_arguments,redirect_stderr_to_stdout,callback_url,enable_network,started_at,queued_at,updated_at,queue_host,execution_host,status,language`;
        
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