const Discord = require("discord.js")
const client = new Discord.Client()
const {prefix, token, clientID, generalChannelID, botID,
        ownerKey, openWeatherAPIKey, mapboxPublicKey} = require("./config.json");
// const client_presence = require('discord-rich-presence')(ownerKey);
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");

// USE FOR PULLING https://stackoverflow.com/a/9695141/14151099

// Can trigger multiple times (unlike .once)
client.on("ready", () =>{

    // var activityIndex = 0;
    // // Updates Bot's activity every 30 minutes.
    // setInterval(() => {
    //     var activityList = ["📺Youtube📺", "📺outubeY📺", "📺utubeYo📺", "📺tubeYou📺",
    //     "📺ubeYout📺", "📺beYoutu📺", "📺eYoutub📺"]
    //     client.user.setActivity(activityList[activityIndex], {type:"WATCHING"});
    //     activityIndex = (activityIndex + 1) % activityList.length;
    // }, 30000);

    // Updates Bot's Avatar profile picture every 30 minutes.
    setInterval(() => {
        client.user.setAvatar(path.join(".", retrieveAvatar()));
    }, 1800000);
    console.log("Connected as " + client.user.tag)
    client.user.setActivity("Youtube", {type:"WATCHING"})
    // client.client_presence.updatePresence()
    client.guilds.cache.forEach((guilds) => {
        console.log(guilds.name)
        guilds.channels.cache.forEach((channels) => {
            console.log(`-- ${channels.name} ${channels.type} ${channels.id}`)
        })
    })

    let generalChannel = client.channels.cache.get(generalChannelID)
    const attachment = new Discord.MessageAttachment("https://gifimage.net/wp-content/uploads/2017/10/cool-loading-animation-gif-4.gif")

    generalChannel.send(attachment)
    .then(msg => {
        msg.delete({timeout: 8000})
    }).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/)
})


// Interesting implementation add ability to change status, such that it moves (has motion).
// client_presence.updatePresence({
//     state: 'MacOS Mojave',
//     // details: '🐍',
//     startTimestamp: Date.now(),
//     largeImageKey: 'virtualbox',
//     largeText: "virtualbox",
//     smallImageKey: 'mojave',
//     smallText: "mojave",
//     instance: true,
// });

client.on("message", (receivedMessage) => {

    if (receivedMessage.author.bot) {
        return
    }
    // receivedMessage.channel.send("Messaged received " + receivedMessage.author.toString() + ": " + receivedMessage.content)
    // // receivedMessage.react("🤐")
    // // receivedMessage.guild.emojis.cache.forEach(customEmoji => {
    // //     console.log(`${customEmoji.name} ${customEmoji.id}`)
    // //     receivedMessage.react(customEmoji)
    // // })
    // let customEmoji = receivedMessage.guild.emojis.cache.get(botID)
    // receivedMessage.react(customEmoji)
    // console.log(receivedMessage.content);
    if (receivedMessage.content.startsWith(prefix + " ")) {
        processCommand(receivedMessage);
    }
})

function retrieveAvatar() {
    return [
        path.join("assets", "avatars", "unsw_aqua_logo.png"),
        path.join("assets", "avatars", "unsw_aus_logo.png"),
        path.join("assets", "avatars", "unsw_blue_logo.png"),
        path.join("assets", "avatars", "unsw_brown_logo.png"),
        path.join("assets", "avatars", "unsw_light_blue_logo.png"),
        path.join("assets", "avatars", "unsw_light_green_logo.png"),
        path.join("assets", "avatars", "unsw_light_pink_logo.png"),
        path.join("assets", "avatars", "unsw_magenta_logo.png"),
        path.join("assets", "avatars", "unsw_orange_logo.png"),
        path.join("assets", "avatars", "unsw_red_logo.png"),
        path.join("assets", "avatars", "unsw_salmon_logo.png"),

    ][Math.floor(Math.random() * 11)];
}

