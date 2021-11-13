const { create } = require("domain");
const fs = require("fs");
const { join } = require("path");
const rawdata = fs.readFileSync("./data/ygo/cards.json");
const data = JSON.parse(rawdata)
const module_aliases = ['ygo',];
const request = require("request");

const embeded_color = "#7661B1";
var prev = null;

const lobby_container = new Map();
const player_container = new Map();

var _client;

module.exports = {
    name: "ygo",
    aliases: module_aliases,
    description: "Lol",
    async execute(message, args, cmd, client, Discord) {
        _client = client;
        if (args[0] === 'init'){
            create_game_lobby(Discord, message);
        } else if (args[0] === 'join') {
            if (!args[1]) return message.reply("Please include a Lobby ID");
            join_lobby(Discord, client, message, args[1]);
        } else if (args[0] === 'set') {
            if (!args[1]) return message.reply("Please include an answer type");
            if (!args[2]) return message.reply("Please include an answer value");

            args.shift();
            var action_id = args.shift();
            var action_value = args.join(" ");

            resolve_player_action(Discord, message, action_id, action_value);
        } else if (args[0] === 'submit') {
            submit_answer(Discord, client, message);
        } else if (args[0] === 'ans'){
            send_current_answer(message);
        }
    }
}

/**
 * Random number generator (The maximum is exclusive and the minimum is inclusive)
 *
 * @param {number} min - The minimum value of the number
 * @param {number} max - The maximum value of the number
 */
const rng = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Sleep for an amount of time (In milisecond)
 *
 * @param {number} ms - Amount of time to sleep
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const get_data_from_id = async (id) => {
    //const id = 10000;
    const link = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`;

    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var importedJSON = JSON.parse(body);
            prev = (importedJSON.data[0]);
            prev.card_sets = null;
            prev.card_prices = null;
            console.log(prev);
        } else {
            console.log("Failed to retrieve data");
            //throw error;
        }
    })
}

/**
 * Initialize a lobby with a random lobby ID
 *
 * @param {any} Discord - Discord object
 * @param {any} message - Message object
 */
const create_game_lobby = async (Discord, message) => {
    let gameid = rng(100000, 1000000);
    
    let game_lobby = {
        id: gameid,
        // player[0]: Player count
        player: [0, 
            {
                name: "",
                id: "",
                point: 0,
                submited: false,
                guess: {
                    name: "",
                    archetype: "",
                    attribute: "",
                    type: "",
                    race: "",
                    atk: "",
                    def: "",
                    level: ""
                },
            },
            {
                name: "",
                id: "",
                point: 0,
                submited: false,
                guess: {
                    name: "",
                    archetype: "",
                    attribute: "",
                    type: "",
                    race: "",
                    atk: "",
                    def: "",
                    level: ""
                },
            }
        ],
        current_round: 0,
        max_round: 1,
        //guess_time_limit: 120, // In seconds
        message: null,
        current: null,
    }

    const embed_message = new Discord.MessageEmbed()
	    .setColor(embeded_color)
		.setTitle(`🎮 Guess that Yu-gi-oh Card 🕹️ - Game lobby - (ID: ${game_lobby.id})`)
		.addFields(
            { 
                name: '__Lobby Info__', 
                value: ` - Number of round: ${game_lobby.max_round}. \n  - Guess time limit per round: No time limit.`, 
                inline: false
            },
            {name: "__Player One__", value: `Waiting for player ...`},
            {name: "__Player Two__", value: `Waiting for player ...`},
        )
        .setFooter('To join a lobby, type "ygo join <lobby_id>"');
	message.channel.send(embed_message).then((msg) => {
        game_lobby.message = msg;
        lobby_container.set(gameid.toString(), game_lobby);
    });
}

/**
 * Resolve a player action
 *
 * @param {any} Discord - Discord object
 * @param {any} message - Message object
 * @param {number} action_id - Player's action ID  
 * @param {string} action_value - Player's action value
 */
const resolve_player_action = (Discord, message, action_id, action_value) => {
    const action_author = message.author.id;
    const author_current_game = player_container.get(action_author);

    if (!author_current_game){
        return message.reply("You must be in a lobby to use this command !!!");
    }

    const current_game = lobby_container.get(author_current_game);
    
    
    console.log(current_game);
    var player_id, player_answer;
    
    if (action_author === current_game.player[1].id) player_id = 1;
    else player_id = 2;
    
    if (current_game.player[player_id].submited) return message.reply("Your answer cannot be change after submited");
    switch (action_id){
        // Guess card name
        case 'name':
            player_answer = action_value.toLowerCase();
            // Update answer to the game_lobby
            current_game.player[player_id].guess.name = player_answer;
            // Send message to player
            message.author.send(`Your guess for current card's name: ${action_value}`);
        return;

        // Guess card arche-type
        case 'arch':
            player_answer = action_value.toLowerCase();
            current_game.player[player_id].guess.archetype = player_answer;
            message.author.send(`Your guess for current card's arche-type: ${action_value}`);
        return;

        // Guess card attribute
        case 'attr':
            player_answer = action_value.toLowerCase();
            current_game.player[player_id].guess.attribute = player_answer;
            message.author.send(`Your guess for current card's attribute: ${action_value}`);
        return;

        // Guess card type
        case 'type':
            player_answer = action_value.toLowerCase();
            current_game.player[player_id].guess.type = player_answer;
            message.author.send(`Your guess for current card's type: ${action_value}`);
        return;

        // Guess card race
        case 'race':
            player_answer = action_value.toLowerCase();
            current_game.player[player_id].guess.race = player_answer;
            message.author.send(`Your guess for current card's race: ${action_value}`);
        return;

        // Guess card atk
        case 'atk':
            player_answer = Number.parseInt(action_value);
            if (player_answer == NaN) return; 
            current_game.player[player_id].guess.atk = player_answer;
            message.author.send(`Your guess for current card's ATK point: ${action_value}`);
        return;

        // Guess card def
        case 'def':
            player_answer = Number.parseInt(action_value);
            if (player_answer == NaN) return; 
            current_game.player[player_id].guess.def = player_answer;
            message.author.send(`Your guess for current card's DEF point: ${action_value}`);
        return;

        // Guess card level
        case 'lvl':
            player_answer = Number.parseInt(action_value);
            if (player_answer == NaN) return; 
            current_game.player[player_id].guess.level = player_answer;
            message.author.send(`Your guess for current card's level: ${action_value}`);
        return;

        default:
            message.reply("Cannot find given type !");
        return;
    }
}

