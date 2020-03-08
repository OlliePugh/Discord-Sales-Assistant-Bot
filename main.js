const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

var ticket_num = 0;

var rooms = []

function create_help_room(guild, customer, staff){
  return new Promise(function(resolve, reject) {
    let room_name = "sale_room_"+ticket_num
    guild.channels.create(room_name, {
      type: "text",
      topic: "Assist in Purchase",
      nsfw: false,
      position: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ["VIEW_CHANNEL", "SEND_MESSAGES"]
        },
        {
          id: customer.id,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
        },
        {
          id: staff.id,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
        },
      ]
    }).then(room => {
      rooms.push(room);  // add the room to the array of opened rooms
    });
    ticket_num++
    customer.send("A room with the name #" + room_name + " has been opened and a member of staff will be waiting there for you");
    resolve(room_name);
    return;
  });
}

function staff_response(response, customer, staff, awaiting_responses){ // customer and staff should both be members
  awaiting_responses = awaiting_responses.filter(item => item.channel.id !== undefined); //remove each undefined value
  if (response === true){ //the staff member can help
    create_help_room(customer.guild, customer, staff).then(room_name => { // no need to remove the collector as it will be closed after the response
      staff.send("The customer is expecting you in #"+room_name);
    });
    awaiting_responses
    if (awaiting_responses.length > 0) {
      awaiting_responses.forEach(async collector => {
        collector.stop("Another member of staff is handling the transaction");
      });
    }
  }
  else { // the staff member can not help
    staff.send("No problem");
    awaiting_responses = awaiting_responses.filter(collector => collector.channel.id !== staff.user.dmChannel.id); // remove the collector from the awaiting awaiting_responses
  }
  if (awaiting_responses.filter(collector => !collector.ended).length === 0 && response === false){ // all staff members have not been able to help
    customer.send("Unfortunately no members of staff are currently able to help, please try again later");
  }
}

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

if (!config.staff_role){
  console.error("You have not set your staff role id");
  process.exit(42);
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.startsWith(`${config.prefix}done`)){
    if (rooms.includes(msg.channel)){
      rooms = rooms.filter(room => room.id !== msg.channel.id); // remove it from the active rooms list
      msg.channel.delete();
    }
  }
});

client.on("messageReactionAdd", async function(reaction, user){
  // fetch message data if we got a partial event
  if (reaction.message.partial) await reaction.message.fetch();

  if (reaction.message.channel.id === config.channel_id){ // if the reaction was in the shop channel
    let message = await user.send("Would you like a member of staff to assist you with a purchase of: \n"+reaction.message.content+"\n\nRespond with (Y/N)");

    let collector = new Discord.MessageCollector(message.channel, m => m.author.id === user.id, { time: 30000, max: 1});
    collector.on('collect', async message => {
      if (message.content.toLowerCase() === "y") {
        user.send("Waiting for a staff member to respond");

        let staff_map = await reaction.message.guild.roles.fetch(config.staff_role);
        let staff = await staff_map.members.map(m=>m.user);
        let staff_collectors = [];

        staff.forEach(staff_user => {  // for each member with the tole of staff
          staff_user.send("Can you assist someone with a sale right now? (Y/N)").then(message => {
            let staff_collector = new Discord.MessageCollector(staff_user.dmChannel, m => m.author.id === staff_user.id, { time: 30000, max: 1});
            staff_collectors.push(staff_collector);
            staff_collector.on("collect", async message => { // this waits for a response from a staff member to accept the job
              let staff_member = await reaction.message.guild.members.fetch(staff_user.id);
              let customer_member = await reaction.message.guild.members.fetch(user.id);
              if (message.content.toLowerCase() === "y"){
                staff_response(true, customer_member, staff_member, staff_collectors);
              }
              else{
                staff_response(false, customer_member, staff_member, staff_collectors);
              }
            });
            staff_collector.on("end", function(collected, reason) {
              if (reason !== "limit" && reason !== "time") staff_user.send(reason);
              else if (reason === "time") staff_user.send("Took too long to respond, cancelled order");
            });
          });
        });

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
