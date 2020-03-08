const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });




//config.json checks

if (!config.token){
  console.error("You have not set your discord token");
  process.exit(42);
}

if (!config.prefix){
  console.error("You have not a prefix for commands");
  process.exit(42);
}

if (!config.channel_id){
  console.error("You have not set your shop channel id");
  process.exit(42);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

});

client.on("messageReactionAdd", async function(reaction, user){
  // fetch message data if we got a partial event
  if (reaction.message.partial) await reaction.message.fetch();

  if (reaction.message.channel.id === config.channel_id){ // if the reaction was in the shop channel
    let message = await user.send("Would you like a member of staff to assist you with a purchase of: \n"+reaction.message.content+"\n\nRespond with (Y/N)");

    let collector = new Discord.MessageCollector(message.channel, m => m.author.id === user.id, { time: 10000, max: 1});
    collector.on('collect', message => {
      if (message.content.toLowerCase() === "y") {
        message.channel.send("Creating a room for you and a staff member to talk in");
      }
      else if (message.content.toLowerCase() === "n"){
        message.channel.send("No problem, have a good day");
      }
      else{
        message.channel.send("Invalid response, please react to the post again");
      }
    });
  }
});

client.login(config.token);
