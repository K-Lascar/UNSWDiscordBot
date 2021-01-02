const Discord = require("discord.js")
const client = new Discord.Client()
const {prefix, token, openWeatherAPIKey,
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

    // Set Bot Activity to Watching Youtube.
    client.user.setActivity("📺Youtube📺", {type:"WATCHING"})

    // Prints each channel in the server/guild.
    var mainChannelID;
    client.guilds.cache.forEach((guilds) => {
        console.log(guilds.name)
        var flag = true;
        guilds.channels.cache.forEach((channels) => {
            console.log(`-- ${channels.name} ${channels.type} ${channels.id}`);
            if (channels.type == "text" && flag) {
                mainChannelID = channels.id;
                flag = false;
            }
        })
    })

    // Add cool loading animation to main channel.
    let generalChannel = client.channels.cache.get(mainChannelID)
    const attachment = new Discord.MessageAttachment("https://gifimage.net/wp-content/uploads/2017/10/cool-loading-animation-gif-4.gif")
    generalChannel.send(attachment)
    .then(msg => {
        msg.delete({timeout: 8000})
    }).catch(err => console.log(err));
})

// When the bot receives a message it will execute this.
client.on("message", (receivedMessage) => {

    // Don't accept any messages outputted by the bot.
    if (receivedMessage.author.bot) {
        return;
    }

    // If prefix is specified we will process the command.
    if (receivedMessage.content.startsWith(prefix)) {
        processCommand(receivedMessage);
    }
})

// This function picks a random avatar from the assets/avatars folder.
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

// This function picks a random hex colour.
function randomColourPicker() {
    return [0x7fffd4, 0x458b74, 0x838b8b, 0xff4040, 0x5f9ea0,
    0x7fff00, 0xff3e96, 0x00c5cd, 0xee5c42, 0xcdc9c9, 0xffa54f, 0xee7942,
    0xee8262, 0xeeb4b4, 0xffbbff, 0x98fb98, 0x00fa9a, 0xab82ff, 0xee30a7,
    0xee00ee, 0xfaf0e6, 0xffffe0, 0x00ffcc][Math.floor(Math.random() * 23)];
}

// This function generates a random heart emoji.
function randomHeartGen() {
    return [
        "❤", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍"
    ][Math.floor(Math.random() * 9)];
}

