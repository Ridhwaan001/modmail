const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
client.login(config.token);

function quickEmbed(title, desc, authorObject, message) {
  var randomColour = Math.floor(Math.random() * 16777215).toString(16);
  if (message.attachments.size > 0) {
    message.attachments.each((attatch) => {
      image = attatch.url;
    });
    var final = new Discord.MessageEmbed()
      .setTitle(title)
      .setAuthor(authorObject.tag, authorObject.avatarURL())
      .setColor(`#${randomColour}`)
      .setImage(image)
      .setDescription(desc);
  } else {
    var final = new Discord.MessageEmbed()
      .setTitle(title)
      .setAuthor(authorObject.tag, authorObject.avatarURL())
      .setColor(`#${randomColour}`)
      .setDescription(desc);
  }
  return final;
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

client.on("message", async (message) => {
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
          await channel.send(
            await quickEmbed(
              "New Message",
              message.content,
              message.author,
              message
            )
          );
          await message.author.send(
            await quickEmbed(
              "Message sent!",
              message.content,
              message.author,
              message
            )
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
          .then( async channel => {
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
            if (
              config.autoResponderEnabled === true &&
              config.autoResponse !== undefined
            ) {
              await message.author.send(
                await quickEmbed(
                  "Ticket Created",
                  "**Automated Response:**\n" + config.autoResponse,
                  client.user,
                  message
                )
              );
            }
            await channel.send(`**New Ticket**\nAuthor ID: \`${message.author.id}\``);
            await channel.send(
              await quickEmbed(
                "New Message",
                message.content,
                message.author,
                message
              )
            );
            await message.author.send(
              await quickEmbed(
                "Message sent!",
                message.content,
                message.author,
                message
              )
            );
            
          });
      }
    }
  }
});

client.on("message", async (message) => {
  if (message.channel.type !== "dm") {
    if (message.author.id !== client.user.id) {
      if (message.channel.name.toLowerCase().includes("ticket")) {
        var channelId = message.channel.id;
        if (fs.existsSync("./tickets/channelinfo/" + channelId + ".json")) {
          var rawData = fs.readFileSync(
            "./tickets/channelinfo/" + channelId + ".json",
            "utf8"
          );
          var data = JSON.parse(rawData);
          if (message.content.startsWith("-")) {
            if (message.content.startsWith("-close")) {
              var user = client.users.cache.get(data.userid);
              user
                .send("Your ticket was closed by " + message.author.tag)
                .catch((error) => {
                  message.channel.send(
                    "**An Error Occured.**\n" + "Code: " + error.code
                  );
                });
              fs.unlinkSync(`./tickets/userinfo/${data.userid}.json`);
              fs.unlinkSync(`./tickets/channelinfo/${message.channel.id}.json`);
              message.channel.send(
                quickEmbed(
                  "Ticket Closed",
                  "It is now safe to delete this channel.",
                  message.author,
                  message
                )
              );
            }
          } else {
            var user = await client.users.fetch(data.userid);
            await message.channel.send(
              await quickEmbed(
                "Message Delivered",
                message.content,
                message.author,
                message
              )
            );
            await user
              .send(
                await quickEmbed(
                  "Response From Staff",
                  message.content,
                  message.author,
                  message
                )
              )
              .catch((error) => {
                message.channel.send(
                  quickEmbed(
                    "An error occured with this ticket",
                    "Error Code: " + error.code,
                    message.author,
                    message
                  )
                );
              });
            message.delete();
          }
        }
      }
    }
  }
});

client.on("message", async (message) => {
  if (message.channel.type !== "dm") {
    if (message.content.toLowerCase().startsWith("-new ")) {
      if (message.member.hasPermission("MANAGE_MESSAGES")) {
        var args = message.content.split(" ");
        args.shift();
        console.log(args[0]);
        var user = "";
        if (args[0].startsWith("<@") && args[0].endsWith(">")) {
          var user = message.mentions.users.first();
        } else {
          var user = await client.users.fetch(args[0]);
          console.log(user);
        }
        console.log(user);
        if (user) {
          if (fs.existsSync("./tickets/userinfo/" + user.id + ".json")) {
            var raw = fs.readFileSync(
              "./tickets/userinfo/" + user.id + ".json",
              "utf8"
            );
            var data = JSON.parse(raw);
            var guild = client.guilds.cache.get(config.guild);
            if (guild.channels.cache.get(data.channelid) !== undefined) {
              var channel = client.channels.cache.get(data.channelid);
              message.channel.send("**Ticket exists.**" + `\n<#${channel.id}>`);
            } else {
              message.channel.send("Invalid Ticket - Deleting files");
              fs.unlinkSync(`./tickets/userinfo/${user.id}.json`);
              fs.unlinkSync(`./tickets/channelinfo/${data.channelid}.json`);
            }
          } else {
            console.log("ticket not found - Creating");
            var guild = client.guilds.cache.get(config.guild);
            guild.channels
              .create("Ticket - " + user.tag, {
                parent: config.category,
                type: "text",
              })
              .then((channel) => {
                var userInfo = {
                  channelID: channel.id,
                };
                var channelInfo = {
                  userID: user.id,
                };
                console.log(userInfo);
                console.log(channelInfo);
                fs.writeFileSync(
                  "./tickets/userinfo/" + user.id + ".json",
                  `{"channelid" : "${channel.id}"}`
                );
                fs.writeFileSync(
                  "./tickets/channelinfo/" + channel.id + ".json",
                  `{"userid" : "${user.id}"}`
                );
                channel.send(
                  "Ticket Created!\nUser: " +
                    user.id +
                    "\nMessages with `-` at the start are ignored. Use `-close` to close tickets."
                );
                user
                  .send(
                    `${message.author.tag} from ${message.guild.name} created a ticket in this DM.`
                  )
                  .catch((error) => {
                    console.log(error);
                  });
              });
          }
        } else {
          message.channel.send("User not found").catch((error) => {
            message.channel.send(
              "**An Error Occured.**\n" + "Code: " + error.code
            );
          });
        }
      } else {
        message.reply(
          "**You must have the `MANAGE_MESSAGES` permission to use this command!**"
        );
      }
    }
  }
});