/**
 * Join a lobby with given lobby ID
 *
 * @param {any} Discord - Discord object
 * @param {any} client - Client object
 * @param {any} message - Message object
 * @param {string} lobby_id - Lobby ID
 */
const join_lobby = (Discord, client, message, lobby_id) => {
    var in_lobby = player_container.get(message.author.id);
    //console.log(lobby_container);
    if (!in_lobby){
        player_container.set(message.author.id, lobby_id);
        const game_lobby = lobby_container.get(lobby_id);
        if (!game_lobby) return message.reply(`Lobby with id of ${lobby_id} DOES NOT EXIST !!!!`);
        if (game_lobby.player[0] === 2) return message.reply(`Lobby with id of ${lobby_id} is full!`);

        game_lobby.player[game_lobby.player[0] + 1].name = message.author.username;
        game_lobby.player[game_lobby.player[0] + 1].id = message.author.id;

        player_container.set(message.author.id, lobby_id);

        message.author.send(`You have joined lobby with id of ${lobby_id} \nWaiting for opponent ...`);
        game_lobby.player[0]++;

        // Edit lobby message
        const embed_message = new Discord.MessageEmbed()
	    .setColor(embeded_color)
		.setTitle(`🎮 Guess that Yu-gi-oh Card 🕹️ - Game lobby - (ID: ${game_lobby.id})`)
		.addFields(
            { 
                name: '__Lobby Info__', 
                value: ` - Number of round: ${game_lobby.max_round}. \n  - Guess time limit per round: No time limit.`, 
                inline: false
            },
            {name: "__Player One__", value: (game_lobby.player[1].name !== "" ? game_lobby.player[1].name:"Waiting for player ...")},
            {name: "__Player Two__", value: (game_lobby.player[2].name !== "" ? game_lobby.player[2].name:"Waiting for player ...")},
        )
        .setFooter('To join a lobby, type "ygo join <lobby_id>"');

        message.channel.messages.fetch({around: game_lobby.message.id, limit: 1})
        .then(msg => {
            const fetchedMsg = msg.first();
            fetchedMsg.edit(embed_message);
        });
        console.log(game_lobby.player[0]);
        if (game_lobby.player[0] === 2){
            setTimeout(function(){
                init_lobby(Discord, client, lobby_id)
            }, 1000);
        }

        return;
    }

    message.reply("You have already joined a lobby");
}

