const token = process.env['PIXIV_TOKEN'];
const fs = require('fs');
const PixivApi = require('pixiv-api-client');
const pixivImg = require('pixiv-img');
const translate = require('@vitalets/google-translate-api');
//translate.language['Japanese'] = 'ja'

var queue_illust = new Map();

var g_quality = 3;

const module_aliases = ['pixiv','pexev', 'pxquality','bookmarkillust','deletequeueillust','relatedillust'];

const rawdata = fs.readFileSync('./data/pixiv/search-term.json');
var search_term = JSON.parse(rawdata);

module.exports = {
    name: "pixiv",
    aliases: module_aliases,
    description: "Wowowowowow Nice",
    async execute(message, args, cmd, client, Discord){

        if (cmd === 'bookmarkillust'){
            //console.log();
            //console.log(message);
            bookmark_illust(message, args, client);
            return;
        }

        if (cmd === 'relatedillust'){
            send_related_illust(message, args, client);
        }

        if (cmd === 'deletequeueillust'){
            if (!queue_illust.get(args)) return;
            message.channel.messages.fetch({around: args, limit: 1})
            .then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(`❎ ${message.content}`, {
                    files: [message.attachments.first().attachment]
                });
            });
            message.reactions.removeAll();
            queue_illust.delete(args);
            return;
        }

        if (cmd === 'pixiv'){
            console.log("Request received!!");
            //console.log(args[0]);
            if (args[0] === 'day'){
                send_recommended_illust(Discord, message, 'day', null);
                return;
            }

            if (args[0] === 'month'){
                send_recommended_illust(Discord, message, 'month', null);
                return;
            }

            if (args[0] === 'week'){
                send_recommended_illust(Discord, message, 'week', null);
                return;
            }

            if (!args.length){
                send_searched_illust(Discord, message, null, null, null);
                return;
            }

            translate(args.join(" "), {to: 'ja'}).then(result => {
                console.log(`translated ${args} to ${result.text}`);
                send_searched_illust(Discord, message, result.text, null, null);
            });
            
        } else if (cmd === 'pexev'){
            if (!args.length) return;
            send_searched_illust(Discord, message, args.join(" "), null, null);
        } else if(cmd === 'pxquality'){

            if (!args.length) return message.reply("General quality is currently set to: " + g_quality);

            const parsed = parseInt(args);
            if (Number.isNaN(parsed)) return;

            if (parsed > 5) {
                g_quality = 5;
            } else if (parsed < 1){
                g_quality = 1;
            } else {
                g_quality = parsed;
            }

            message.reply("General quality has been set to: " + parsed);
        }
    }
}

const send_recommended_illust = async (Discord, message, timeline, result) => {
    const pixiv = new PixivApi();
    const refresh_token = token;

    pixiv.refreshAccessToken(refresh_token).then(() => {
        return pixiv.illustRecommended({mode: timeline}).then(json => {
            var imgUrl = [];

            if (result !== null){
                result = Math.max(result, json.illusts.length);
                const structure = {
                    url: json.illusts[result].image_urls.large,
                    id: json.illusts[result].id,
                    author: json.illusts[result].user.name,
                    title: json.illusts[result].title,
                    bookmarked: false
                }
                imgUrl.push(structure);
                console.log(imgUrl);
                send_img(message, imgUrl);
                return;
            }

            for (let i = 0; i < json.illusts.length; i++){
                const structure = {
                    url: json.illusts[i].image_urls.large,
                    id: json.illusts[i].id,
                    author: json.illusts[i].user.name,
                    title: json.illusts[i].title,
                    bookmarked: false
                }
                imgUrl.push(structure);
            }

            send_img(message, imgUrl);
        })
    });
}

const send_searched_illust = async (Discord, message, tag, quality, result) => {
    const pixiv = new PixivApi();
    const refresh_token = token;

    var s_term = (tag !== null ? tag:(search_term[rng(0,search_term.length)]));
    var time = (quality !== null ? quality:g_quality);

    const word = `${s_term} ${'0'.repeat(time)}`;

    console.log("Search for: " + word);

    pixiv.refreshAccessToken(refresh_token).then(() => {
        return pixiv.searchIllust(word).then(json => {
            var illustInfo = [];

            if (!json.illusts.length)
                return message.channel.send("***Squigg sadly cannot find anything***");

            if (result !== null){
                result = Math.max(result, json.illusts.length);
                const structure = {
                    url: json.illusts[result].image_urls.large,
                    id: json.illusts[result].id,
                    author: json.illusts[result].user.name,
                    //main_tag: word,
                    //tags: json.illusts[result].tags,
                    title: json.illusts[result].title
                }
                illustInfo.push(structure);
                console.log(illustInfo);
                send_img(message, illustInfo);
                return;
            }

            for (let i = 0; i < json.illusts.length; i++){
                const structure = {
                    url: json.illusts[i].image_urls.large,
                    id: json.illusts[i].id,
                    author: json.illusts[i].user.name,
                    //main_tag: word,
                    //tags: json.illusts[i].tags,
                    title: json.illusts[i].title,
                    bookmarked: false
                }
                illustInfo.push(structure);
            }
            //console.log(illustInfo);
            send_img(message, illustInfo);
        })
    });
}