function randomColourPicker() {
    return [0x7fffd4, 0x458b74, 0x838b8b, 0xff4040, 0x5f9ea0,
    0x7fff00, 0xff3e96, 0x00c5cd, 0xee5c42, 0xcdc9c9, 0xffa54f, 0xee7942,
    0xee8262, 0xeeb4b4, 0xffbbff, 0x98fb98, 0x00fa9a, 0xab82ff, 0xee30a7,
    0xee00ee, 0xfaf0e6, 0xffffe0, 0x00ffcc][Math.floor(Math.random() * 23)];
}

function processCommand(receivedMessage) {
    var fullCommand = receivedMessage.content.substr(prefix.length + 1);

    // Regex / +/ if many spaces provided, it'll remove them.
    var splitCommand = fullCommand.split(/ +/);
    var primaryCommand = splitCommand[0];
    var arguments = splitCommand.slice(1);
    console.log(receivedMessage.content)
    console.log("Arguments: " + arguments)
    console.log("SplitCommand: " + splitCommand)
    console.log("PrimaryCommand: " + primaryCommand)
    if (!splitCommand.length || !primaryCommand.length) {
        receivedMessage.reply("no arguments were provided, please use command: "
        + `**${prefix} help**`)
        // receivedMessage.channel.send(exampleEmbed);
    } else if (primaryCommand == "help") {
        helpCommand(arguments, receivedMessage);
    } else if (primaryCommand == "play") {
        play(arguments, receivedMessage);
    } else if (primaryCommand == "whois") {
        // https://stackoverflow.com/questions/55605593/i-am-trying-to-make-a-discord-js-avatar-command-and-the-mentioning-portion-does
        // Instead of select receivedMessage, we need to check if user specifies
        // a substring (look for it, if doesn't exist don't search for it).
        // Or they specify a id search for that.

        var user = retrieveMentionUser(receivedMessage, arguments, 0);
        if (user) {
            var userDetails = client.users.cache.get(user.id);
            var member = receivedMessage.guild.member(userDetails);
            var embed = createWhoIsEmbed(member, user, userDetails);
        } else {
            var embed = createErrorEmbed(arguments);
        }

        receivedMessage.channel.send({embed: embed});
    } else if (primaryCommand == "love") {

    } else if ((primaryCommand == "change" ||
                primaryCommand == "update" ||
                primaryCommand == "modify" ||
                primaryCommand == "set") &&
                arguments.length >= 4) {
        // Need to change this example and functionality.
        // botName change prefix as/with/to apples
        // botName update harold as/with/to mod
        var userExists = retrieveMentionUser(receivedMessage, arguments, 1);
        if (arguments[1] == "prefix" && checkLinking(arguments[2])) {
            console.log(receivedMessage.author);
            updatePrefix(arguments[3]);
            receivedMessage.channel.send(`Prefix successfully updated to **${arguments[3]}** :partying_face:`);
        } else if (userExists && checkLinking(arguments[2])) {
            permissionSliced = arguments.slice(3).join(" ");
            // https://stackoverflow.com/a/46294003
            // https://reactgo.com/javascript-variable-regex/
            permissionSliced = permissionSliced.split(new RegExp(`${retrieveConjunctive().join("|")}`));
        }
    } else if (primaryCommand == "test") {
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`Hello <@${authorId}> nice to meet you!`)
    } else if (primaryCommand == "weather") {
        //https://github.com/girliemac/fb-apiai-bot-demo/blob/master/webhook.js
        // https://www.smashingmagazine.com/2017/08/ai-chatbot-web-speech-api-node-js/
        if (arguments.length >= 1) {
            // let weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${openWeatherAPIKey}`
            retrieveCity(message, arguments.join());
        }
        // https://www.youtube.com/watch?v=AFmebufTce4
    } else if (primaryCommand == "directions") {
        if (arguments[0] == "from") {
            arguments = arguments.slice(1);
            getAddressCoords(receivedMessage, arguments.join(" "));
        } else {
            receivedMessage.channel.send(`Sorry ${retrieveConfusedEmojis()}` +
            `please specify **${getCurrentPrefix()} directions from <Address>**`)
        }
    } else {

    }
}

// Emojis provided using: https://unicode.org/emoji/charts/full-emoji-list.html
function retrieveConfusedEmojis() {
    return ["😮", "🙁", "😕", "😧", "😢", "😞", "🤔",
            "🤨"][Math.floor(Math.random() * 8)]
}

