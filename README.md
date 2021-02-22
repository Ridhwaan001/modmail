# Modmail
A system allowing users to DM a bot which automatically creates a ticket in a server.
Open sourced and uses the MIT license, allowing you to modify/share the code.

# Support
If you need support, I unfortunately, do not have a Discord server at the time of writing this. However, if you really are stuck, email me on [info@ridhwaan.co.uk](mailto:info@ridhwaan.co.uk) and I may be able to help. <br>
For bug reports, please create an issue, or open a pull request if you can fix it.


# Setup

Open your terminal in the location you want to install Modmail.
Type and run 
```git clone https://github.com/Ridhwaan001/modmail.git```<br>
Next, CD into the directory, and create `config.json` in the same directory as index.js. Modify the following items:<br>

`presence` - Rich Presence of the bot<br>
`presencetype` - Type of the presence (Can be `PLAYING`, `WATCHING` or `LISTENING`)<br>
`token` - Your discord bot token.<br>
`guild` - Your Discord [Server's ID.](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)<br>
`category` - ID of the category new tickets are placed in. Permissions of tickets are synced with permissions of the parent category. <br>
Example JSON:
```json
{
  "token": "token",
  "presence": "your DMs",
  "presencetype": "WATCHING",
  "guild": "0123456789",
  "category": "0123456789"
}
```

Finally, in the directory of the files, run `npm i` to install the required dependencies. Due to the only dependency being Discord.js, it is also possible to run `npm i discord.js`. <br>
To start the bot, either type `node .` or use the provided `npm start` command.<br>
An `npm test` command is available for development, using a Node module called [Nodemon](https://npmjs.org/package/nodemon) which automatically restarts the process when it detects a file change.