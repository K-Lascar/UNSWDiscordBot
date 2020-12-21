const { timeStamp } = require("console");
const Discord = require("discord.js")
const client = new Discord.Client()
const {prefix, token, clientID, generalChannelID, botID,
        ownerKey} = require("./config.json");
const client_presence = require('discord-rich-presence')(ownerKey);

"use strict";

// Can trigger multiple times (unlike .once)
client.on("ready", () =>{
    console.log("Connected as " + client.user.tag)
    // client.user.setActivity("with JavaScript")
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
        msg.delete({timeout: 9000})
    }).catch(/*Your Error handling if the Message isn't returned, sent, etc.*/)
    // generalChannel.send("Hello World")
})

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
    console.log(receivedMessage.content);
    if (receivedMessage.content.startsWith(prefix)) {
        processCommand(receivedMessage);
    }
})

function randomColourPicker() {
    return [0x7fffd4, 0x458b74, 0x838b8b, 0xff4040, 0x5f9ea0,
    0x7fff00, 0xff3e96, 0x00c5cd, 0xee5c42, 0xcdc9c9, 0xffa54f, 0xee7942,
    0xee8262, 0xeeb4b4, 0xffbbff, 0x98fb98, 0x00fa9a, 0xab82ff, 0xee30a7,
    0xee00ee, 0xfaf0e6, 0xffffe0, 0x00ffcc][Math.random() * 23]
}

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1)
    // Regex / +/ if many spaces provided
    let splitCommand = fullCommand.split(/ +/)
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log("Arguments: " + arguments)
    console.log("SplitCommand: " + splitCommand)
    console.log("PrimaryCommand: " + primaryCommand)

    if (!splitCommand.length || !primaryCommand.length) {
        // receivedMessage.reply("no arguments were provided, please use command ?help")
        const user = receivedMessage.mentions.users.first() || receivedMessage.author
        const userDetails = client.users.cache.get(user.id)
        console.log(userDetails.discriminator);
        console.log(receivedMessage.mentions);
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor(randomColourPicker())
            .setTitle("User Profile")
            .setAuthor(`${userDetails.tag}`, user.avatarURL())
            .setDescription(`${'HI'}`)
            .addField('Inline field title', 'Some value here', true)
            .setThumbnail(user.avatarURL())
        receivedMessage.channel.send(exampleEmbed);
    } else if (primaryCommand == "help") {
        helpCommand(arguments, receivedMessage);
    } else if (primaryCommand == "play") {
        play(arguments, receivedMessage);
    } else if (primaryCommand == "whois") {
        // https://stackoverflow.com/questions/55605593/i-am-trying-to-make-a-discord-js-avatar-command-and-the-mentioning-portion-does
        // Instead of select receivedMessage, we need to check if user specifies
        // a substring (look for it, if doesn't exist don't search for it).
        // Or they specify a id search for that.

        var user = retrieveMentionUser(receivedMessage, arguments);
        if (user) {
            var userDetails = client.users.cache.get(user.id);
            var member = receivedMessage.guild.member(userDetails);
            var embed = createWhoIsEmbed(member, user, userDetails);
        } else {
            var embed = createErrorEmbed(arguments);
        }

        receivedMessage.channel.send({embed: embed});
    }

    // console.log(receivedMessage.author);
}

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

function retrieveMentionUser(receivedMessage, arguments) {
    var isMentioned = receivedMessage.mentions.users.first();
    var isIdentified = client.users.cache.get(arguments[0]);
    var isSelected = client.users.cache.find(user => user.username.startsWith(arguments[0]));
    console.log(isMentioned || isIdentified || isSelected)
    return isMentioned || isIdentified || isSelected;
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
        receivedMessage.channel.send("Invalid command. ")
    }
}

client.login(token)

