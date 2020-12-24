const { timeStamp } = require("console");
const Discord = require("discord.js")
const client = new Discord.Client()
const {prefix, token, clientID, generalChannelID, botID,
        ownerKey, openWeatherAPIKey} = require("./config.json");
const client_presence = require('discord-rich-presence')(ownerKey);
const fs = require("fs");
const path = require("path");
// Can trigger multiple times (unlike .once)
client.on("ready", () =>{

    var activityIndex = 0;
    // Updates Bot's activity every 30 minutes.
    setInterval(() => {
        var activityList = ["📺Youtube📺", "📺outubeY📺", "📺utubeYo📺", "📺tubeYou📺",
        "📺ubeYout📺", "📺beYoutu📺", "📺eYoutub📺"]
        client.user.setActivity(activityList[activityIndex], {type:"WATCHING"});
        activityIndex = (activityIndex + 1) % activityList.length;
    }, 30000);

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
    // generalChannel.send("Hello World")
})


// Interesting implementation add ability to change status, such that it moves (has motion).
client_presence.updatePresence({
    state: 'MacOS Mojave',
    // details: '🐍',
    startTimestamp: Date.now(),
    largeImageKey: 'virtualbox',
    largeText: "virtualbox",
    smallImageKey: 'mojave',
    smallText: "mojave",
    instance: true,
});

client.on("message", (receivedMessage) => {
    // if (receivedMessage.author == client.user) {
    //     return
    // }

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
    var fullCommand = receivedMessage.content.substr(prefix.length + 1)
    // Regex / +/ if many spaces provided
    var splitCommand = fullCommand.split(/ +/)
    var primaryCommand = splitCommand[0]
    var arguments = splitCommand.slice(1)
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
    } else if (primaryCommand == "purge") {

    } else if ((primaryCommand == "change" ||
                primaryCommand == "update" ||
                primaryCommand == "modify" ||
                primaryCommand == "set") &&
                arguments.length >= 4) {
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
        authorId = receivedMessage.author.id
        receivedMessage.channel.send(`Hello <@${authorId}>`)
    } else if (primaryCommand == "weather") {
        //https://github.com/girliemac/fb-apiai-bot-demo/blob/master/webhook.js
        // https://www.smashingmagazine.com/2017/08/ai-chatbot-web-speech-api-node-js/
        if (arguments.length >= 1) {
            // let weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${openWeatherAPIKey}`

        }
    } else {

    }
}

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


function retrievePermissions(permission) {
    // https://discord.com/developers/docs/topics/permissions
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
}

function checkLinking(argument) {
    return ["with", "as", "to"].includes(argument);
}

// function chatWith
function createErrorEmbed(arguments) {
    var errorEmbed = {
        color: 0xff4500,    // Color orange red.
        title: `❌ Invalid User ${arguments.join(" ")}`,
    }
    return errorEmbed;
}

function createWhoIsEmbed(member, user, userDetails) {
    var date = new Date();

    // https://support.discord.com/hc/en-us/community/posts/360041823171/comments/360012230811
    // https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object
    // https://stackoverflow.com/a/50374666/14151099
    var messageEmbed = {
        color: randomColourPicker(),
        title: "User Profile",
        author: {
            name: `${userDetails.tag}`,
            icon_url: `${user.avatarURL()}`,
        },
        thumbnail: {
            url: `${user.avatarURL()}`
        },
        fields: [
            {
                name: "**Joined Date**",
                value: `${member.joinedAt.toDateString()}`,
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
            text: `ID: ${userDetails.id} \n` +
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

function updatePrefix(newPrefix) {
    // https://stackoverflow.com/a/21035861
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    jsonFile["prefix"] = newPrefix;
    // https://attacomsian.com/blog/javascript-pretty-print-json
    fs.writeFileSync("config.json", JSON.stringify(jsonFile, null, 4));
}

function getCurrentPrefix(receivedMessage) {
    var jsonFile = JSON.parse(fs.readFileSync("config.json").toString());
    receivedMessage.channel.send(`The current prefix is ${jsonFile["prefix"]}`)
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
        } else if (arguments[1] == "mario") {
            receivedMessage.channel.send("https://cdn.discordapp.com/attachments/378993812309016577/771666532551622656/long_endless_stairs.webm")
        }
    } else {
        receivedMessage.channel.send("Invalid Video. ")
    }
}

client.login(token)

