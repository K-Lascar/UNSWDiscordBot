const Discord = require("discord.js")
const client = new Discord.Client()
const {prefix, token, generalChannelID, openWeatherAPIKey,
    mapboxPublicKey} = require("./config.json");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const {spawn} = require("child_process");
const wiki = require("wikijs").default;

// USE FOR PULLING https://stackoverflow.com/a/9695141/14151099

// Can trigger multiple times (unlike .once)
client.on("ready", () =>{

    // Updates Bot's Avatar profile picture every 30 minutes.
    setInterval(() => {
        client.user.setAvatar(path.join(".", randomAvatarPicker()));
    }, 1800000);

    console.log("Connected as " + client.user.tag)

    client.user.setActivity("📺Youtube📺", {type:"WATCHING"})

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

client.on("message", (receivedMessage) => {

    if (receivedMessage.author.bot) {
        return
    }

    if (receivedMessage.content.startsWith(prefix)) {
        processCommand(receivedMessage);
    }
})

function randomAvatarPicker() {
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

function randomHeartGen() {
    return [
        "❤", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍"
    ][Math.floor(Math.random() * 9)];
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
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`<@${authorId}>`);

    } else if (primaryCommand == "help") {
        helpCommand(receivedMessage, arguments);
    } else if (primaryCommand == "play") {
        play(receivedMessage, arguments);
    } else if (primaryCommand == "whois") {
        processWhoIs(receivedMessage, arguments);
    } else if (receivedMessage.content.includes("love")) {
        processLoveRequest(receivedMessage);

    } else if ((primaryCommand == "change" ||
                primaryCommand == "update" ||
                primaryCommand == "modify" ||
                primaryCommand == "set")) {
        processUpdate(receivedMessage, arguments);

    } else if (primaryCommand == "test") {
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`Hello <@${authorId}> nice to meet you!`);

    } else if (primaryCommand == "weather") {

        // Add Else.
        if (arguments.length >= 1) {
            retrieveCity(message, arguments.join());
        }

    // https://www.youtube.com/watch?v=AFmebufTce4
    } else if (primaryCommand == "directions") {
        processDirection(receivedMessage, arguments);
    } else if (primaryCommand == "salary") {
        retrieveSalaryData(receivedMessage, arguments);

    } else if (primaryCommand == "wiki" || primaryCommand == "wikipedia" ||
               primaryCommand == "find" || primaryCommand == "wikime") {
        retrieveWikiResults(receivedMessage, arguments);
    } else {
        receivedMessage.channel.send(retrieveConfusedEmojis());
    }
}

function processDirection(receivedMessage, arguments) {
    if (arguments[0] == "from") {
        var addressSliced = arguments.slice(1);
        getAddressCoords(receivedMessage, addressSliced.join(" "));
    } else {
        receivedMessage.channel.send(`Sorry ${retrieveConfusedEmojis()}` +
        `please specify **${getCurrentPrefix()} directions from <Address>**`)
    }
}

