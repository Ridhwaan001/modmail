const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
client.login(config.token);

function quickEmbed(title, desc, authorObject) {
  var randomColour = Math.floor(Math.random() * 16777215).toString(16);
  return new Discord.MessageEmbed()
    .setTitle(title)
    .setAuthor(authorObject.tag, authorObject.avatarURL)
    .setColor(`#${randomColour}`)
    .setDescription(desc);
}

client.on("ready", () => {
  console.log(client.user.tag + " is online");
});

client.on("message", (message) => {
  if (message.content.toLowerCase() === "-rpc") {
    client.user.setActivity(config.presence, { type: config.presencetype });
    message.delete().catch((error) => {
      console.log(error);
      message.channel.send(error);
    });
  }
});

client.on("message", (message) => {
  if (message.channel.type === "dm") {
    if (message.author.id !== client.user.id) {
      console.log("DM received from " + message.author.tag);
      if (fs.existsSync("./tickets/userinfo/" + message.author.id + ".json")) {
        var raw = fs.readFileSync(
          "./tickets/userinfo/" + message.author.id + ".json",
          "utf8"
        );
        var data = JSON.parse(raw);
        var guild = client.guilds.cache.get(config.guild);
        if (guild.channels.cache.get(data.channelid) !== undefined) {
          var channel = client.channels.cache.get(data.channelid);
          channel.send(
            quickEmbed("New Message", message.content, message.author)
          );
          message.author.send(
            quickEmbed("Message sent!", message.content, message.author)
          );
        } else {
          message.channel.send(
            "**An error occured trying access your ticket.**\nPlease try again.\n\n**Error:**`Channel not found`"
          );
          fs.unlinkSync(`./tickets/userinfo/${message.author.id}.json`);
          fs.unlinkSync(`./tickets/channelinfo/${data.channelid}.json`);
        }
      } else {
        console.log("ticket not found - Creating");
        var guild = client.guilds.cache.get(config.guild);
        guild.channels
          .create("Ticket - " + message.author.tag, {
            parent: config.category,
            type: "text",
          })
          .then((channel) => {
            var userInfo = {
              channelID: channel.id,
            };
            var channelInfo = {
              userID: message.author.id,
            };
            console.log(userInfo);
            console.log(channelInfo);
            fs.writeFileSync(
              "./tickets/userinfo/" + message.author.id + ".json",
              `{"channelid" : "${channel.id}"}`
            );
            fs.writeFileSync(
              "./tickets/channelinfo/" + channel.id + ".json",
              `{"userid" : "${message.author.id}"}`
            );
            channel.send(`**New Ticket**\nAuthor ID: \`${message.author.id}\``);
            channel.send(
              quickEmbed("New Message", message.content, message.author)
            );
            message.author.send(
              quickEmbed("Message sent!", message.content, message.author)
            );
          });
      }
    }
  }
});

client.on("message", (message) => {
  if (message.channel.type !== "dm") {
    if (message.author.id !== client.user.id) {
      if (message.channel.name.toLowerCase().includes("ticket")) {
        var channelId = message.channel.id;
        if (fs.existsSync('./tickets/channelinfo/' + channelId + '.json')) {
        var rawData = fs.readFileSync(
          "./tickets/channelinfo/" + channelId + ".json",
          "utf8"
        );
        var data = JSON.parse(rawData);
        if (message.content.startsWith("-")) {
          if (message.content.startsWith("-close")) {
            var user = client.users.cache.get(data.userid);
            user.send("Your ticket was closed by " + message.author.tag);
            fs.unlinkSync(`./tickets/userinfo/${data.userid}.json`);
            fs.unlinkSync(`./tickets/channelinfo/${message.channel.id}.json`);
            message.channel.send("You can now safely delete this channel.");
          }
        } else {
          var user = client.users.cache.get(data.userid);
          user.send(
            quickEmbed("Response From Staff", message.content, message.author)
          );
        }
      }}
    }
  }
});
