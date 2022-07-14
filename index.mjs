import {} from 'dotenv/config';
import fs from 'fs';
import dedent from 'dedent-js';
import {Client, Intents, MessageEmbed} from 'discord.js';
import {HenrikDevValorantAPI} from 'unofficial-valorant-api';
import mongoose from 'mongoose';
import crosshairs from './schemas.mjs';




const VAPI = new HenrikDevValorantAPI();


const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS"
    ]
});

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,      
    maximumFractionDigits: 2,
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

//filtered mmr
async function findFilMMR(version, region, name, tag, filter, message){
    const mmrData = await VAPI.getMMR({version, region, name, tag, filter});
    const accountData = await VAPI.getAccount({name, tag});
    if(mmrData.status===200){
        let pWin = mmrData.data.wins / mmrData.data.number_of_games;
        pWin = (pWin* 100);
        message.channel.send( {files: [`${accountData.data.card.wide}`]});
        if(filter==="e5a1"){
            message.channel.send(dedent`>>> ${filter} Ranked Information:
            Player:             ${name}#${tag}
            Current Rank:         ${mmrData.data.final_rank_patched}
            Number of games:    ${mmrData.data.number_of_games}
            Number of wins:     ${mmrData.data.wins}
            Win %:              ${pWin}
            `
            );
        }
        else{
            message.channel.send(dedent`>>> ${filter} Ranked Information:
            Player:             ${name}#${tag}
            Final Rank:         ${mmrData.data.final_rank_patched}
            Number of games:    ${mmrData.data.number_of_games}
            Number of wins:     ${mmrData.data.wins}
            Win %:              ${pWin}
            `
            );
        }
    }
    else{
        message.channel.send(">>> ERROR: Player does not exist or you did not enter the correct name, tag, episode/act, or player has not been placed yet.")
    }
}


const startOfCom = "!!";
//ready is the event we are listening for
//() => is the function that we call to handle the event. In this case we are making the function itself.
client.on("ready", async () => {
    await mongoose.connect (process.env.mongooseURI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        keepAlive: true,
    })
    .then((m)=>{
        console.log("Connected to DB.");
    })
    .catch(err => {
        console.log(err);
    })
    console.log(`${client.user.username} has logged in!`);
});

client.on("messageCreate",async (message)=>{
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
        if(cmdName.toLowerCase()==="help"){
            message.channel.send(dedent`>>> ** Command Prefix: !! **
            List of commands:
            help: Lists all commands and basic info on bot.
            check: Displays player name, level, current rank and current rr of a player. Format: !!check name #tag OR !!check name #tag e1a1,e1a2,etc..
            `);
        }
    //Rank Checker
        else if(cmdName.toLowerCase() === "check"){
            let hash = "#";
            let name="";
            let tag="";
            let counter=0;
            for(let x in args){
                if(args[x].startsWith(hash)){
                    tag = args[x].trim().substring(hash.length);
                    counter++;
                    break;
                }
                else{
                name = name +" "+args[x];
                counter++;
                }
            }
            if(args[counter]){
                let version = "v2";
                let filter = args[counter];
                findFilMMR(version,"na",name,tag,filter,message);
            }
            else{
                let version = "v1";
                let region = "na";
                findMMR(version, region, name, tag, message);
            }
            
        }
        else if(cmdName.toLowerCase() === "ch"){
            if(args.length != 2){
                message.channel.send(">>> Please use the \"ch\" in the following format: !!ch (Name of crosshair) (Valorant code of crosshair) (picture of crosshair)");
            }
            else{
                const att = message.attachments.first();
                const ch = {
                    user: message.author.username,
                    name: args[0],
                    code: args[1],
                    imageURL: att.url
                }
                await new crosshairs(ch).save();
            }
        }
    }
    else{
        //butter count checker
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

//buggy audit log for message delete
client.on("messageDelete", async message=>{
    let logs = await message.guild.fetchAuditLogs({ type: "MESSAGE_DELETE"});
    let entry = logs.entries.first();
    console.log(`${entry.executor.username} has deleted the message "${message.content}" which was sent by ${message.author.username} in ${message.channel.name}`);
})

client.login(process.env.TOKEN);