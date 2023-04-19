const { spawn } = require('child_process')

async function runPythonScript(filePath) {
  return new Promise((resolve, reject) => {
    // 実行する Python スクリプトのパスと引数を指定
    const python = spawn('python', ['./running.py', filePath])

    // 標準出力を取得
    python.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    // 標準エラー出力を取得
    python.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    // 実行完了時の処理
    python.on('close', (code) => {
      if (code === 0) {
        console.log('Python script executed successfully.')
        resolve()
      } else {
        console.error(`Python script execution failed with code ${code}.`)
        reject()
      }
    })
  })
}

module.exports = { runPythonScript }