function processUpdate(receivedMessage, arguments) {
    // Need to change this example and functionality.
    // botName change prefix as/with/to apples
    // botName update harold as/with/to mod
    var userExists = retrieveMentionUser(receivedMessage, arguments, 0);
    console.log(userExists);
    if (arguments[0] == "prefix" && checkLinking(arguments[1])) {

        // First check if the prefix parsed is the same as the prefix given.
        // Secondly check if they admin permissions to change it.
        // If all else fails, send error message that user doesn't have
        // permissions.
        if (getCurrentPrefix() == arguments[2]) {
            receivedMessage.channel.send(`The prefix is the same as the `+
            `current prefix. ` + retrieveConfusedEmojis());
        } else if (receivedMessage.guild.member(receivedMessage.author).hasPermission("ADMINISTRATOR")) {
            updatePrefix(arguments[2]);
            receivedMessage.channel.send(`Prefix successfully updated to ` +
            `**${arguments[2]}** :partying_face:.`);

        } else {
            var authorId = receivedMessage.author.id;
            receivedMessage.channel.send(`Sorry <@${authorId}> you do not ` +
            `have Admin permissions. ` + retrieveConfusedEmojis());
        }
    } else if (userExists && checkLinking(arguments[1])) {
        var permissionSliced = arguments.slice(2).join(" ");
        permissionSliced = permissionSliced.split(new
            RegExp(`${retrieveConjunctive().join("|")}`));

        // https://stackoverflow.com/a/46294003
        // https://reactgo.com/javascript-variable-regex/
        // console.log(receivedMessage.author);
        // console.log(permissionSliced);
        permissionSliced.map(function(permission) {
            var authorId = receivedMessage.author.id;
            if (checkPermissionsExist(permission)) {
                var author = receivedMessage.author;
                var userDetails = client.users.cache.get(userExists.id);
                var member = receivedMessage.guild.member(userDetails);
                // console.log(receivedMessage.member);
                // console.log(member);
                permission = permission.split(" ").join("_");
                if (member.hasPermission(permission)) {
                    receivedMessage.channel.send(`${author} already has this `+
                    `permission. ` + retrieveConfusedEmojis());
                } else if (receivedMessage.member.hasPermission("ADMINISTRATOR")) {
                    var channel = receivedMessage.channel;
                    channel.updateOverwrite(userExists, {
                        permission: true
                    })
                    .then(channel => console.log(channel))
                    .catch(err => console.log(err));
                } else {
                    receivedMessage.channel.send(`Sorry <@${authorId}> you ` +
                    ` do not have Admin permissions. ` +
                    retrieveConfusedEmojis());
                }
                // CHECK USER HAS PERMS IF SO STATE WHY CHANGE PERMS
                // OTHERWISE CHECK USER CHANGING PERMS/RUNNING COMMAND HAS PERMISSIONS
                console.log(permission);
            } else {
                receivedMessage.channel.send(`Sorry <@${authorId}> that ` +
                `permission doesn't exist, please provide a valid permission.`);
            }
        })
    } else {
        receivedMessage.channel.send(`What kind of prefix did you mean? ` +
        retrieveConfusedEmojis())
    }
}

function processLoveRequest(receivedMessage) {
    var index = receivedMessage.content.indexOf("love");
    var slicedMessage = receivedMessage.content.slice(0, index);
    var splitArray = slicedMessage.split(" ");
    // https://www.cloudhadoop.com/typescript-check-boolean-array/
    var isAntithetical = splitArray.map(function(word) {
        return retrieveAntithesis().includes(word);
    }).includes(true);
    if (!isAntithetical) {
        receivedMessage.react("🇮");
        receivedMessage.react(randomHeartGen());
        receivedMessage.react("🇺");
    } else {
        receivedMessage.react("💔");
    }
}

function processWhoIs(receivedMessage, arguments) {
    // https://stackoverflow.com/questions/55605593/i-am-trying-to-make-a-discord-js-avatar-command-and-the-mentioning-portion-does

    // We check for all the possible queries (userID, user nickname and
    // if mentioned). Then we create a response as a result.
    var user = retrieveMentionUser(receivedMessage, arguments, 0);
    if (user) {
        var userDetails = client.users.cache.get(user.id);
        var member = receivedMessage.guild.member(userDetails);
        var embed = createWhoIsEmbed(member, user, userDetails);
    } else {
        var embed = createErrorEmbed(arguments);
    }

    receivedMessage.channel.send({embed: embed});
}

function retrieveWikiResults(receivedMessage, query) {
    wiki()
    .page(query)
    .then(function(page) {
        console.log(page.raw);

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        return Promise.all([page.mainImage(), page.summary()].concat([page.raw.fullurl, page.raw.title]))
    })
    .then(values => {
        // Format of values is the return statement above:
        // imageURL, summaryText, fullURL, title.
        createWikiEmbed(receivedMessage, values[0], values[1], values[2], values[3]);
    }) // Bruce Wayne
    .catch(err => console.log(err));
}


