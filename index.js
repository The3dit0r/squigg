const Discord = require('discord.js');
const keepfucked = require('./server');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });


client.commands = new Discord.Collection();
client.events 	= new Discord.Collection();


['command_handler', 'event_handler', ].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

keepfucked();
client.login(process.env['BOT_TOKEN']);



