<p align="center">
    <img src="https://github.com/Zaetic/Twitch-Easy/blob/master/images/twitch_easy.png?raw=true" alt="twitch easy">
</p>
<p align="center">
    <a href="https://github.com/airbnb/javascript"><img src="https://img.shields.io/badge/Code--style-Airnb-red?logo=Airbnb&style=flat-square"></a>
    <a href="https://prettier.io/"><img src="https://img.shields.io/badge/-Prettier-grey?logo=Prettier&style=flat-square"></a>
    <a href="https://www.npmjs.com/package/twitch-easy"><img src="https://img.shields.io/npm/v/twitch-easy?color=blue&logo=npm&style=flat-square"></a>
</p>

Hey, do you want an easy connection to the Twitch API ?? I am here to solve this problem !!

I am an opensouce wrapper that makes the connection with the twitch `Helix API` and i was built to be fast and very easy to use !! 

## Installation

To add Twitch Easy to your project, just execute:

``` bash 
$ npm i --save twitch
```

## Contents

- [Getting Started](#getting-started)
- [Functions](#functions)

## Getting started

### Calling
``` js
const TwitchEasy = require('twitch-easy');

const api = new TwitchEasy('CLIENT_ID', 'CLIENT_SECRET')
```
It is necessary to pass a client_id and client_secret, to get this information acess: https://dev.twitch.tv/console

### Example
``` js
const TwitchEasy = require('twitch-easy');

const api = new TwitchEasy('CLIENT_ID', 'CLIENT_SECRET')

async function getStreamer(){
    const streamer = await api.getStreamers('streamer_name');
    console.log(streamer);
    return streamer;
}

getStreamer();
```

## Functions

`getStreamers (name, qnt)` - Returns a array list referring to the searched streamer name

`getStreamerById (id)` - Returns a streamer by id