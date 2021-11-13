const fs = require("fs");

const rawdata = fs.readFileSync("./data/8ball/8ball.json");
const data = JSON.parse(rawdata);
const module_aliases = ['q'];
//const prefix = 'dev ';


module.exports = {
    name: "ball",
    aliases: module_aliases,
    description: "answer random yes or no question",
    async execute(message, args, cmd, client, Discord) {
      var question = args.join(" ");
      var num = rng(0, data.length);
      const embed_message = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle(`***Squigg's fortune shop***`)
        .setThumbnail('https://www.clipartmax.com/png/middle/282-2827070_squigly-surprised-down-skullgirls-fukua.png')
        .setDescription(`***${question}*** \n*${data[num]}*`);
      message.channel.send(embed_message);
      
    }
}

const rng = (min, max) => {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 

}