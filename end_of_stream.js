const end_of_stream = (stream, event) => {
    return new Promise((resolve, reject) => {
      stream.on(event, resolve);
      stream.on('error', reject);
    });
  };

  module.exports = { end_of_stream }