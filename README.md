<p align="center">
    <img src="https://github.com/Zaetic/Twitch-Easy/blob/master/images/twitch_easy.png?raw=true" alt="twitch easy">
</p>
<p align="center">
    <a href="https://github.com/airbnb/javascript"><img src="https://img.shields.io/badge/Code--style-Airbnb-red?logo=Airbnb&style=flat-square"></a>
    <a href="https://prettier.io/"><img src="https://img.shields.io/badge/-Prettier-grey?logo=Prettier&style=flat-square"></a>
    <a href="https://www.npmjs.com/package/twitch-easy"><img src="https://img.shields.io/npm/v/twitch-easy?color=blue&logo=npm&style=flat-square"></a>
</p>

Hey, do you want an easy connection to the Twitch API?? I am here to solve this problem!!

I'm an opensouce wrapper that makes the connection with the twitch `Helix API` and i was built to be fast and very easy to use!!

## Installation

To add Twitch Easy to your project, just execute:

```bash
$ npm i --save twitch-easy
```
or
```bash
$ yarn add twitch-easy
```

## Contents

-   [Getting Started](#getting-started)
-   [Modules System](#modules-system)
-   [Functions](#functions)

## Getting started

### Calling

```js
const TwitchEasy = require('twitch-easy');

const api = new TwitchEasy('CLIENT_ID', 'CLIENT_SECRET');
```

It is necessary to pass a `client_id` and `client_secret`, for this information go to: https://dev.twitch.tv/console

### Example

```js
const twitchEasy = require('twitch-easy');

const api = new twitchEasy.Client('CLIENT_ID', 'CLIENT_SECRET');

const getStreamer = async () => {
    const streamer = await api.streamers.getStreamerByName('streamer_name');
    console.log(streamer);
    return streamer;
}

getStreamer();
```

## Modules System

The module system separates the modules into categories:
- Clips
- Games
- Streamers

After acessing any of the modules you have access to all the respective functions.

### Example

In the case we are accessing two different modules,`streamers` e `clips` , and calling functions.
```js
const accessModules = async () => {
    const streamer = await api.streamers.getStreamerByName('streamer_name');
    console.log(streamer);
    const clips = await api.clips.getClips({ quantity: 100, id: '1' });
    console.log(clips)
}

accessModules();
```

## Functions

- Clips
    - `getClips ({ quantity?, id?, gameId?, broadcasterId? })` - Returns a array list referring to the clips by one param
- Games
    - `getTopGames (quantity)` - Returns a array list referring to the top games of Twitch

    - `getGameByName (name)` - Returns a object referring to the games by the name

    - `getGameById (id)` - Returns a object referring to the games by the id

- Streamers
    - `getStreamerByName (name)` - Returns object referring to the searched streamer name
    
    - `getStreamersByName ({ name, quantity, paginator?, retry? })` - Returns a array list referring to the searched streamer name

    - `getStreamerOnline (id)` - Returns object referring to the searched online streamer id

    - `getStreamersOnline ({ name, quantity, paginator?, retry? })` - Returns a array list referring to the searched online streamer id
