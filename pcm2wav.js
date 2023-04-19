const fs = require('fs');
const { Transform } = require('stream');

class PCMtoWAV extends Transform {
  constructor(options) {
    super(options);
    this.headerWritten = false;
  }

  _transform(chunk, encoding, callback) {
    if (!this.headerWritten) {
      this.push(this.getWavHeader(chunk.length));
      this.headerWritten = true;
    }
    this.push(chunk);
    callback();
  }

  getWavHeader(dataLength) {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(2, 22);
    header.writeUInt32LE(48000, 24);
    header.writeUInt32LE(48000 * 4, 28);
    header.writeUInt16LE(4, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    return header;
  }
}

async function convertPCMtoWAV(pcmFilePath, wavFilePath) {
  return new Promise((resolve, reject) => {
    const pcmStream = fs.createReadStream(pcmFilePath);
    const wavStream = fs.createWriteStream(wavFilePath);
    const converter = new PCMtoWAV();

    pcmStream.pipe(converter).pipe(wavStream);

    wavStream.on('finish', () => {
      resolve();
    });

    wavStream.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { convertPCMtoWAV };
