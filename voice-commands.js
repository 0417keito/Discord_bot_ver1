const fs = require('fs')

const ytdl = require('ytdl-core')
const ytsr = require('ytsr')
ytsr.do_warn_deprecate = false


let config = JSON.parse(fs.readFileSync('config.json'))
let servers = new Map()


async function play_audio(connection, ctx, audio_file) {
    let server = server.get(ctx.guild.id)

    server.dispatcher = connection.play(ytdl(audio_file, { filter: 'audioonly' }, () => {}, true))
}

module.exports = { play_audio }