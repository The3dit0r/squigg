// Message (message received event).

// Bluh prefix shit
const prefix1 = 'search ';
const prefix2 = 'Search ';
const prefix3 = 'Search first ';
const prefix4 = 'search first ';
// Tonk prefix shit
const prefix5 = ['tl','play', 'stop', 'skip', 'queueloop', 'loop','queue','np','editinteractablemessage','pause','resume','shuffle','npc','pixiv','pexev', 'pxquality','-reload','dev','pn','top','ygo','xkcd', 'restart', 'rd','spe','qr','rq','init','q','help','ttt','ly','wp','wtf','bt'];

module.exports = (Discord, client, message) => {

  var msg = message.content;//.toLowerCase();

  if ((msg.startsWith(prefix3)) || (msg.startsWith(prefix4))){
    const command = client.commands.get('search');
    command.execute(message, 'search first ', client, Discord);
    return;
  }
  
  if ((msg.startsWith(prefix1)) || (msg.startsWith(prefix2))){
    const command = client.commands.get('search');
    command.execute(message, 'search ', client, Discord);
    return;
  }

  if (msg === 'fuck'){
    message.reply('you');
    return;
  } else if (msg === 'chill'){
    const command = client.commands.get('play');
    command.execute(message, ['PL35IHUdGqpFGjMvoQbrxPz339lVclJ_NP'], 'play', client, Discord);
    return;
  } else if (msg === 'vibe'){
    const command = client.commands.get('play');
    command.execute(message, ['PL35IHUdGqpFEAAhanWM7-Q8CCo_kVKF8Q'], 'play', client, Discord);
    return;
  } else if (msg === 'mix'){
    const command = client.commands.get('play');
    command.execute(message, ['PL35IHUdGqpFEAAhanWM7-Q8CCo_kVKF8Q'], 'play', client, Discord);
    setTimeout(function(){
      command.execute(message, ['PL35IHUdGqpFGjMvoQbrxPz339lVclJ_NP'], 'play', client, Discord);
    },2000);
    return;
  } else if (msg[0] === '!'){
		const command = client.commands.get('gif');
		const args = msg.slice(1).split(/ +/);
		const cmd = args.shift().toLowerCase();
		command.execute(message, args, cmd, client, Discord);
		return;
	}
	
  let check = msg.split(" ", 2);
  if (!prefix5.includes(check[0])) return;

  const prefix = '';
	if (/*!msg.startsWith(prefix) ||*/ message.author.bot) return;

	const args = msg.slice(prefix.length).split(/ +/);
	const cmd = args.shift().toLowerCase();

	const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
	
	

	try {
		command.execute(message, args, cmd, client, Discord);
	} catch (err) {
		message.reply("Cant execute command!!!");
		console.log(err);
	}

}

// command.execute - Will execute a command from commands folder
// Argument in:

// message: message receieved (obj).
// args: argument from the clients (array).
// cmd: the command that the client requested (string).
// client: the bot (obj).
// Discord: anything Discord related (Mainly used to send embed message: Discord.MessageEmbed).

/* How does this file function?

 1. It check the prefix - making sure that all message the bot execute begin with a prefix
 2. It then split the msg into 2 parts:
     Args amd Command
       Ex: search Hamburger
          in the above example, the argument should be: args = ['Hamburger'];
           and the command should be: cmd = 'search'

       Ex: action react heart
           in the above example, the arguments should be: args = ['react', 'heart'];
           and the command should be: cmd = 'action'

    You can check the command and the args by using basic if ... else ... [else if ... (optional)] function
      Ex: action react heart
        if (cmd === 'action'){
          if (args[1] === 'react'){
            react(args[2]);
          }
        }
      Ex: search Dame Dane Dame No
      (So at this point, you will be like: What if you want to search for something with space like Dame Dane Dame No?)
      You can use a function to combine those together:

      var searchTerm = "";
      for (var i = 0; i < args.length; i++){
        searchTerm += args[i] + (i + 1 === args.length ? "":" ");
      }

      If you have another
      Then check it with if ... else ... else if ...
      Or... you can take an alternative path - by using switch case.
*/

// command file structure:
/*
  ( search.js file examle  )

  const hamburger = require('./this_is_an_example_for_declaring_library');
  var one = 1;
  var obj = {
    one = 1;
    two = 2;
  }
  var arr = [];
  const a = 1;

  module.exports = {
    name: 'search',                        } -> Name of the command
    aliases: ['search', 'squig_search', 'Search'],   } -> Aliases a.k.a sub-command
    description: 'Search image function for Squig',     (Yeah... description... you understand it right?)          
    async execute(message, args, cmd, client, Discord){ 
      // insert function and command (or code) here.    
    }
  }

  // --- function --- //
  const function_1 = (arg1) => {
    //code
  }

*/