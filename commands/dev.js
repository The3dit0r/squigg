const deart = require('deviantnode');

const cid = '16834';
const cr = process.env['DEVIANT_TOKEN'];
const module_aliases = ['dev'];

//const prefix = 'dev ';


module.exports = {
    name: "deviant",
    aliases: module_aliases,
    description: "Lol",
    async execute(message, args, cmd, client, Discord) {
        //if (!message.content.startsWith(prefix)) return;
        //const arg = .split(' ');
        //if (message.content.length > 20) return; 
        //if (message.content.split(' ').length != 1) return;
        
        if (args[0] === 'month'){
            deart.getPopularDeviations(cid,cr, {time: '1month'}).then(res => {
                var num = rng(0,res.results.length)
                console.log('searched popular results from the month');
                message.channel.send(`***Squigg found you a ${res.results[num].title} from ${res.results[num].author.username}***`)
                message.channel.send(res.results[num].content.src);
            });
        } else if (args[0] === 'day'){
            deart.getPopularDeviations(cid,cr, {time: '24hr'}).then(res => {
                var num = rng(0,res.results.length)
                console.log('searched popular results from the day');
                message.channel.send(`***Squigg found you a ${res.results[num].title} from ${res.results[num].author.username}***`)
                message.channel.send(res.results[num].content.src);
                //console.log(res.results[num]);
            });
        } else if (args[0] === 'week'){
            deart.getPopularDeviations(cid,cr, {time: '1week'}).then(res => {
                var num = rng(0,res.results.length)
                console.log(`searched popular results from the week`);
                message.channel.send(`***Squigg found you a ${res.results[num].title} from ${res.results[num].author.username}***`);
                message.channel.send(res.results[num].content.src);
            });
        } else if (args[0] === "author"){
          if (!args[1]) {
            message.channel.send(`***Pls input an author name***`)
            return
          }
          deart.getGalleryAllDeviations(cid,cr, { username: args[1] }) .then(res => {
            var num = rng(0, res.results.length)
            
           message.channel.send(`***Squigg found you a ${res.results[num].title} \n ${res.results[num].url}***`)
            });
         
        } else if (args[0] === "alltime"){
            deart.getPopularDeviations(cid,cr, {time: 'alltime'}).then(res => {
                var num = rng(0,res.results.length)
                console.log(`searched popular result from alltime`);
                message.channel.send(`***Squigg found you a ${res.results[num].title} from ${res.results[num].author.username}***`)
                message.channel.send(res.results[num].content.src);
                //console.log(res.results[num].content.src)
            });
        } else {
            deart.getPopularDeviations(cid,cr, {q: args.join(' '),time: 'alltime'}).then(res => {
                
                var num = rng(0,res.results.length)
                console.log(`searched for ${args.join(' ')} `);
                if (res.results.length === 0) {
                    message.channel.send("Squigg sadly cannot find anything")
                } else {
                    message.channel.send(`***Squigg found you a ${res.results[num].title} from ${res.results[num].author.username}***`);
                    message.channel.send(res.results[num].content.src);
                }
            }); 
        }
    }
}




const rng = (min, max) => {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 

}