// This function processes all command (nuts and bolts of this program).
function processCommand(receivedMessage) {
    var fullCommand = receivedMessage.content.substr(prefix.length + 1);

    // Regex / +/ if many spaces provided, it'll remove them.
    var splitCommand = fullCommand.split(/ +/);
    var primaryCommand = splitCommand[0];
    var arguments = splitCommand.slice(1);
    console.log(receivedMessage.content);
    console.log("Arguments: " + arguments);
    console.log("SplitCommand: " + splitCommand);
    console.log("PrimaryCommand: " + primaryCommand);

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

        if (arguments.length >= 1) {
            processWeather(receivedMessage, arguments.join(" "));

        } else {
            receivedMessage.channel.send(`Sorry ${retrieveConfusedEmojis()} ` +
            `please specify **${getCurrentPrefix()} weather <city>**`);

        }

    } else if (primaryCommand == "directions") {

        // https://www.youtube.com/watch?v=AFmebufTce4
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

// This function will process directions, if a user provides
// a valid address, it will parse the address provided into the
// getAddressCoords function, which will eventually send an embed
// to the user of the directions.
function processDirection(receivedMessage, arguments) {
    if (arguments[0] == "from") {
        var addressSliced = arguments.slice(1);
        getAddressCoords(receivedMessage, addressSliced.join(" "));
    } else {
        receivedMessage.channel.send(`Sorry ${retrieveConfusedEmojis()} ` +
        `please specify **${getCurrentPrefix()} directions from <Address>**`)
    }
}

// This function will update either the prefix or the permissions for a specific
// user in the given channel.
function processUpdate(receivedMessage, arguments) {
    var userExists = retrieveMentionUser(receivedMessage, arguments, 0);
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
            `**${arguments[2]}** 🥳`);

        } else {
            var authorId = receivedMessage.author.id;
            receivedMessage.channel.send(`Sorry <@${authorId}> you do not ` +
            `have Admin permissions. ` + retrieveConfusedEmojis());
        }
    } else if (userExists && checkLinking(arguments[1])) {

        // This will slice all the permissions from index 2 onwards.
        // Then retrieve every unique permission from the message.
        // If an Admin was to specify that userA would like to have permissionA
        // and permissionB then we split it based on this.

        // E.g. {prefix} update jennifer as/with/to {textPermissionA} and {textPermissionB}
        var permissionSliced = arguments.slice(2).join(" ");
        permissionSliced = permissionSliced.split(new
            RegExp(`${retrieveConjunctive().join("|")}`));

        // https://stackoverflow.com/a/46294003
        // https://reactgo.com/javascript-variable-regex/
        permissionSliced.map(function(permission) {
            var author = receivedMessage.author;
            var authorId = author.id;

            if (checkPermissionsExist(permission)) {

                permission = permission.split(" ").join("_");

                // We initially check if the user has the permissions specified.
                // Otherwise we check if the user is administrator and change
                // the specified user's permissions. If all else fails, we send
                // a response, stating the user doesn't have administrator
                // permissions.

                // https://stackoverflow.com/a/60642417/14151099
                if (receivedMessage.channel.permissionsFor(userExists).has(permission)) {
                    receivedMessage.channel.send(`**${userExists.username}** ` +
                    `already has this permission. ` + retrieveConfusedEmojis());
                } else if (receivedMessage.member.hasPermission("ADMINISTRATOR")) {

                    // Add requested user permissions to be added as well as old
                    // permissions to be added.
                    var channel = receivedMessage.channel;
                    var currentPerm = channel.permissionOverwrites.values();
                    // https://stackoverflow.com/questions/60608439/how-to-get-data-from-collection-map-in-discord-js
                    channel.overwritePermissions([
                        {
                            id: userExists.id,
                            allow: [permission],
                        },
                    ].concat(Array.from(currentPerm)))
                    .catch(err => console.log(err));

                    var readablePerm = permission.split("_").join(" ");
                    receivedMessage.channel.send(`Granted **${readablePerm}**` +
                    ` to ${userExists.username}! 😁`)
                } else {

                    // Unauthorised Response.
                    receivedMessage.channel.send(`Sorry <@${authorId}> you ` +
                    `do not have Admin permissions. ` +
                    retrieveConfusedEmojis());
                }
            } else {
                receivedMessage.channel.send(`Sorry <@${authorId}> that ` +
                `permission doesn't exist, please provide a valid permission.`);
            }
        })
    } else {

        // Invalid Update Command.
        receivedMessage.channel.send(`What kind of update did you mean? ` +
        retrieveConfusedEmojis());
    }
}

// This function will process a love request. If a user specifies their
// message will receive reaction.

