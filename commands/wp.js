const request = require('request');
const APICODE = process.env['WPHAVEN_TOKEN'];
const module_aliases = ['wp', 'wtf'];


module.exports = {
		name: "wallpaper Fetcher",
		aliases: module_aliases,
    description: "a random shit i add for fun",
    async execute(message, args, cmd, client, Discord) {
				var n = args.shift();
				var s = args.join(' ');
				switch (n) {
						case 't':
								send_wallpaper(message, s, 'relevance');
						break;

						case 'n':
								send_wallpaper(message, s, 'date_added');
						break;

						case 'b':
								send_wallpaper(message, s, 'toplist', '1y');
						break;

						default:
								send_wallpaper(message, s, 'random');
						break;
				}
		}
}


const send_wallpaper = (message, tag, sorting, topRange) => {
    const search_url = `https://wallhaven.cc/api/v1/search?q=${tag}&sorting=${sorting}&topRange=${topRange}`;

    const options = {
      method: 'GET',
      url: search_url,
      headers: {Authorization: `Bearer ${APICODE}`}
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);
			var a = JSON.parse(body)
      message.channel.send(a.data[0].path);
    });
}



/*const { AnimeWallpaper } = require("anime-wallpapers")
const awp = new AnimeWallpaper();


//const prefix = 'dev ';


module.exports = {
    name: "wallpaper fetcher",
    aliases: module_aliases,
    description: "a random shit i add for fun",
    async execute(message, args, cmd, client, Discord) {
      if (cmd == "wtf"){
        awp.getAnimeWall2(args.join(' '))
        .then (res => {
          var wallpaper = res;
          console.log(wallpaper[0])
          message.channel.send(`Squigg found you a ${wallpaper[0].title}`)
          message.channel.send(wallpaper[0].image)
        }).catch (err => {
          message.channel.send(`Squigg sadly cannot find anything`)
          throw err;
        });
      } else if (cmd == "wp"){
        awp.getAnimeWall2(args.join(' '))
        .then (res => {
          var wallpaper = res;
          var a = rng(0, wallpaper.length)
          console.log(wallpaper[a])
          message.channel.send(`Squigg found you a ${wallpaper[a].title}`)
          message.channel.send(wallpaper[a].image)
        }).catch (err => {
          message.channel.send(`Squigg sadly cannot find anything`)
          throw err;
        });
      }
    }
}

const rng = (min, max) => {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 

}*/