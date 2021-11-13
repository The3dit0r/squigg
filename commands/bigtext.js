
const letter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', '\n', '?', '!', '#']
const number = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const module_aliases = ['bt'];



module.exports = {
    name: "bigtext",
    aliases: module_aliases,
    description: "turn normal thingies into big text",
    async execute(message, args, cmd, client, Discord) {
      var a = args.join(" ")
      a = a.toLowerCase();
			//console.log(a);
      if (a.length > 85) {
        message.channel.send("Squigg found that long af, pls shorten that")
        return 
      }

      var b = ""
        for (var i = 0; i < a.length; i++){
            if(letter.includes(a[i])){
                if (a[i] === ' ' || a[i] === '\n') b+=a[i]
                else if (a[i] === '?') b+=":question:"
                else if (a[i] === '!') b+=":exclamation:"
                else if (a[i] === '#') b+=":hash:"
                else b+=`:regional_indicator_${a[i]}:`
            } 
            else if (number.includes(a[i])){
							switch (a[i]){
                case "0": b+= ":zero:"; 	break;
								case "1": b+= ":one:"; 		break;
								case "2": b+= ":two:"; 		break;
								case "3": b+= ":three:"; 	break;
								case "4": b+= ":four:"; 	break;
								case "5": b+= ":five:"; 	break;
								case "6": b+= ":six:"; 		break;
								case "7": b+= ":seven:"; 	break;
								case "8": b+= ":eight:"; 	break;
								case "9": b+= ":nine:";		break;
							}
              
            }
            else b+=":question:"
        }
        message.channel.send(b)

    }
}
