import {} from 'dotenv/config';
import fs from 'fs';
import dedent from 'dedent-js';
import {Client, Intents, MessageEmbed} from 'discord.js';
import {HenrikDevValorantAPI} from 'unofficial-valorant-api';
import { start } from 'repl';
const VAPI = new HenrikDevValorantAPI();


const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS"
    ]
});

function addToCount(messagez){
    var tempCount = fs.readFileSync('buttercount','utf8');
    tempCount++;
    tempCount=tempCount.toString();
    fs.writeFileSync('buttercount',tempCount);
}

async function findMMR(version, region, name, tag, message){
    const mmrData = await VAPI.getMMR({ version, region, name, tag });
    const accountData = await VAPI.getAccount({name,tag});
    if(mmrData.status===200){
        message.channel.send( {files: [`${accountData.data.card.wide}`]});
        message.channel.send(dedent`>>> Current Ranked Information:
        Player: ${name}#${tag}
        Level: ${accountData.data.account_level}
        Current rank: ${mmrData.data.currenttierpatched}
        Current rr:${mmrData.data.ranking_in_tier}`
        );
    }
    else{
        message.channel.send(">>> ERROR: Player does not exist or you did not enter the correct name or tag.")
    }
}

async function findFilMMR(version, region, name, tag, filter, message){
    const mmrData = await VAPI.getMMR({version, region, name, tag, filter});
    const accountData = await VAPI.getAccount({name, tag});
    if(mmrData.status===200){
        let pWin = mmrData.data.wins / mmrData.data.number_of_games;
        pWin = pWin.toFixed(2) * 100;
        message.channel.send( {files: [`${accountData.data.card.wide}`]});
        message.channel.send(dedent`>>> ${filter} Ranked Information:
        Player:             ${name}#${tag}
        Highest rank:         ${mmrData.data.final_rank_patched}
        Number of games:    ${mmrData.data.number_of_games}
        Number of wins:     ${mmrData.data.wins}
        Win %:              ${pWin}
        `
        );
    }
    else{
        message.channel.send(">>> ERROR: Player does not exist or you did not enter the correct name, tag or episode/act.")
    }
}


const startOfCom = "!!";

//ready is the event we are listening for
//() => is the function that we call to handle the event. In this case we are making the function itself.
client.on("ready", () => {
    console.log(`${client.user.username} has logged in!`);
});

client.on("messageCreate",(message)=>{
    //If message is created by bot, return
    if(message.author.bot) return;

    //Parsing the message sent
    if(message.content.startsWith(startOfCom)){
        const [cmdName, ...args] = message.content
        .trim()
        .substring(startOfCom.length)
        .split(/\s+/);

    //If the message is only the prefix, send error message
        if(message.length===undefined && message.content.length===2){
            message.channel.send(">>> Please enter a valid command. Use !!help to see a list of commands.");
        }

    //If the command is help
        if(cmdName==="help"){
            message.channel.send(dedent`>>> ** Command Prefix: !! **
            List of commands:
            help: Lists all commands and basic info on bot.
            check: Displays player name, level, current rank and current rr of a player. Format: !!check name tag
            `);
        }
    //Rank Checker
        if(cmdName== "check"){
            if(args.length > 3)
                return message.reply('>>> Please use the format: name tag (optional:e4a1,e4a2,e4a3...).');
            else if(args.length===3){
                let version = "v2";
                let filter = args[2];
                findFilMMR(version,"na",args[0],args[1],args[2],message);
                
            }
            else{
                let version = "v1";
                let region = "na";
                findMMR(version, region, args[0], args[1], message);
            }
        }
    }
    else{
        let messagez = new Array();
        messagez = message.content.split(/\s+/);
        let endLen=messagez.length;
        for(let position in messagez){
            if(messagez[position].toLowerCase()=="butter"){
                addToCount(messagez);
                if(position==(endLen-1)){
                    var Count= fs.readFileSync('buttercount','utf8');
                    message.channel.send(">>> Butter has been sent "+ Count +" times.");
                }
            }
            else if(messagez[position].includes("🧈"||messagez[position]=="🧈")){
                addToCount(messagez);
                if(position==(endLen-1)){
                    var Count= fs.readFileSync('buttercount','utf8');
                    message.channel.send(">>> Butter has been sent "+ Count +" times.");
                }
            }
        }
    }
    console.log(`${message.createdAt} ${message.author.username}:${message.content}`);
})

client.on("messageDelete", async message=>{
    let logs = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE"});
    let entry = logs.entries.first();
    console.log(`${entry.executor.username} has deleted the message "${message.content}" which was sent by ${message.author.username} in ${message.channel.name}`);
})
client.login(process.env.TOKEN);