/**
 * End a lobby with given lobby ID
 *
 * @param {any} Discord - Discord object
 * @param {any} client - Client object
 * @param {string} lobby_id - Lobby ID
 */
const update_lobby = (Discord, client, lobby_id) => {
    const game_lobby = lobby_container.get(lobby_id);

    if (!game_lobby) return;

    if (game_lobby.current_round === game_lobby.max_round){
        end_lobby(Discord, client, lobby_id);
        return;
    }

    if (game_lobby.current){
        check_answer(Discord, client, lobby_id);
        return;
    }

    game_lobby.current_round ++;
    var a = rng(0, data.length - 1);
    const link = `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${data[a]}`;

    request(link, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var importedJSON = JSON.parse(body);
            game_lobby.current = (importedJSON.data[0]);
            game_lobby.current.card_sets = null;
            game_lobby.current.card_prices = null;
        }
    });

    var _message = `__Round ${game_lobby.current_round} of ${game_lobby.max_round}__ (Lobby ID: ${game_lobby.id})`;
    var _link = `https://storage.googleapis.com/ygoprodeck.com/pics_artgame/${data[a]}.jpg`;

    client.users.cache.get(game_lobby.player[1].id).send(_message);
    client.users.cache.get(game_lobby.player[2].id).send(_message);
    
    client.users.cache.get(game_lobby.player[1].id).send(_link);
    client.users.cache.get(game_lobby.player[2].id).send(_link);
}

const init_lobby = (Discord, client, lobby_id) => {
    const game_lobby = lobby_container.get(lobby_id);

    if (!game_lobby) return;

    client.users.cache.get(game_lobby.player[1].id).send(`${game_lobby.player[2].name} connected. \n**!!!! Game is starting !!!!**`);
    client.users.cache.get(game_lobby.player[2].id).send(`${game_lobby.player[1].name} connected. \n**!!!! Game is starting !!!!**`);

    update_lobby(Discord, client, lobby_id);
}

/**
 * End a lobby with given lobby ID
 *
 * @param {any} Discord - Discord object
 * @param {any} client - Client object
 * @param {string} lobby_id - Lobby ID
 */
const end_lobby = (Discord, client, lobby_id) => {
    const game_lobby = lobby_container.get(lobby_id);
    if (!game_lobby) return;

    var message = game_lobby.message;
    
    var p1s = game_lobby.player[1].point;
    var p2s = game_lobby.player[2].point;

    var p1n = game_lobby.player[1].name;
    var p2n = game_lobby.player[2].name;

    var f_player, f_score;
    
    if (p1s < p2s){
        f_score = `${p1s}\n**${p2s}**`;
        f_player = `${p1n}\n**${p2n}**`;
    } else if (p1s > p2s) {
        f_score = `**${p1s}**\n${p2s}`;
        f_player = `**${p1n}**\n${p2n}`; 
    }

    console.log(p1s + " - " + p2s);
    console.log(p1n + " - " + p2n);

    console.log(f_score);
    console.log(f_player);

    const embed_message = new Discord.MessageEmbed()
	    .setColor(embeded_color)
		.setTitle(`🎮 Guess that Yu-gi-oh Card 🕹️ - Game lobby - (ID: ${game_lobby.id})`)
		.addFields(
            { 
                name: '__Lobby Info__ (Match ended)', 
                value: ` - Number of round: ${game_lobby.max_round}. \n  - Guess time limit per round: No time limit.`, 
                inline: false
            },
            {name: "__Match Summary__", value: `${f_player}`, inline: true},
            {name: "__Score__", value: `${f_score}`, inline: true},
        ).setFooter('To create a new lobby, type "ygo init"');
    
    message.channel.messages.fetch({around: message.id, limit: 1})
    .then(msg => {
        const fetchedMsg = msg.first();
        fetchedMsg.edit(embed_message);
    });
    // Delete lobby from container
    player_container.delete(game_lobby.player[1].id);
    player_container.delete(game_lobby.player[2].id);
    lobby_container.delete(game_lobby.id);
	
}