function processLoveRequest(receivedMessage) {

    // We initially check if someone specifies a message that is antithetical
    // e.g. {prefix} I don't love you.
    // In this case we'd react with a broken heart.
    // Otherwise we'd send a I <Heart Emoji> U.
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

// This function will process a whoIs, identifying the user's details (username,
// date joined, date created and profile).
function processWhoIs(receivedMessage, arguments) {


    // We check for all the possible queries (userID, user nickname and
    // if mentioned). Then we create a response as a result.
    var user = retrieveMentionUser(receivedMessage, arguments, 0);
    if (user) {
        // Retrieve user object and from their we can find the member object.
        // Which we can then pass into the createWhoIsEmbed.

        var userDetails = client.users.cache.get(user.id);
        var member = receivedMessage.guild.member(userDetails);
        var embed = createWhoIsEmbed(member, user, userDetails);
    } else {

        // error Embed.
        var embed = createErrorEmbed(arguments);
    }

    // Send Embed.
    receivedMessage.channel.send({embed: embed});
}

// This function will query on Wikipedia and return a given embed for the query.
function retrieveWikiResults(receivedMessage, query) {
    wiki()
    .page(query)
    .then(function(page) {
        // console.log(page.raw);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        return Promise.all([page.mainImage(), page.summary()].concat([page.raw.fullurl, page.raw.title]))
    })
    .then(values => {
        // Format of values is the return statement above:
        // imageURL, summaryText, fullURL, title.
        var wikiEmbed = createWikiEmbed(values[0], values[1], values[2], values[3]);
        receivedMessage.channel.send(wikiEmbed, "https://upload.wikimedia.org/wikipedia/commons/f/ff/Wikipedia_logo_593.jpg");
    })
    .catch(err => console.log(err));
}

// This function will retrieve salary data from a specified job.
function retrieveSalaryData(receivedMessage, job) {
    var jobFormatted = job.join(" ");
    var encodedJob = encodeURI(jobFormatted);

    // https://stackoverflow.com/a/42755730/14151099
    var jobString = job.map(function(word) {
        return word[0].toUpperCase() + word.substr(1);
    }).join(" ");

    // This may be subject to change, as indeed may break this functionality all together.
    var indeedURL = `https://api-title-webapp.indeed.com/_api/salaries/${encodedJob}?country=AU&locale=en_AU&location=&salaryType=`
    // https://github.com/node-fetch/node-fetch/issues/471#issuecomment-396000750
    fetch(indeedURL)
    .then(resp => resp.json())
    .then(jsonResp => {
        var salaries = jsonResp.salaries.salaries;
        if (salaries === {}) {
            receivedMessage.channel.send(`Sorry we could not find that ` +
            `**${jobString}** title in **Indeed** ${retrieveConfusedEmojis()}.`);
        } else {
            var medianSalary = salaries.YEARLY.estimatedMedian;
            var maxSalary = salaries.YEARLY.estimatedMax;
            var minSalary = salaries.YEARLY.estimatedMin;
            var meanSalary = salaries.YEARLY.mean;
            var salaryEmbed = createSalaryEmbed(encodedJob, jobString,
                medianSalary, maxSalary, minSalary, meanSalary);
            receivedMessage.channel.send(salaryEmbed);
        }
    })
    .catch(err => console.log(err));
}

// Emojis provided using: https://unicode.org/emoji/charts/full-emoji-list.html
function retrieveConfusedEmojis() {
    return ["😮", "🙁", "😕", "😧", "😢", "😞", "🤔",
            "🤨"][Math.floor(Math.random() * 8)];
}

// This function will process the weather, by checking the city is valid and
// outputting it an embed for the result.
function processWeather(receivedMessage, argumentsJoined) {

    // We spawn the python program in the locations directory, which checks
    // if the city specified exists, if so it outputs it to the command line.
    var location = spawn("python", [path.join(process.cwd(), "locations",
        "location.py"), argumentsJoined]);

    location.stdout.on("data", (data) => {

        var result = data.toString();
        // Read this.
        // https://www.guru99.com/difference-equality-strict-operator-javascript.html

        // Circumstance when no data is outputted onto the command line.
        if (result === "[]") {
            receivedMessage.reply("I'm sorry that city doesn't exist! " +
            retrieveConfusedEmojis());
            return;
        }
        getWeather(argumentsJoined, receivedMessage, result);
    })

    // Close STDIO processes.
    location.on("close", (code) => {
        console.log(`Closed All Stdio with code: ${code}`);
    })

    // Exit child process.
    location.on("exit", (code) => {
        console.log(`Exited Child Process with code: ${code}`);
    })
}

// This function will retrieve a emoji from a given iconCode.
function getWeatherEmoji(iconCode){
    // Object based on https://openweathermap.org/weather-conditions
    return {
        "01d": "☀",    // Clear Skys
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

// This function will retrieve a weather a random weather response from the
// given weather stats.
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
// https://www.smashingmagazine.com/2017/08/ai-chatbot-web-speech-api-node-js/
function getWeather(argumentsJoined, receivedMessage, cityName) {

    // Account for forecast and Celsius/Fahrenheit
    var unit = argumentsJoined.includes("f") ||
               argumentsJoined.includes("F") ||
               argumentsJoined.includes("Fahrenheit") ? "imperial": "metric";
    var unitSymbol = unit == "imperial" ? "°F": "°C";
    var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherAPIKey}&units=${unit}`;

    fetch(weatherURL)
    .then(resp => resp.json())
    .then(jsonResp => {

        // ~~ Truncates number to an integer.
        var message = retrieveWeatherResponses(cityName, ~~jsonResp.main.temp +
            unitSymbol, jsonResp.weather[0].description,
            ~~jsonResp.main.temp_max + unitSymbol, ~~jsonResp.main.temp_min +
            unitSymbol, jsonResp.weather[0].icon);

        // Add to message response only if the rain greater than 0% and wind
        // greater than 0% (when it is important).
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

// This function will get a given addresses coordinates.
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
            var invalidResp = retrieveInvalidAddResp(authorId);
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

// This function will process directions from a given address to UNSW.
function processDirections(addressCoords, fullAddress, receivedMessage) {
    var unswCoords = "151.231356,-33.919742"
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

// This function will create a wiki embed.
function createWikiEmbed(imageURL, summaryText, fullURL, title) {
    var wikiEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(title)
        .setURL(fullURL)
        .setDescription(summaryText.slice(0, 256) + "...")
        .setImage(imageURL)
        .setFooter("Data provided by: Wikipedia!")
    return wikiEmbed;
}

// This function will create a location embed.
function createLocationsEmbed(fullAddress, polylineString) {

    // https://stackoverflow.com/a/10805198
    polylineString = polylineString.replace(/(\r\n|\n|\r)/gm, "")
    var imageURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${polylineString}`
    .concat(`/auto/600x600?access_token=${mapboxPublicKey}`)

    // https://www.mapbox.com/about/press/brand-guidelines
    var locationsEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`From ${fullAddress} to UNSW!`)
        .setImage(imageURL)
        .setFooter("Data Provided by: © 2020 Mapbox, Inc.", "https://assets-global.website-files.com/5d3ef00c73102c436bc83996/5d3ef00c73102c893bc83a28_logo-regular.png")
    return locationsEmbed;
}

// This function will retrieve a list antithetical words.
function retrieveAntithesis() {
    return [
        "not",
        "don't",
        "hate",
        "dislike"
    ];
}

// This function will retrieve a list conjunctives.
function retrieveConjunctive() {
    return [
        "and",
        "also",
        "as well as",
        "with",
        "in addition to"
    ];
}

function createSalaryEmbed(encodedJob, job, medianSalary, maxSalary, minSalary,
    meanSalary) {
    var salaryEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(job)
        .setURL(`https://au.indeed.com/career/${encodedJob}/salaries`)
        .addFields(
            {name: "**Median Salary**",
                value: `$${medianSalary.toFixed(2)}`, inline: true},
            {name: "**Max Salary**",
                value: `$${maxSalary.toFixed(2)}`, inline: true},
            {name: "\u200B", value: "\u200B"},
            {name: "**Min Salary**",
                value: `$${minSalary.toFixed(2)}`, inline: true},
            {name: "**Mean Salary**",
                value: `$${meanSalary.toFixed(2)}`, inline: true}
        )
        .setTimestamp()
        .setFooter("Data provided by: Indeed!",
        "https://www.logolynx.com/images/logolynx/49/499d48442f2e5418dae38ca15a3a2d98.jpeg");
    return salaryEmbed;
}

// This function will retrieve a random invalid address response.
function retrieveInvalidAddResp(authorId) {
    return [
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
}

// This function will check if a given permission exists.
function checkPermissionsExist(permission) {
    var permissions = retrievePermissions();
    var permissionFound = permissions.indexOf(permission.toUpperCase());
    if (permissionFound >= 0) {
        return permissions[permissionFound];
    }
    return;
}

// https://discord.com/developers/docs/topics/permissions
// The following permissions are only text permissions.
function retrievePermissions() {
    var permissions = [
        "CREATE INSTANT INVITE",
        "MANAGE CHANNELS",
        "ADD REACTIONS",
        "VIEW CHANNEL",
        "SEND MESSAGES",
        "SEND TTS MESSAGES",
        "MANAGE MESSAGES",
        "EMBED LINKS",
        "ATTACH FILES",
        "READ MESSAGE HISTORY",
        "MENTION EVERYONE",
        "USE EXTERNAL EMOJIS",
        "MANAGE ROLES",
        "MANAGE WEBHOOKS",
    ];
    return permissions;
}

// This function checks if the argument specified is a linking wor.d
function checkLinking(argument) {
    return ["with", "as", "to"].includes(argument);
}

// This function will create an error embed.
function createErrorEmbed(arguments) {
    var errorEmbed = {
        // Color orange red.
        color: 0xff4500,
        title: `❌ Invalid User ${arguments.join(" ")}`,
    };
    return errorEmbed;
}

// This function creates a weatherEmbed.
function createWeatherEmbed(cityName, longitude, latitude, message) {
    var mapboxRequestURL = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${longitude},${latitude},10,0/400x300?access_token=${mapboxPublicKey}`

    var weatherEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`Weather for ${cityName}`)
        .setDescription(message)
        .setImage(mapboxRequestURL)
        .setFooter("Data Provided by: OpenWeatherMap & © 2020 Mapbox, Inc.");
    return weatherEmbed;
}

// This function creates a whoIsEmbed for a given user.
function createWhoIsEmbed(memberObj, userObj, userDetails) {
    var date = new Date();

    // https://stackoverflow.com/questions/55605593/i-am-trying-to-make-a-discord-js-avatar-command-and-the-mentioning-portion-does
    // https://support.discord.com/hc/en-us/community/posts/360041823171/comments/360012230811
    // https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object
    // https://stackoverflow.com/a/50374666/14151099
    // https://www.xspdf.com/resolution/57184174.html
    var currentDate = date.toDateString();
    var currentHour = date.getHours();
    // https://stackoverflow.com/a/10073737/14151099
    var currentMin = date.getMinutes().toString().padStart(2, "0");
    var currentSec = date.getSeconds().toString().padStart(2, "0");
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
            `${currentDate}, ${currentHour}:${currentMin}:${currentSec}`
        }
    };
    return messageEmbed;
}

// This function will retrieve a user, checking either it was mentioned,
// identified (retrieved by an ID) or the start of a given user's name is
// specified.
function retrieveMentionUser(receivedMessage, arguments, index) {
    var isMentioned = receivedMessage.mentions.users.first();
    var isIdentified = client.users.cache.get(arguments[index]);
    var isSelected = client.users.cache.find(user => user.username.startsWith(arguments[index]));
    return isMentioned || isIdentified || isSelected;
}

// This function updates the prefix.
function updatePrefix(newPrefix) {

    // First we parse it, then we modify the prefix, then we store it.

    // https://stackoverflow.com/a/21035861
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    jsonFile["prefix"] = newPrefix;

    // https://attacomsian.com/blog/javascript-pretty-print-json
    fs.writeFileSync("config.json", JSON.stringify(jsonFile, null, 4));
}

// This function will retrieve the current prefix in the config.json file.
function getCurrentPrefix() {
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    return jsonFile["prefix"];
}

// Inspired by: https://dankmemer.lol/
function createMainHelpEmbed() {
    var prefix = getCurrentPrefix();
    var helpEmbed = new Discord.MessageEmbed()
        .setColor(randomColourPicker())
        .setTitle(`**UNSW ChatBot's Command List**`)
        .addFields(
            {name: "🗺 **Directions**",
                value: `\`\`${prefix} help directions\`\``, inline: true},
            {name: "🔐 **Permissions**",
                value: `\`\`${prefix} help permissions\`\``, inline: true},
            {name: "\u200B", value: "\u200B"},
            {name: "🎥 **Play**",
                value: `\`\`${prefix} help play\`\``, inline: true},
            {name: "🛠 **Prefix**",
                value: `\`\`${prefix} help prefix\`\``, inline: true},
            {name: "\u200B", value: "\u200B"},
            {name: "💰 **Salary**",
                value: `\`\`${prefix} help salary\`\``, inline: true},
            {name: "🌞 **Weather**",
                value: `\`\`${prefix} help weather\`\``, inline: true},
            {name: "\u200B", value: "\u200B"},
            {name: "📰 **Wikipedia**",
                value: `\`\`${prefix} help wiki\`\``, inline: true},
            {name: "🧐 **Whois**",
                value: `\`\`${prefix} help whois\`\``, inline: true},
        )
        .setTimestamp()
    return helpEmbed;
}

function helpCommand(receivedMessage, arguments) {
    if (arguments.length == 0) {
        receivedMessage.channel.send(createMainHelpEmbed());
        // receivedMessage.channel.send("I'm not sure what you need help with. Try: " +
        // `${prefix}help [topic]`);
    } else if (arguments.length == 1) {
        var embed;
        switch(arguments[0]) {
            case "directions":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("🗺 Directions")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} directions from <Australian Address>\`\``, inline:true},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} directions from 159 Church St Paramatta\n` +
                    `${prefix} directions from 321 W Botany St Rockdale\n` +
                    `${prefix} directions from 164 Campbell Parade Bondi Beach\n\`\`\``})
                break;
            case "permissions":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("🔐 Permissions")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} <update keyword> <user> <permission>\`\``, inline:true},
                    {name: "**Update Keywords**",
                    value:  `\`\`change, update, modify, set\n\`\``},
                    {name: "**Users**",
                    value:  `\`\`userID, username (or substring), @mention\n\`\``},
                    {name: "**Permissions**",
                    value: `\`\`https://discord.com/developers/docs/topics/permissions (text permissions)\`\``},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} modify @Discord CREATE INSTANT INVITE\n` +
                    `${prefix} set 571769108131612111 VIEW CHANNEL and ADD REACTIONS\n` +
                    `${prefix} update Dis USE EXTERNAL EMOJIS and ATTACH FILES\n\`\`\``})
                break;
            case "play":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("🎥 Play")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} play <video>\`\``, inline:true},
                    {name: "**Video**",
                    value:  `\`\`joker, shrek\n\`\``},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} play joker\n` +
                    `${prefix} play shrek\n\`\`\``})
                break;
            case "prefix":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("🛠 Prefix")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} <update keyword> prefix <linking word> <prefix name>\`\``, inline:true},
                    {name: "**Update Keywords**",
                    value:  `\`\`change, update, modify, set\n\`\``},
                    {name: "**Linking Words**",
                    value:  `\`\`with, as, to\n\`\``},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} modify prefix as usyd\n` +
                    `${prefix} set prefix to uws\n` +
                    `${prefix} update prefix to uow\n` +
                    `${prefix} change prefix to tafe\n\`\`\``})
                break;
            case "salary":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("💰 Salary")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} salary <job>\`\``, inline:true},
                    {name: "**Jobs**",
                    value:  `\`\`Any job from https://au.indeed.com/career\n\`\``},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} salary support worker\n` +
                    `${prefix} salary data scientist\n` +
                    `${prefix} salary java developer\n` +
                    `${prefix} salary cleaner\n\`\`\``})
                break;
            case "weather":
                embed = new Discord.MessageEmbed()
                    .setColor(randomColourPicker())
                    .setTitle("🌞 Weather")
                    .addFields({name: "**Usage**",
                    value: `\`\`${prefix} weather <city>\`\``, inline:true},
                    {name: "**City**",
                    value:  `\`\`Any city from with a populaton greater 15000 http://download.geonames.org/export/dump/cities15000.zip\n\`\``},
                    {name: "**Examples**",
                    value:  `\`\`\`${prefix} weather sydney\n` +
                    `${prefix} weather suva\n` +
                    `${prefix} weather los angeles\n` +
                    `${prefix} weather cape town\n\`\`\``})
                break;
            case "wiki":
                break;
            case "whois":
                break;
            default:
                receivedMessage.channel.send("It looks like you need help with " +
                arguments);
        }
        receivedMessage.channel.send(embed);
    } else {
        receivedMessage.channel.send("It looks like you've specified to many " +
        "arguments");
    }
}

// This function will play a given movie (joker or shrek).
function play(receivedMessage, arguments) {
    if (arguments[0] == "movie") {
        if (arguments[1] == "joker") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/338533206825500673/793723640495079444/Joker.webm")
        } else if (arguments[1] == "shrek") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/338533206825500673/793722980340727838/Shrek.webm")
        }
    } else {
        var authorId = receivedMessage.author.id;
        receivedMessage.channel.send(`Oh no! We could not find that video ` +
        `<@${authorId}>. 😢`)
    }
}

client.login(token);