const send_related_illust = async (message, message_id, _client) => {
    const pixiv = new PixivApi();
    const refresh_token = token;
    const main = queue_illust.get(message_id);

    pixiv.refreshAccessToken(refresh_token).then(() => {
        //var counter = setInterval(function(){time++;}, 1);
        var illustInfo = [];
        return pixiv.illustRelated(main.id).then(json => {
            /*const related = {
                illust: [],
                current_illust: 1,
            }*/
            var i = rng(0, 2);
            //related.illust.push(main);
            //for (let i = 0; i < json.illusts.length; i++){
            const structure = {
                url: json.illusts[i].image_urls.large,
                id: json.illusts[i].id,
                author: json.illusts[i].user.name,
                title: json.illusts[i].title,
            }
            illustInfo.push(structure);
            //}
            send_img(message, illustInfo);
            //clearInterval(counter);
            //console.log(related);
            //console.log(`Process finished after: ${time/1000} seconds`);
        });
    });
}

const send_img = (message, arr) => {
    let i = rng(0, arr.length);

    console.log(arr[i]);

    pixivImg(arr[i].url, `./data/pixiv/pixiv-temp/${arr[i].id}.jpg`).then(output => {
        console.log(`Downloaded: ${output}`);
        message.channel.send(`***'${arr[i].title}' by ${arr[i].author} - ID:${arr[i].id}***`, {
            files: [
                `./data/pixiv/pixiv-temp/${arr[i].id}.jpg`
            ]
        }).then(msg => {
            Promise.all([
                msg.react('❤️'),
                msg.react('🔎'),
                msg.react('❌')
            ]).catch(err => console.log(err));
            queue_illust.set(msg.id, arr[i]);

            /*setTimeout(function(){
                remove_illust_from_queue(message, msg.id);
            }, 30000);*/
        });
        //fs.unlink(`./data/pixiv/pixiv-temp/${arr[i].id}.jpg`, (res => console.log(res)));
    });

}

const bookmark_illust = (message, message_id, _client) => {
    const pixiv = new PixivApi();
    const refresh_token = token;
    const illust = queue_illust.get(message_id);

    if (illust.bookmarked) return;

    const id = illust.id;

    if (!id) return;

    restrict = "public";

    console.log(`Receive request for bookmark (${restrict})! (IllustID: ${id} - MsgID: ${message_id})`);


    pixiv.refreshAccessToken(refresh_token).then(() => {
        try {
            return pixiv.bookmarkIllust(id, restrict).then(_json => {
                console.log(`Request executed sucessfully - Bookmarked (IllustID: ${id} - MsgID: ${message_id})`);
            });
        } catch (err) {
            console.log(`Request cannot be executed (Bookmark - IllustID: ${id} - MsgID: ${message_id})`);
            console.log(`Error log: ${err}`);
        }
    });
    
    //const edited_message = message.channel.send

    

    message.channel.messages.fetch({around: message_id, limit: 1})
    .then(msg => {
        const fetchedMsg = msg.first();
        fetchedMsg.edit(`(Bookmarked) ${message.content}`, {
            files: [message.attachments.first().attachment]
        });
    });

    queue_illust.get(message_id).bookmarked = true;
}

/*const remove_illust_from_queue = (message, illust_message_id) => {
    const queue = queue_illust.get(illust_message_id);
    if (!queue) return;

    var txt = "❎";

    message.channel.messages.fetch({around: illust_message_id, limit: 1})
    .then(msg => {
        const fetchedMsg = msg.first();
        fetchedMsg.edit(`${txt} ${message.content}`, {
            files: [message.attachments.first().attachment]
        });
    });
    queue_illust.delete(illust_message_id);
    return;
}*/


const trans = (args) => {
    translate(args, {to: 'ja'}).then(result => {
        console.log(`translated ${args} to ${result.text}`);
        return result.text;
    });
}

function rng(min, max){
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}