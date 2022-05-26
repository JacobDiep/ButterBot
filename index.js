const Discord = require("discord.js");

require("dotenv").config();
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS"

    ]
});

const startOfCom = "!!";

//ready is the event we are listening for
//() => is the function that we call to handle the event. In this case we are making the function itself.
client.on("ready", () => {
    console.log(`${client.user.username} has logged in!`);
});

client.on("messageCreate",(message)=>{
    if(message.author.bot) return;
    
    if(message.content.startsWith(startOfCom)){
        const [cmdName, ...args] = message.content
        .trim()
        .substring(startOfCom.length)
        .split(/\s+/);
    }
    console.log(`${message.createdAt} ${message.author.username}:${message.content}`);
})

client.on("messageDelete",async message=>{
    let logs = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE"});
    let entry = logs.entries.first();
    console.log(`${entry.executor.username} has deleted the message "${message.content}" which was sent by ${message.author.username} in ${message.channel.name}`);
})
client.login(process.env.TOKEN);