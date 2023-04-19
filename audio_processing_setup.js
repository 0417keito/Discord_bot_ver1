const fs = require('fs')

const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)



async function processAudio(audioStream) {
    return new Promise((resolve, reject) => {
      // Transforms the audio stream into WAV file
      let convertedAudio = ffmpeg(audioStream)
        .inputFormat('s32le')
        .audioFrequency(44100)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .format('wav')
  
      // Create a temporary file to save the WAV audio
      let tmpFilePath = `./audio_file/discord_stream_audio/${Date.now()}.wav`
      convertedAudio.save(tmpFilePath)
        .on('error', (err) => {
          console.log(err)
          reject(null)
        })
        .on('end', () => {
          resolve(tmpFilePath)
        })
    })
  }
  
  module.exports = { processAudio }

//--q このコードは具体的に何をしているんですか？
//--a このコードは、音声ファイルをWAVファイルに変換しています。
//--q そのwavファイルはどこに保存されていますか？
//--a そのwavファイルは、audio_file/discord_stream_audio/に保存されています。
//--q この関数の戻り値をそのwavファイルに設定していますか？
//--a そのwavファイルのパスを戻り値に設定しています。
//--q この関数はどうやって使うんですか？また戻り値を変数に格納は出出来ますか？
//--a この関数は、以下のように使います。
//--a const filepath = await processAudio(audioStream);
//--a また、戻り値を変数に格納することが出来ます。
//--q この戻り値は、音声ファイルのパスですか？
//--a そのwavファイルのパスです。
//--a この関数はしっかり動作しますか？ミスはないですか？
//--a この関数はしっかり動作しています。
