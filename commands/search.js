const fs = require('fs')
const yt = require('yt-search');

const rawdata = fs.readFileSync('./data/search/searches.json');
var rawdata2 = fs.readFileSync('./data/search/added.json');

var data2 = JSON.parse(rawdata2);
const data = JSON.parse(rawdata);

const today = new Date();
const targeted_channel = "769441624862228521";

const prefix = 'search ';
const prefix2 = 'search first ';



module.exports = {
    name: 'search',
    aliases: [],
    description: 'Old function for Squigg',
    async execute(message, cmd, client, Discord) {
        //if (message.author.bot) return;
        //setInterval(primage(), 1800000);

        if (cmd === prefix2){
            const a = message.content.slice(prefix2.length);
            searchfirst(message, a);
        } else if (cmd === prefix){
            const command = message.content.slice(prefix.length);
            if (command === 'random') {
                var location;
                var b = rng(0, 10);
                if (b < 7) {
                    location = data;
                } else {
                    location = data2;
                }
                const a = location[rng(0, location.length)].name;
                //message.channel.send("Squigg found you a random image!");
                search(message, a);
            } else {
                const a = message.content.slice(prefix.length);
                for (let i = 0; i < data.length; i++) {
                    if (a === data[i].name) {
                        console.log("data already has this item");
                        break;
                    }
                    if (i + 1 === data.length) {
                        for (let i = 0; i <= data2.length; i++) {
                            if (a === data2[i].name) {
                                console.log("data2 already has this item");
                                break;
                            }
                            if (i + 1 === data2.length) {
                                console.log(`New item added ${a}`);
                                add(a);
                                break;
                            }
                        }
                    }
                }
                search(message, a);
            }
        }
    }
}



//begin list of functions

const search = (message, a) => {
    yt(a).then (lmao => {
    const hmmm = lmao.videos[rng(1, 19)];
    if (!hmmm) {
        for (let i = 1; i <= 18; i++) {
            if (lmao.videos[i]) {
                break;
            }
            if (i === 18) {
                message.channel.send("***Squigg sadly cannot find anything***");
                return;
            }
        }
    }
    
    //console.log(lmao.videos.length)
    console.log(hmmm.title);
    console.log(hmmm.url);
    message.channel.send(hmmm.thumbnail);
    if (message.content.slice(prefix.length) === "random") {
        message.channel.send("***Squigg found you a random image!***")
    } else {
        message.channel.send(`***Squigg found you a ${a}***`)
    }
})
}

const searchfirst = (message, a) => {
    yt(a).then(lmao => {
      const hmmm = lmao.videos[0];
      if (!hmmm) {
          message.channel.send("***Squigg sadly cannot find anything on top of da list***")
          return;
      }
      console.log(hmmm.title);
      console.log(hmmm.url);
      message.channel.send(hmmm.thumbnail);
      message.channel.send(`***Here is the first ${a} that Squigg found***`)
    });
}

/*const search2 = async (a) => {
    yt(a).then(lmao => {
        const hmmm = lmao.videos[rng(1, 19)];
        if (!hmmm) {
            for (let i = 1; i <= 18; i++) {
                if (lmao.videos[i]) {
                    break;
                }
                if (i === 18) {
                    client.channels.cache.get(targeted_channel).send("***Squigg sadly cannot fetch you a daily image***");
                    return;
                }
            }
        }
    });
    
    console.log(hmmm.title);
    console.log(hmmm.url);
    client.channels.cache.get(targeted_channel).send(hmmm.thumbnail);
    client.channels.cache.get(targeted_channel).send("***Squigg found your daily does of random image!***");
}*/

const add = (a) => {
    const lmao = {
        name: a
    }
    data2.push(lmao)
    const fuck = JSON.stringify(data2, null, 2);
    fs.writeFile('./data/search/added.json', fuck, err => {console.log(err)});
}
const primage = () => {
    var location2;
    var c = rng(0, 10);
    if (c < 7) {
        location2 = data;
    } else {
        location2 = data2;
    }

    const a = location2[rng(0, location2.length)].name;
    const hour = today.getHours()
    const minute = today.getMinutes()
    if (hour === 23) {
        if (minute - 0 < 30) {
            console.log("sending daily dose of radom image")
            search2(a);
        }
    }
    //search2(a);


}
const rng = (min, max) => {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}