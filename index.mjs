import {} from 'dotenv/config';
import {Client, Intents} from 'discord.js';
import {HenrikDevValorantAPI} from 'unofficial-valorant-api';
const VAPI = new HenrikDevValorantAPI();


const client = new Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS"
    ]
});

function addToCount(messagez){
    var tempCount = fs.readFileSync('buttercount','utf8');
    tempCount++;
    tempCount=tempCount.toString();
    fs.writeFileSync('buttercount',tempCount);
}


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
        if(cmdName=="check")
        {

            if(args.length != 2)
                return message.reply('Please provide name and tag of player.');
            else{
                let version = "v1";
                let region = "na";
                async function findMMR(version, region, name, tag){
                    const test = await VAPI.getMMR({ version, region, name, tag });
                    if(test.status===200){
                        message.channel.send(`Current Ranked Information:
                        Player: ${name}#${tag}
                        Current rank: ${test.data.currenttierpatched}
                        Current rr:${test.data.ranking_in_tier}`);
                        
                    }
                    else{
                        message.channel.send("ERROR: Player does not exist or you did not enter the correct name or tag.")
                    }
                }
                findMMR(version, region, args[0], args[1]);
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
                    message.channel.send("Butter has been sent "+ Count +" times.");
                }
            }
            else if(messagez[position].includes("🧈"||messagez[position]=="🧈")){
                addToCount(messagez);
                if(position==(endLen-1)){
                    var Count= fs.readFileSync('buttercount','utf8');
                    message.channel.send("Butter has been sent "+ Count +" times.");
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