const fs = require("fs");
const path = require("path");
const { Readable, PassThrough } = require("stream");
const { Client, GatewayIntentBits } = require("discord.js");
const ytdl = require("ytdl-core");
const wav = require("wav");


const PCMVolume = require("pcm-volume");

const { runPythonScript } = require("./run_python");
const { play_audio } = require("./voice-commands");
const { end_of_stream } = require("./end_of_stream");

const Discord = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  createDiscordJSAdapter,
  EndBehaviorType,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const opus = require("@discordjs/opus");
const Prism = require("prism-media");
const AudioMixer = require("audio-mixer");

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(Number.isInteger), // ALL Intents
});

class Silence extends Readable {
  _read() {
    this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
  }
}

const config = JSON.parse(fs.readFileSync("config.json"));

client.on("ready", () => {
  console.log(`Up and running.`);
});

const silenceTimeouts = {};

function handleSilenceTimeout(userId,player,time,) {
  console.log("Silence duration reached. Stopping recording.");
  clearTimeout(silenceTimeouts[userId]);
  silenceTimeouts[userId] = null;
  processAudio(userId, player, time);
}

client.on("messageCreate", async (ctx) => {
  if (!ctx.content.startsWith(config.prefix)) return;

  const command = ctx.content.slice(config.prefix.length).split(" ");

  switch (command[0]) {
    case "join":
      console.log("join");
      client.on("debug", console.log);
      if (ctx.member.voice.channelId) {
        const channel = await client.channels.fetch(ctx.member.voice.channelId);

        const connection = await joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        });

        console.log("connection");

        const player = createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        });
        connection.subscribe(player);

        const silenceResource = createAudioResource(new Silence(), { inputType: StreamType.Opus });
        player.play(silenceResource);

        console.log("y");

        ctx.channel.send("I'm listening.. My hotword is **bumblebee**.");
        console.log("x");

        connection.receiver.speaking.on("start", (userId) => {
          console.log("User started speaking: ", userId);
          if (silenceTimeouts[userId]) {
            clearTimeout(silenceTimeouts[userId]);
            silenceTimeouts[userId] = null;
          }

          const audio = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence, duration: 5000 },
          });
          const rawStream = new PassThrough();
          const time = Date.now();
          const filepath = `./audio_file/discord_stream_audio/pcm_file/user_audio_${userId}_${time}.pcm`;
          ensureDirectoryExists(filepath);
          const fileStream = fs.createWriteStream(filepath);

          audio.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })).pipe(rawStream).pipe(fileStream);

          connection.receiver.speaking.on("end", (userId) => {
            audio.unpipe(rawStream);
            rawStream.unpipe(fileStream);    
            fileStream.end();
            console.log("User stopped speaking: ", userId);
            silenceTimeouts[userId] = setTimeout(
              () => handleSilenceTimeout(userId,player,time),
              5000 // 無音期間の duration (ミリ秒)
            );
            console.log("over");
          });
        });
      }
      break;
  }
});
client.login(config.token);

  

async function processAudio(userId,player,time) {
  try {
    console.log("Stream ended.");

    const pcmFilePath = path.resolve(`./audio_file/discord_stream_audio/pcm_file/user_audio_${userId}_${time}.pcm`);
    const wavFilePath = path.resolve(`./audio_file/discord_stream_audio/wav_file/user_audio_${userId}_${time}.wav`);

    const writer = new wav.FileWriter(wavFilePath, {
      sampleRate: 48000,
      channels: 2,
    });

    const fileStream = fs.createReadStream(pcmFilePath);
    fileStream.pipe(writer);

    await new Promise((resolve) => writer.on("finish", resolve));

    await runPythonScript(wavFilePath).then((result) => {
      console.log("Received output file path:", result);
      const audioFileStream = fs.createReadStream(result);
      const audioResource = createAudioResource(audioFileStream, {
        inputType: StreamType.Arbitrary,
      });
      player.play(audioResource);

      player.on("finish", () => {
        player.stop();
        console.log("finish");
      });
    }).catch((error) => {
      console.log("Error occurred:", error);
    });

    player.on("finish", () => {
      player.stop();
      console.log("finish");
    });
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

function ensureDirectoryExists(filepath) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
