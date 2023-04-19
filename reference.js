const Discord = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  createDiscordJSAdapter,
} = require('@discordjs/voice');
const fs = require('fs');
const opus = require('opus');
const PCMConverter = require('pcm-converter');

const client = new Discord.Client();

client.on('voiceStateUpdate', async (oldState, newState) => {
  // User joined a voice channel
  if (!oldState.channelId && newState.channelId) {
    const connection = joinVoiceChannel({
      channelId: newState.channelId,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });

    connection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Ready) {
        const receiver = connection.receiver.createStream(newState.member.user.id, { mode: 'pcm', end: 'manual' });

        // Create an Opus encoder
        const encoder = new opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });

        // Create a write stream for the Opus file
        const fileStream = fs.createWriteStream(`./${newState.member.user.id}_audio.opus`);

        receiver.on('data', (chunk) => {
          // Convert PCM data to Opus
          const opusData = encoder.encode(PCMConverter.fromInt16(chunk));
          fileStream.write(opusData);
        });

        receiver.on('end', () => {
          // Close the Opus file and clean up the resources
          fileStream.end();
          encoder.delete();
          console.log(`Finished recording for user ${newState.member.user.tag}`);
        });
      }
    });
  }
});

client.login('your-bot-token');