function retrieveCity(receivedMessage, argumentsJoined) {
    var location = spawn("python", [path.join(process.cwd(),
        path.join("locations", "location.py")), argumentsJoined]);
    location.stdout.on("data", (data) => {
        var result = data.toString();

        // Read this.
        // https://www.guru99.com/difference-equality-strict-operator-javascript.html
        if (result === "[]") {
            receivedMessage.reply("I'm sorry that city doesn't exist! " +
            retrieveConfusedEmojis());
            return;
        }
        getWeather(argumentsJoined, receivedMessage, result);
    })

    location.on("close", (code) => {
        console.log(`Closed All Stdio with code: ${code}`);
    })

    location.on("exit", (code) => {
        console.log(`Exited Child Process with code: ${code}`);
    })
}


function getWeatherEmoji(iconCode){
    // Object based on https://openweathermap.org/weather-conditions
    return {
        "01d": "🌞",    // Clear Skys
        "01n": "🌑",
        "02d": "⛅",    // Few Clouds
        "02n": "⛅",
        "03d": "☁",     // Scattered Clouds
        "03n": "☁",
        "04d": "☁☁",    // Broken Clouds
        "04n": "☁☁",
        "09d": "🌧",     // Shower Rain
        "09n": "🌧",
        "10d": "🌦",     // Rain
        "10n": "🌦",
        "11d": "🌩",     // Thunderstorm
        "11n": "🌩",
        "13d": "🌨",     // Snow
        "13n": "🌨",
        "50d": "🌫",     // Mist
        "50n": "🌫"
    }[iconCode];
}

function retrieveWeatherResponses(cityName, temp, weatherDesc, tempMax, tempMin,
    icon) {
    return [
        `Currently in ${cityName} it's ${temp} ${getWeatherEmoji(icon)}. The ` +
        `forecast for today is ${weatherDesc}, with a low of ${tempMin} and ` +
        `highs of ${tempMax}.`,
        `The weather right now in ${cityName} is ${temp} it is expected to ` +
        `have ${weatherDesc} ${getWeatherEmoji(icon)}. We can see as much as ` +
        `${tempMax} and as low as ${tempMin}.`,
        `We're seeing ${getWeatherEmoji(icon)} heading into ${cityName}. ` +
        `Currently it's ${temp} and ${weatherDesc}. It is expected to ` +
        `rise to ${tempMax} and get as low as ${tempMin}.`
    ][Math.floor(Math.random() * 3)];
}

// Inspired by AlphaBotSystem: https://github.com/alphabotsystem/Alpha
// As well as FB AI ChatBot: https://github.com/girliemac/fb-apiai-bot-demo/
function getWeather(argumentsJoined, receivedMessage, cityName) {
    // In footer reference OpenWeatherMap and MapBox.

    // Account for forecast and Celsius/Fahrenheit
    var unit = argumentsJoined.includes("f") ||
               argumentsJoined.includes("F") ||
               argumentsJoined.includes("Fahrenheit") ? "imperial": "metric";
    var unitSymbol = unit == "imperial" ? "°F": "°C";
    var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherAPIKey}&units=${unit}`;

    fetch(weatherURL)
    .then(resp => resp.json())
    .then(jsonResp => {
        var message = retrieveWeatherResponses(cityName, ~~jsonResp.main.temp +
            unitSymbol, jsonResp.weather[0].description,
            ~~jsonResp.main.temp_max + unitSymbol, ~~jsonResp.main.temp_min +
            unitSymbol, jsonResp.weather[0].icon);

        // Check rain greater than 0% and wind greater than 0%
        if (jsonResp.weather.clouds > 0) {
            message += `There's also a ${jsonResp.weather.clouds}% chance of ` +
            `clouds.`
        }
        if (jsonResp.weather.rain > 0) {
            message += `With also a ${jsonResp.weather.clouds}% chance of ` +
            `showers.`
        }

        var weatherEmbed = createWeatherEmbed(cityName, jsonResp.coord.lon,
            jsonResp.coord.lat, message);
        receivedMessage.channel.send(weatherEmbed);
    }).catch(err => console.log(err));

}