/**
 * Check player answer from a lobby with a given id
 * @param {any} Discord - Discord object
 * @param {any} message - Message object
 * @param {number} lobby_id - Lobby ID
 */
const check_answer = async (Discord, client, message, lobby_id) => {
    const game_lobby = lobby_container.get(lobby_id);

    const p1_oldp = game_lobby.player[1].point;
    const p2_oldp = game_lobby.player[2].point;

    const p1_guess = game_lobby.player[1].guess;
    const p2_guess = game_lobby.player[2].guess;

    const p1_dm = client.users.cache.get(game_lobby.player[1].id);
    const p2_dm = client.users.cache.get(game_lobby.player[2].id);

    const answer = {
        name: (game_lobby.current.name ? game_lobby.current.name.toLowerCase():null),
        type: (game_lobby.current.type ? game_lobby.current.type.toLowerCase():null),
        attribute: (game_lobby.current.attribute ? game_lobby.current.attribute.toLowerCase():null),
        atk: (game_lobby.current ? game_lobby.current.atk:null),
        def: (game_lobby.current ? game_lobby.current.def:null),
        level: (game_lobby.current ? game_lobby.current.level:null),
        race: (game_lobby.current.race ? game_lobby.current.race.toLowerCase():null),
        archetype: (game_lobby.current.archetype ? game_lobby.current.archetype.toLowerCase():null),
    }

    // Start analizing

    p1_dm.send(`End of round ${game_lobby.current_round}`);
    p2_dm.send(`End of round ${game_lobby.current_round}`);
    await sleep(1000);

    p1_dm.send(`Last Round's Card: ${game_lobby.current.name} \nhttps://storage.googleapis.com/ygoprodeck.com/pics/${game_lobby.current.id}.jpg`);
    p2_dm.send(`Last Round's Card: ${game_lobby.current.name} \nhttps://storage.googleapis.com/ygoprodeck.com/pics/${game_lobby.current.id}.jpg`);
    await sleep(3000);
    // Check player answer

    // Part 1 - Card's name
    if (answer.name != null){
        console.log(`${p1_guess.name} - ${p2_guess.name} - ${answer.name}`)
        if (p1_guess.name === answer.name){
            p1_dm.send("+500 points :Correct answer for card's name");
            game_lobby.player[1].point += 500;
        } else {
            var arr = answer.name.split(" ");
            var keyword = p1_guess.name.split(" ");
            keyword.forEach((word) => {
                if (arr.includes(word)){
                    p1_dm.send(`+50 points : Correct substring of name (${word})`);
                    game_lobby.player[1].point += 50;
                }
            });
        }

        if (p2_guess.name === answer.name){
            p2_dm.send("+500 points :Correct answer for card's name");
            game_lobby.player[2].point += 500;
        } else {
            var arr = answer.name.split(" ");
            var keyword = p2_guess.name.split(" ");
            keyword.forEach((word) => {
                if (arr.includes(word)){
                    p2_dm.send(`+50 points : Correct substring of name (${word})`);
                    game_lobby.player[2].point += 50;
                }
            });
        }
        await sleep(715);
    }

    // Part 2 - Card's attribute
    if (answer.attribute != null){
        console.log(`${p1_guess.attribute} - ${p2_guess.attribute} - ${answer.attribute}`)
        if (p1_guess.attribute === answer.attribute){
            p1_dm.send(`+100 points : Correct answer for card's attribute`);
            game_lobby.player[1].point += 100;
        }

        if (p2_guess.attribute === answer.attribute){
            p2_dm.send(`+100 points : Correct answer for card's attribute`);
            game_lobby.player[2].point += 100;
        }
        await sleep(715);
    }

    // Part 3 - Card's ATK point
    if (answer.atk != null){
        console.log(`${p1_guess.atk} - ${p2_guess.atk} - ${answer.atk}`)
        if (p1_guess.atk === answer.atk){
            p1_dm.send(`+150 points : Correct answer for card's ATK`);
            game_lobby.player[1].point += 150;
        } else {
            var award_amount = Math.max(0, 100 - Math.abs(p1_guess.atk - answer.atk));
            if (award_amount !== 0)
                p1_dm.send(`+${award_amount} points : Close answer for card's ATK`);
            game_lobby.player[1].point += award_amount;
        }

        if (p2_guess.atk === answer.atk){
            p2_dm.send(`+150 points : Correct answer for card's ATK`);
            game_lobby.player[2].point += 150;
        } else {
            var award_amount = Math.max(0, 800 - Math.abs(p2_guess.atk - answer.atk));
            if (award_amount !== 0)
                p2_dm.send(`+${award_amount} points : Close answer for card's ATK`);
            game_lobby.player[2].point += award_amount;
        }
        await sleep(715);
    }

    // Part 4 - Card's DEF point
    if (answer.def != null){
        console.log(`${p1_guess.def} - ${p2_guess.def} - ${answer.def}`)
        if (p1_guess.def === answer.def){
            p1_dm.send(`+150 points : Correct answer for card's defend point`);
            game_lobby.player[1].point += 150;
        } else {
            var award_amount = Math.max(0, 800 - Math.abs(p1_guess.def - answer.def));
            if (award_amount !== 0)
                p1_dm.send(`+${award_amount} points : Close answer for card's defend point`);
            game_lobby.player[1].point += award_amount;
        }

        if (p2_guess.def === answer.def){
            p2_dm.send(`+150 points : Correct answer for card's defend point`);
            game_lobby.player[2].point += 150;
        } else {
            var award_amount = Math.max(0, 100 - Math.abs(p2_guess.def - answer.def));
            if (award_amount !== 0)
                p2_dm.send(`+${award_amount} points : Close answer for card's defend point`);
            game_lobby.player[2].point += award_amount;
        }
        await sleep(715);
    }

    // Part 5 - Card's level
    if (answer.level != null){
        console.log(`${p1_guess.level} - ${p2_guess.level} - ${answer.level}`)
        if (p1_guess.level === answer.level){
            p1_dm.send(`+150 points : Correct answer for card's level`);
            game_lobby.player[1].point += 150;
        } else {
            var award_amount = Math.max(0, 10 - Math.abs(p1_guess.level - answer.level)) * 10;
            if (award_amount !== 0)
                p1_dm.send(`+${award_amount} points : Close answer for card's level`);
            game_lobby.player[1].point += award_amount;
        }

        if (p2_guess.level === answer.level){
            p2_dm.send(`+150 points : Correct answer for card's level`);
            game_lobby.player[2].point += 150;
        } else {
            var award_amount = Math.max(0, 3 - Math.abs(p2_guess.level - answer.level)) * 10;
            if (award_amount !== 0)
                p2_dm.send(`+${award_amount} points : Close answer for card's level`);
            game_lobby.player[2].point += award_amount;
        }
        await sleep(715);
    }

    // Part 6 - Card's type
    if (answer.type != null){
        console.log(`${p1_guess.type} - ${p2_guess.type} - ${answer.type}`)
        if (answer.type.includes(p1_guess.type)){
            p1_dm.send(`+100 points : Correct answer for card's type`);
            game_lobby.player[1].point += 100;
        }

        if (answer.type.includes(p2_guess.type)){
            p2_dm.send(`+100 points : Correct answer for card's type`);
            game_lobby.player[2].point += 100;
        }
        await sleep(715);
    }

    // Part 7 - Card's race
    if (answer.race != null){
        console.log(`${p1_guess.race} - ${p2_guess.race} - ${answer.race}`)
        if (answer.race === p1_guess.race){
            p1_dm.send(`+100 points : Correct answer for card's race`);
            game_lobby.player[1].point += 100;
        }

        if (answer.race === p2_guess.race){
            p2_dm.send(`+100 points : Correct answer for card's race`);
            game_lobby.player[2].point += 100;
        }
        await sleep(715);
    }

    // Part 8 - Card's archetype
    if (answer.archetype != null){
        console.log(`${p1_guess.archetype} - ${p2_guess.archetype} - ${answer.archetype}`)
        if (answer.archetype === p1_guess.archetype){
            p1_dm.send(`+200 points : Correct answer for card's arche-type`);
            game_lobby.player[1].point += 200;
        }

        if (answer.archetype === p2_guess.archetype){
            p2_dm.send(`+200 points : Correct answer for card's arche-type`);
            game_lobby.player[2].point += 200;
        }
        await sleep(715);
    }

    var p1_earnp = game_lobby.player[1].point - p1_oldp;
    var p2_earnp = game_lobby.player[2].point - p2_oldp;

    p1_dm.send(`You earned ${p1_earnp} this round - Total point: ${game_lobby.player[1].point}. \nMatch Ended!!! Returned to da original server to see the result`);
    p2_dm.send(`You earned ${p2_earnp} this round - Total point: ${game_lobby.player[2].point}. \nMatch Ended!!! Returned to da original server to see the result`);

    game_lobby.current = null;

    game_lobby.player[1] = {name: "", archetype: "", attribute: "", type: "", race: "", atk: "", def: "", level: ""};
    game_lobby.player[2] = {name: "", archetype: "", attribute: "", type: "", race: "", atk: "", def: "", level: ""};

    game_lobby.player[1].submited = false;
    game_lobby.player[2].submited = false;

    end_lobby(Discord, client, lobby_id);
}


