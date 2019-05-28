#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');

function write(stream, size) {

  return new Promise(resolve => {

    let chunk = createChunk(size);

    stream.write(chunk, () => {

      chunk = null;
      console.log(`Wrote ${size} bytes...`);
      resolve();

    });

  });

}

async function writeMany(stream, size, times) {

  for ( let i = 0; i < times; i++ ) {

    console.log(`Writing chunk ${i+1}/${times}`);
    await write(stream, size);

  }

  return;

}

function createChunk(size) {

  const charset = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  let chunk = '';

  for ( let i = 0; i < size; i++ ) {

    chunk += charset[Math.floor(Math.random() * charset.length)];

  }

  return chunk;

}

program
  .usage('<filename> <size>')
  .action((filename, size) => {

    if ( typeof filename !== 'string' || typeof size !== 'string' ) {

      console.log('Both filename and size must be provided!');
      process.exit(1);

    }

    const bMatch = size.match(/^(\d+)$/i);
    const kbMatch = size.match(/^(\d+)kb$/i);
    const mbMatch = size.match(/^(\d+)mb/i);
    const gbMatch = size.match(/^(\d+)gb/i);
    const filepath = path.join('.', filename);
    let chunkSize = 0;

    if ( bMatch ) size = +bMatch[1];
    if ( kbMatch ) size = +kbMatch[1] * 1000;
    if ( mbMatch ) size = +mbMatch[1] * 1000 * 1000;
    if ( gbMatch ) size = +gbMatch[1] * 1000 * 1000 * 1000;

    chunkSize = Math.floor(size / 10);

    if ( ! chunkSize ) chunkSize = 256;
    if ( chunkSize > 10 * 1000 * 1000 ) chunkSize = 10 * 1000 * 1000;

    const stream = fs.createWriteStream(filepath, { highWaterMark: chunkSize });

    const rounds = Math.floor(size / chunkSize);
    const lastRound = size % chunkSize;

    writeMany(stream, chunkSize, rounds)
    .then(() => {

      stream.end(createChunk(lastRound), () => {

        console.log('File has been generated.');

      });

    })
    .catch(console.log);

  })
  .parse(process.argv);