function getAddressCoords(receivedMessage, address) {
    var addressEncoded = encodeURI(address);
    // I don't know if this will break with Australian Territories where no path
    // is available by land.
    var geocodeURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressEncoded}.json?types=address&country=AU&limit=1&access_token=${mapboxPublicKey}`;
    fetch(geocodeURL)
    .then(resp => resp.json())
    .then(jsonResp => {
        if (jsonResp.features === []) {
            var authorId = receivedMessage.author.id;
            var invalidResp = [
                `Hey <@${authorId}> that address doesn't exist ` +
                retrieveConfusedEmojis() + ".",
                `We're sorry <@${authorId}> we could not find ${address} ` +
                retrieveConfusedEmojis() + ".",
                `Hi <@${authorId}> We weren't able to identify ${address} ` +
                retrieveConfusedEmojis() + ".",
                `Sorry to break it to you but ${address} doesn't seem to ` +
                `exist maybe it'll exist one day but not today ` +
                retrieveConfusedEmojis() + ".",
                `I'm afraid we cannot find that particular address ` +
                `${address} ` + retrieveConfusedEmojis() + "."
            ][Math.floor(Math.random() * 5)];
            receivedMessage.channel.send(invalidResp);
            return;
        }
        var addressCoords = jsonResp.features[0].center;
        var fullAddress = jsonResp.features[0].place_name;
        processDirections(addressCoords.join(","), fullAddress, receivedMessage);
    }).catch(err => {
        console.log(err);
    });
}

// UNSW COORDS = LAT: -33.918488, LONG: 151.227858
function processDirections(addressCoords, fullAddress, receivedMessage) {
    var unswCoords = "151.217348,-33.957726"
    var directionCoords = `${addressCoords};${unswCoords}`;
    var encodedCoords = encodeURI(directionCoords);
    var directionsURL = `https://api.mapbox.com/directions/v5/mapbox/driving/${encodedCoords}?alternatives=false&geometries=geojson&steps=false&access_token=${mapboxPublicKey}`
    fetch(directionsURL)
    .then(resp => resp.json())
    .then(jsonResp => {
        var pathCoords = jsonResp.routes[0].geometry.coordinates;

        // https://github.com/mapbox/path-gradients
        var gradients = spawn("node", [path.join(process.cwd(), path.join(
            "path-gradients", "main.js"
        )), JSON.stringify(pathCoords)]);
        gradients.stdout.on("data", (data) => {
            var polylineString = data.toString();
            var locationsEmbed = createLocationsEmbed(fullAddress, polylineString);
            receivedMessage.channel.send(locationsEmbed);
        })

        gradients.on("close", (code) => {
            console.log(`Closed All Stdio with code: ${code}`);
        })
        gradients.on("exit", (code) => {
            console.log(`Exited Child Process with code: ${code}`);
        })
    }).catch(err => console.log(err));
}

