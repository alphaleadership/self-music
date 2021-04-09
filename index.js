/*
Discord: NaN#7070
https://alexbeats.tk
*/

const Eris = require('eris');
const term = require('terminal-kit').terminal;
const chalk = require('chalk');
const fs = require('fs');
const tts = require('google-tts-api');
const ytdl = require('ytdl-core');

console.clear();
console.clear();
term.magenta('Enter your discord token: ')
term.inputField((err, input) => {
    if (err) return console.log(err);
    const client = new Eris(input);
    client.connect()
        .catch(() => process.exit(0));
    console.clear();
    console.clear();
    term.magenta('Set your voiceChannel ID: ')
    term.inputField((err, inputChannelID) => {
        if (err) return console.log(err);
        fs.readdir('./music', (err, files) => {
            if (err) return console.log(err);
            if (client.getChannel(inputChannelID) === undefined) return process.exit(0);
            const choose = () => {
                console.clear();
                console.clear();
                console.log(`${chalk.red(`Choose a file to play into ${client.getChannel(inputChannelID).name}`)} (type number between 0 - ${files.length - 1})\n`);
                let pos = 0;
                console.log(`${chalk.red('exit')} - For exit`);
                console.log(`${chalk.red('tts')} - For say text in vocal`);
                console.log(`${chalk.red('play')} - For play music from youtube\n`);
                files.map(file => {
                    console.log(`${chalk.red(pos)} - ${file}`);
                    pos++;
                });
                term.magenta('\nSet your command (or ID for play a file): ');
                term.inputField(async (err, inputID) => {
                    inputID = inputID.split(' ');
                    if (err) return console.log(err);
                    if (inputID.length === 0) return choose();
                    if (inputID[0] == 'exit') return process.exit(0);
                    if (inputID[0] == 'tts') {
                        inputID.shift();
                        console.log('\nStart of playing ...');
                        const url = tts.getAudioUrl(inputID.join(''), {
                            lang: 'fr',
                            slow: false,
                            host: 'https://translate.google.com'
                        });
                        return client.joinVoiceChannel(inputChannelID)
                            .then(connection => {
                                if (connection.playing) connection.stopPlaying();
                                connection.play(url);
                                connection.once('end', () => {
                                    return choose();
                                });
                            })
                            .catch((err) => console.log(err));
                    };
                    if (inputID[0] == 'play') {
                        inputID.shift();
                        if (inputID == "") return process.exit(0);
                        console.log('\nStart of playing ...');
                        const info = await ytdl.getInfo(inputID[0].split('').reverse().join('').split('=')[0].split('').reverse().join(''));
                        const audioStream = await ytdl.filterFormats(info.formats, 'audioonly')[0].url;
                        return client.joinVoiceChannel(inputChannelID)
                            .then(connection => {
                                if (connection.playing) connection.stopPlaying();
                                connection.play(audioStream);
                                connection.once('end', () => {
                                    return choose();
                                });
                            })
                            .catch((err) => console.log(err));
                    }
                    if (isNaN(inputID[0])) return choose();
                    if (Number(inputID[0]) > files.length || Number(inputID[0]) < 0) return choose();
                    inputID = Number(inputID[0]);

                    client.joinVoiceChannel(inputChannelID)
                        .then(connection => {
                            if (connection.playing) connection.stopPlaying();
                            console.log('\nStart of playing ...');
                            connection.play(`./music/${files[inputID]}`);
                            connection.once('end', () => {
                                choose();
                            });
                        })
                        .catch((err) => console.log(err));
                });
            };
            choose();
        });
    });
});
