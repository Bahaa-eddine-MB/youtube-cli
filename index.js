#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import chalkAnimation from "chalk-animation"
import ytsr from "ytsr";
import ytdl from "ytdl-core";
import { spawn } from "child_process"
import VLC from 'vlc-simple-player'

//const API_KEY = 'AIzaSyARn7hVQLIeX3954KZjgF8y2d9kpDumolM';

var results = []





let qu
let input
let limit
let x
let searchResults
let audio


const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms))
async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow(
        'Welcome to the youtube-cli presented by CLA\n'
    )
    await sleep()
    rainbowTitle.stop()

    console.log(`
${chalk.bgBlue("SEARCH FOR YOUR VIDEO :")}   
    `)
}
function play(title, url) {
    let options = [
        '--meta-title', title,
        '--play-and-exit', '--one-instance',
        '--no-qt-name-in-title', '--no-video-title-show',
        '--playlist-enqueue'
    ]

    options.push(url)

    return spawn("vlc", options, { detached: true, stdio: 'ignore' })
}

await welcome()

async function askSearch() {
    const answers = await inquirer.prompt({
        name: 'SearchInput',
        type: 'input',
        message: 'Enter an input keyword',

    })
    input = answers.SearchInput
}
async function askLimit() {
    const answers = await inquirer.prompt({
        name: 'Select',
        type: 'confirm',
        message: 'Do you want to select a search limit ?',

    })
    limit = answers.Select
}

async function askLimit2() {
    const answers = await inquirer.prompt({
        name: 'SearchInput',
        type: 'input',
        message: 'Please precise the limit',

    })
    x = answers.SearchInput
}

async function askAudio() {
    const answers = await inquirer.prompt({
        name: 'Select',
        type: 'confirm',
        message: 'Do you want to play audio only ?',

    })
    audio = answers.Select
}


await askSearch()
await askLimit()
if (limit) {
    await askLimit2()
    while (!Number(x)) {
        console.log(`
${chalk.bgRed("\nPlease enter a valid number!")}   
    `)
        await askLimit2()
    }
}


console.log(`Searching for ${chalk.bgBlue(input)} ...
    `)





async function videoSearch(term, lm) {
    searchResults = await ytsr(term);
    let i = 0

    await searchResults.items.map(function (obj) {
        if (obj.title != null && i < lm) {
            results.push(obj.title);
            i++
        }
    });


    // console.log(searchResults.items[0])
    await sleep()


}
if (!x) {
    x = 100
}
await videoSearch(input, x)

await sleep()

const answers = await inquirer.prompt({
    name: 'Search',
    type: 'list',
    message: 'choose a video from the following to display',
    choices: results
})
const videoIndex = results.indexOf(answers.Search)
let info = await ytdl.getInfo(searchResults.items[videoIndex].url);



await askAudio()

if (audio) {
let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
   
var player = new VLC(audioFormats[0].url)

player.on('statuschange', (error, status) => {
 // console.log('current time', status.time)
})

} else {
    const theQuality = await inquirer.prompt({
        name: 'Search',
        type: 'list',
        message: 'choose the video quality:',
        choices: ['360p', '480p', '720p', '1080p']
    })
    switch (theQuality.Search) {
        case theQuality.Search == "360p":
            qu = 134
            break;
        case theQuality.Search == "480p":
            qu = 135
            break;
        case theQuality.Search == "720p":
            qu = 247
            break;
        case theQuality.Search == "1080p":
            qu = 248
            break;

    }

    let format = ytdl.chooseFormat(info.formats, { quality: qu });
   // console.log(format.url);
    var player = new VLC(format.url)

player.on('statuschange', (error, status) => {
  console.log('current time', status.time)
})


}





// console.log('Format found!', format);
// console.log(info);



// let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
// // console.log('Formats with only audio: ' + audioFormats.length);
//  await play(searchResults.items[videoIndex].title,format.url)
