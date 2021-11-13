const fs = require("fs");
const request = require("request")

const reaction = require("../data/reaction");

const part1 = ["hug", "kiss", "punch", "slap", "wink", "pat", "kill", "cuddle"]

const part2 = ["angry", "anime", "bite", "bored", "bread", "chocolate", "cookie", "cuddle", "dance", "drunk", "happy", "kill", "kiss", "laugh", "lick", "lonely", "pat", "poke", "pregnant", "punch", "run", "satouselfies", "sleep", "spank", "spit", "steal", "tickle"]

const part3 = reaction.getAvailable();
/*
var c = [].concat(part1, part2, part3);
var d = [...new Set(c)]
console.log(d)
*/

const module_aliases = ["gifm"];

module.exports = {
  name: "gif",
  aliases: module_aliases,
  description: "send animated gifs to keywords",
  //screw weeb.sh
  async execute(message, args, cmd, client, Discord, author, target) {

    var s_term = cmd;
    var mode = 0;
    if (part1.includes(s_term)) mode += 1;
    if (part2.includes(s_term)) mode += 2;
    if (part3.includes(s_term)) mode += 4;
		var target = "", author = message.author.username;
		
		if (args.length){
			const user = await client.users.fetch(args[0].substring(3,21)).catch(err => {
				console.log(err);
				//return message.channel.send("***Cant find ping person!!!***");
			});
			target = user.username;
		}

    console.log(`mode: ${mode}, s_term: ${s_term}, author: ${author}, args: ${target}`);
    
    switch (mode) {
      case 0:
        return;
      case 1:
        send1(s_term, message, Discord, author, target);
        break;
      case 2:
        send2(s_term, message, Discord, author, target);
        break;
      case 3:
        (rng(0, 2 === 1)) ? send1(s_term, message, Discord, author, target): send2(s_term, message, Discord, author, target);
        break;
      case 4:
        send3(s_term, message, Discord, author, target);
        break;
      case 5:
        (rng(0, 2) === 1) ? send1(s_term, message, Discord, author, target): send3(s_term, message, Discord, author, target);
        break;
      case 6:
        (rng(0, 2) === 1) ? send2(s_term, message, Discord, author, target): send3(s_term, message, Discord, author, target);
        break;
      case 7:
        (rng(0, 2) === 1) ? send1(s_term, message, Discord, author, target): (rng(0, 2) === 1) ? send2(s_term, message, Discord, author, target) : send3(s_term, message, Discord, author, target);
        break;
    }
  }
}

const rng = (min, max) => {
  //The maximum is exclusive and the minimum is inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);

}

const send1 = (s_term, message, Discord, author, target) => {
  var link = "https://anime-api.hisoka17.repl.co/img/"

  link += s_term;

	var quote = reaction.getQuote(s_term, author, target);
	if (!quote) return message.channel.send("***Please ping someone !!!!***");

  request(link, function(error, response, body) {
    var object = JSON.parse(body)

        var embed_message = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle(quote)
        .setImage(object.url)

    message.channel.send(embed_message)
    console.log(`searches in group no1: ${s_term}`)
  });
  return
}

const send2 = (s_term, message, Discord, author, target) => {
  var link = "https://api.satou-chan.xyz/api/endpoint/"

  link += s_term;

	var quote = reaction.getQuote(s_term, author, target);
	if (!quote) return message.channel.send("***Please ping someone !!!!***");

  request(link, function(error, response, body) {
    var object = JSON.parse(body)
    
        var embed_message = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle(quote)
        .setImage(object.url)

    message.channel.send(embed_message)
    console.log(`searches in group no2: ${s_term}`)
  });
  return
}

const send3 = (s_term, message, Discord, author, target) => {
  var a = reaction.getRandom(s_term);

	var quote = reaction.getQuote(s_term, author, target);
	if (!quote) return message.channel.send("***Please ping someone !!!!***");
	
        var embed_message = new Discord.MessageEmbed()
        .setColor('#000000')
        .setTitle(quote)
        .setImage(a)
        
      
  message.channel.send(embed_message)
  console.log(`searches in group no3: ${s_term}`)
  return
}

