//const Discord = require("discord.js");

const module_aliases = ['-reload']; 

module.exports = {
    name: "-reload",
    aliases: module_aliases,
    description: "Reload module for Bot",
    async execute(message, args, cmd, client, Discord){

        if (!args[0]) return message.reply('Please provide a command to reload !');

        let command = args[0].toLowerCase(); 

        try {
            delete require.cache[require.resolve(`./${command}.js`)];
            console.log(`Trying to reload: ./${command}.js`);

            client.commands.delete(command);
            const pull = require(`./${command}.js`);
            client.commands.set(command, pull);
        } catch (err){
            console.log(`Failed to reload: ${command}.js`);
            return message.channel.send(`Failed to reload: ${command}.js`);
        }

        console.log(`Reloaded: ./${command}.js`);
        return message.channel.send(`Reloaded: ${command}.js`);
    }
}