// Please enter a valid job title.
function retrieveSalaryData(receivedMessage, job) {
    var jobFormatted = job.join("-");
    var encodedJob = encodeURI(jobFormatted);

    // https://stackoverflow.com/a/42755730/14151099
    var jobString = job.map(function(word) {
        return word[0].toUpperCase() + word.substr(1)
    }).join(" ");

    // This may be subject to change, as indeed may break this functionality all together.
    var indeedURL = `https://au.indeed.com/career/${encodedJob}/salaries`
    // https://github.com/node-fetch/node-fetch/issues/471#issuecomment-396000750
    fetch(indeedURL)
    .then(function(resp) {
        if (resp.status != 200) {
            receivedMessage.channel.send(`Sorry we could not find that ` +
            `**${jobString}** title in **Indeed** ${retrieveConfusedEmojis()}.`);
            return;
        }
        return resp.text()
    })
    .then(respText => {
        if (respText) {
            var salary = JSON.stringify(respText).split(" is ")[1].split(" per year in Australia.")[0]
            receivedMessage.channel.send(`According to **Indeed**, the ` +
            `figures suggest the average base salary for ${jobString} ` +
            `is **${salary}**.`)
        }
    })
}

// Emojis provided using: https://unicode.org/emoji/charts/full-emoji-list.html
function retrieveConfusedEmojis() {
    return ["😮", "🙁", "😕", "😧", "😢", "😞", "🤔",
            "🤨"][Math.floor(Math.random() * 8)]
}

function retrieveCity(receivedMessage, argumentsJoined) {
    var location = spawn("python", [path.join(process.cwd(), "locations",
        "location.py"), argumentsJoined]);
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

// https://github.com/girliemac/fb-apiai-bot-demo/blob/master/webhook.js
// https://www.smashingmagazine.com/2017/08/ai-chatbot-web-speech-api-node-js/
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
        var gradients = spawn("node", [path.join(process.cwd(),
            "path-gradients", "main.js"), JSON.stringify(pathCoords)]);
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

function createWikiEmbed(receivedMessage, imageURL, summaryText, fullURL, title) {
    var wikiEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(title)
        .setURL(fullURL)
        .setDescription(summaryText.slice(0, 256) + "...")
        .setImage(imageURL)
        .setFooter("Data provided by: Wikipedia!")
    receivedMessage.channel.send(wikiEmbed, "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpg");
}

function createLocationsEmbed(fullAddress, polylineString) {
    // https://stackoverflow.com/a/10805198
    polylineString = polylineString.replace(/(\r\n|\n|\r)/gm, "")
    var imageURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${polylineString}`.concat(`/auto/600x600?access_token=${mapboxPublicKey}`)

    // https://www.mapbox.com/about/press/brand-guidelines
    var locationsEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`From ${fullAddress} to UNSW!`)
        .setImage(imageURL)
        .setFooter("Data Provided by: © 2020 Mapbox, Inc", "https://assets-global.website-files.com/5d3ef00c73102c436bc83996/5d3ef00c73102c893bc83a28_logo-regular.png")
    return locationsEmbed;
}

function retrieveAntithesis() {
    return [
        "not",
        "don't",
        "hate"
    ]
}

function retrieveConjunctive() {
    return [
        "and",
        "also",
        "as well as",
        "with",
        "in addition to"
    ]
}

function checkPermissionsExist(permission) {
    var permissions = retrievePermissions();
    var permissionFound = permissions.indexOf(permission.toUpperCase());
    if (permissionFound >= 0) {
        return permissions[permissionFound];
    }
    return;
}

// https://discord.com/developers/docs/topics/permissions
function retrievePermissions() {
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
    return permissions;
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

function helpCommand(receivedMessage, arguments) {
    if (arguments.length == 0) {
        receivedMessage.channel.send("I'm not sure what you need help with. Try: " +
        `${prefix}help [topic]`);
    } else {
        receivedMessage.channel.send("It looks like you need help with " +
        arguments);
    }
}

function play(receivedMessage, arguments) {
    if (arguments[0] == "movie") {
        if (arguments[1] == "joker") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/338533206825500673/793723640495079444/Joker.webm")
        } else if (arguments[1] == "shrek") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/338533206825500673/793722980340727838/Shrek.webm")
        }
    } else {
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`Oh no! We could not find that video <@${authorId}>.`)
    }
}

client.login(token);