function createLocationsEmbed(fullAddress, polylineString) {
    // https://stackoverflow.com/a/10805198
    polylineString = polylineString.replace(/(\r\n|\n|\r)/gm, "")
    var imageURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${polylineString}`.concat(`/auto/600x600?access_token=${mapboxPublicKey}`)
    var locationsEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`From ${fullAddress} to UNSW!`)
        .setImage(imageURL)
        .setFooter("Data Provided by: © 2020 Mapbox, Inc")
    return locationsEmbed;
}

// https://api.mapbox.com/geocoding/v5/mapbox.places/High%20Street%20Kensington.json?types=address&country=AU&limit=1&access_token=${mapboxPublicKey}
function retrieveConjunctive() {
    return [
        "and",
        "as well as",
        "with",
        "moreover",
        "in addition",
        "in addition to"
    ]
}

// https://discord.com/developers/docs/topics/permissions
function retrievePermissions(permission) {
    var permissions = [
        "CREATE INSTANT INVITE",
        "KICK MEMBERS",
        "BAN MEMBERS",
        "ADMINISTRATOR",
        "MANAGE CHANNELS",
        "MANAGE GUILD",
        "ADD REACTIONS",
        "VIEW AUDIT LOG",
        "PRIORITY SPEAKER",
        "STREAM",
        "VIEW CHANNEL",
        "SEND MESSAGES",
        "SEND TTS MESSAGES",
        "MANAGE MESSAGES",
        "EMBED LINKS",
        "ATTACH FILES",
        "READ MESSAGE HISTORY",
        "MENTION EVERYONE",
        "USE EXTERNAL EMOJIS",
        "VIEW GUILD INSIGHTS",
        "CONNECT",
        "SPEAK",
        "MUTE MEMBERS",
        "DEAFEN MEMBERS",
        "MOVE MEMBERS",
        "USE VAD",
        "CHANGE NICKNAME",
        "MANAGE NICKNAMES",
        "MANAGE ROLES",
        "MANAGE WEBHOOKS",
        "MANAGE EMOJIS"
    ];
    var permissionFound = permissions.indexOf(permission);
    if (permissionFound >= 0) {
        return permissions[permissionFound];
    }
    return "";
}

function checkLinking(argument) {
    return ["with", "as", "to"].includes(argument);
}

// function chatWith
function createErrorEmbed(arguments) {
    var errorEmbed = {
        // Color orange red.
        color: 0xff4500,
        title: `❌ Invalid User ${arguments.join(" ")}`,
    }
    return errorEmbed;
}

function createWeatherEmbed(cityName, longitude, latitude, message) {
    var mapboxRequestURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${longitude},${latitude},10,0/400x300?access_token=${mapboxPublicKey}`

    var weatherEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`Weather for ${cityName}`)
        .setDescription(message)
        .setImage(mapboxRequestURL)
        .setFooter("Data Provided by: OpenWeatherMap & © 2020 Mapbox, Inc")
    return weatherEmbed;
}

function createWhoIsEmbed(memberObj, userObj, userDetails) {
    var date = new Date();

    // https://support.discord.com/hc/en-us/community/posts/360041823171/comments/360012230811
    // https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object
    // https://stackoverflow.com/a/50374666/14151099

    // https://www.xspdf.com/resolution/57184174.html
    var messageEmbed = {
        color: randomColourPicker(),
        title: "User Profile",
        author: {
            name: `${userDetails.tag}`,
            icon_url: `${userObj.avatarURL()}`,
        },
        thumbnail: {
            url: `${userObj.avatarURL()}`
        },
        fields: [
            {
                name: "**Joined Date**",
                value: `${memberObj.joinedAt.toDateString()}`,
                inline: true,
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            },
            {
                name: "**Registered Date**",
                value: `${userDetails.createdAt.toDateString()}`,
                inline: true,
            }
        ],
        description: `<@!${userDetails.id}>`,
        footer: {
            text: `ID: ${userDetails.id} \u200b` +
            `${date.toDateString()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        }
    }
    return messageEmbed;
}

function retrieveMentionUser(receivedMessage, arguments, index) {
    var isMentioned = receivedMessage.mentions.users.first();
    var isIdentified = client.users.cache.get(arguments[index]);
    var isSelected = client.users.cache.find(user => user.username.startsWith(arguments[index]));
    return isMentioned || isIdentified || isSelected;
}

// This function changes prefix.
function updatePrefix(newPrefix) {

    // https://stackoverflow.com/a/21035861
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    jsonFile["prefix"] = newPrefix;

    // https://attacomsian.com/blog/javascript-pretty-print-json
    fs.writeFileSync("config.json", JSON.stringify(jsonFile, null, 4));
}

function getCurrentPrefix() {
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    return jsonFile["prefix"];
}

function helpCommand(arguments, receivedMessage) {
    if (arguments.length == 0) {
        receivedMessage.channel.send("I'm not sure what you need help with. Try: " +
        `${prefix}help [topic]`);
    } else {
        receivedMessage.channel.send("It looks like you need help with " +
        arguments)
    }
}

function play(arguments, receivedMessage) {
    if (arguments[0] == "movie") {
        if (arguments[1] == "joker") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/529500682781327396/730896880925671494/Joker_2019.webm")
        } else if (arguments[1] == "shrek") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/572172622973108225/572172751691972618/Shrek_VP9-60k_Opus-20300-1.webm")
        }
    } else {
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`Oh no! We could not find that video <@${authorId}>.`)
    }
}

client.login(token)