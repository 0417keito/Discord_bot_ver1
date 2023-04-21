const { PythonShell } = require("python-shell");

async function runPythonScript(filePath) {
  return new Promise((resolve, reject) => {
    const options = {
      pythonPath: "C:\\Users\\mnooh\\anaconda3\\envs\\fist_env\\python.exe",
      args: [filePath],
    };

    PythonShell.run("./running.py", options, (err, results) => {
      if (err) {
        console.error("Error occurred while running Python script:", err);
        reject(err);
      } else {
        console.log("Python script executed successfully.");
        console.log("Results:", results);
        resolve(results[0]);
      }
    });
  });
}

module.exports = { runPythonScript };
