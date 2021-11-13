const xkcd = require('xkcd');
const module_aliases = ['xkcd'];

module.exports = {
    name: "xkcd",
    aliases: module_aliases,
    description: "Lol",
    async execute(message, args, cmd, client, Discord) {
      
      if (args[0] === 'random'){
        xkcd(function (data) {
        var a = rng(1, data.num+1)
          xkcd(a, function (e) {
            message.channel.send(e.alt)
            message.channel.send(e.img)
            console.log(e.num)
          });
        })
      }
      else {
          xkcd(args[0], function (a) {
          message.channel.send(a.alt)
          message.channel.send(a.img)
          console.log(a.num)
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