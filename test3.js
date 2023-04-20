const fs = require('fs');
const path = require('path');
const { Readable, PassThrough } = require('stream');
const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require('ytdl-core');

const PCMVolume = require('pcm-volume');


const { runPythonScript } = require('./run_python');
const { play_audio } = require('./voice-commands');
const { convertPCMtoWAV } = require('./pcm2wav');
const { end_of_stream } = require('./end_of_stream');

const Discord = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  createDiscordJSAdapter,
  EndBehaviorType,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');
const opus = require('@discordjs/opus');
const Prism = require('prism-media');
const AudioMixer = require('audio-mixer');

//const client = new Discord.Client();

const client = new Client({
  intents: Object.values(GatewayIntentBits).filter(Number.isInteger) // ALL Intents
});

// Noiseless stream of audio to send when the bot joins a voice channel
class Silence extends Readable {
  _read() {
    this.push(Buffer.from([0xF8, 0xFF, 0xFE]));
  }
}

const config = JSON.parse(fs.readFileSync('config.json'));

client.on('ready', () => {
  console.log(`Up and running.`);
});

client.on('messageCreate', async (ctx) => {
  if (!ctx.content.startsWith(config.prefix)) return;

  const command = ctx.content.slice(config.prefix.length).split(' ');

  switch (command[0]) {
    case 'join':
      console.log('join');
      client.on('debug', console.log);
      if (ctx.member.voice.channelId) {
        const channel = await client.channels.fetch(ctx.member.voice.channelId);

        const connection = await joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: false,
        });

        console.log('connection');

        // Create an AudioPlayer instance and play the Silence stream
        const player = createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        });
        connection.subscribe(player);

        const silenceResource = createAudioResource(new Silence(), { inputType: StreamType.Opus });
        player.play(silenceResource);

        console.log('y');

        ctx.channel.send("I'm listening.. My hotword is **bumblebee**.");
        console.log('x');

        connection.receiver.speaking.on('start', (userId) => {
          console.log('User started speaking: ', userId);
          const standaloneInput = new AudioMixer.Input({
            channels: 2,
            bitDepth: 16,
            sampleRate: 48000,
            volume: 100,
          });

          const audio = connection.receiver.subscribe(userId, {
            end: { behavior: EndBehaviorType.AfterSilence },
          });
          const rawStream = new PassThrough();
          audio.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })).pipe(rawStream);

          const resource = createAudioResource(rawStream, {
            inputType: StreamType.Raw,
          });

          function ensureDirectoryExists(filepath) {
            const dir = path.dirname(filepath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
          }

          const filepath = `./audio_file/discord_stream_audio/pcm_file/user_audio_${userId}.pcm`;
          ensureDirectoryExists(filepath);
          const fileStream = fs.createWriteStream(filepath);
          rawStream.pipe(fileStream);

          const volume = new PCMVolume();
          const pipedVolume = new PassThrough();

          audio.pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
            .pipe(volume)
            .pipe(pipedVolume)
            .pipe(rawStream);

          let silenceDuration = 0;
          const silenceThreshold = 1000;
          const silenceSampleThreshold = 0.5;

          function calculateRMS(samples){
            const squareSum = samples.reduce((sum, sample) => sum + (sample * sample), 0);
            const meanSquare = squareSum / samples.length;
            return Math.sqrt(meanSquare);}

          pipedVolume.on('data', (chunk) => {
            const samples = new Int16Array(chunk.buffer);
            const rms = calculateRMS(samples);
            console.log(`rms: ${rms}`);
            const isSilent = rms <= silenceSampleThreshold;

            if (isSilent) {
              silenceDuration += (chunk.length / 48000) * 1000;
              console.log(`Silence duration: ${silenceDuration}ms`);

              if (silenceDuration >= silenceThreshold){
                console.log(`over`);
                audio.unpipe(rawStream);
                rawStream.unpipe(fileStream);
                fileStream.end();

                processAudio(userId ,player);
              }
            } else {
              console.log(`not over`)
              silenceDuration = 0;
            }
          });
        });
      }
      break;
    }
  });
client.login(config.token);

async function processAudio(userId, player) {
  try {
    console.log('Stream ended.');

    const pcmFilePath = `./audio_file/discord_stream_audio/pcm_file/user_audio_${userId}.pcm`;
    const wavFilePath = `./audio_file/discord_stream_audio/wav_file/user_audio_${userId}.wav`;
    ensureDirectoryExists(wavFilePath);
    await convertPCMtoWAV(pcmFilePath, wavFilePath);
    await runPythonScript(wavFilePath);
    const outputWavFilePath = './audio_file/output_audio/output.wav';
    const readStream = fs.createReadStream(outputWavFilePath);
    const audioResource = createAudioResource(readStream, {
      inputType: StreamType.Arbitrary,
    });
    player.play(audioResource);

    await end_of_stream(player, 'finish');
    player.stop();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}