/**
 * Send player answer
 * @param {any} message - Message object
 */
const send_current_answer = (message) => {
    const action_author = message.author.id;
    const author_current_game = player_container.get(action_author);

    if (!author_current_game){
        return message.reply("You must be in a lobby to use this command !!!");
    }

    const game_lobby = lobby_container.get(author_current_game);

    if (action_author === game_lobby.player[1].id) player_id = 1;
    else player_id = 2;

    var ans = "Your current answer: \n";
        ans+= ` -Card's name: ${game_lobby.player[player_id].guess.name}\n`;
        ans+= ` -Card's attribute: ${game_lobby.player[player_id].guess.attribute}\n`;
        ans+= ` -Card's arche-type: ${game_lobby.player[player_id].guess.archetype}\n`;
        ans+= ` -Card's attack point: ${game_lobby.player[player_id].guess.atk}\n`;
        ans+= ` -Card's defend point: ${game_lobby.player[player_id].guess.def}\n`;
        ans+= ` -Card's level: ${game_lobby.player[player_id].guess.level}\n`;
        ans+= ` -Card's type: ${game_lobby.player[player_id].guess.type}\n`;
        ans+= ` -Card's race: ${game_lobby.player[player_id].guess.race}\n`;

    message.reply(`${ans} \n\`\`\`Tips: To submit your answer, type ygo submit\`\`\``);
}

/**
 * Submit player answer
 * @param {any} message - Message object
 */
const submit_answer = (Discord, client, message) => {
    const action_author = message.author.id;
    const author_current_game = player_container.get(action_author);

    if (!author_current_game){
        return message.reply("You must be in a lobby to use this command !!!");
    }

    const game_lobby = lobby_container.get(author_current_game);

    if (action_author === game_lobby.player[1].id) player_id = 1;
    else player_id = 2;

    if (!game_lobby.player[player_id].submited){
        game_lobby.player[player_id].submited = true;
        message.reply("**Your answer has been submitted**\n Waiting for opponent...");
    }

    if (game_lobby.player[1].submited && game_lobby.player[2].submited) 
        check_answer(Discord, client, message, author_current_game);

}