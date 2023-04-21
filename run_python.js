const { PythonShell } = require("python-shell");

async function runPythonScript(filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: "C:\\Users\\mnooh\\anaconda3\\envs\\fist_env\\python.exe",
      pythonOptions: ['-u'], 
      scriptPath: "./",
      args: [filePath],
      //command: 'python3 running.py ${filePath}'
    };

    console.log(`start`); //このログを追加
    
    const pyshell = new PythonShell("./running.py", options);
    let outputFilePath;

    pyshell.on("message", function (message) {
      console.log("PythonShell message:", message);
      outputFilePath = message;
    });

    pyshell.end((err, results) => {
      if (err) {
        console.error("Error occurred while running Python script:", err);
        reject(err);
      } else {
        console.log("Python script executed successfully.");
        console.log("Results:", results);
        resolve(outputFilePath);
      }
    });

    /*
    PythonShell.run('./running.py', options, (err, results) => {
      if (err) {
        console.error("Error occurred while running Python script:", err);
        reject(err);
      } else {
        console.log("Python script executed successfully.");
        console.log("Results:", results);
        resolve(results[0]);
      }
      resolve();
    });
    */
  });
}

module.exports = { runPythonScript };
