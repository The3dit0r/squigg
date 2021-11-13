const embeded_color = "#7661B1";

var help_help = "arg includes:\n";
    help_help = "`pixiv`: pixiv help\n";
    help_help = "`dev`: dev help\n";
    help_help = "`search`: search help\n";
    help_help = "`xkcd`: xkcd help\n";
    help_help = "`pkm`: pkm... yeah... you get the point... right?\n";
    help_help = "`play`, `ygo`: not available... why?... lazy";

var pixiv_help = "`pixiv <search_term>`: Search for a given term (translated) and send a random result\n";
    pixiv_help+= "`pexev <search_term>`: Search for a given term and send a random result\n";
    pixiv_help+= "`pixiv day`: Send a random daily recomended illustration\n";
    pixiv_help+= "`pixiv week`: Send a random weekly recomended illustration\n";
    pixiv_help+= "`pixiv month`: Send a random monthly recomended illustration\n";

var dev_help = "`dev <search_term>`: Search for a given term and send a random result\n";
    dev_help+= "`dev day`: Send a random popular illustration\n";
    dev_help+= "`dev week`: Send a random popular illustration\n";
    dev_help+= "`dev month`: Send a random popular illustration\n";

var xkcd_help = "`xkcd <id>`: Send a xkcd's comic with given ID\n";
    xkcd_help+= "`xkcd random`: Send a random xkcd's comic\n";
    xkcd_help+= "`xkcd today`: Send the latest comic by xkcd\n";

var search_help = "`search <search_term>`: Search for a given term and send a random result\n";
    search_help = "`search random`: Search for a random term and send a random result\n";

var pkm_help = "`pkm r`: Send a random pokemon (without da name)\n";
    pkm_help+= "`pkm a`: Send the previous pokemon's name\n";


module.exports = {
    name: 'help',
    aliases: ['help'],
    description: 'Help function',
    execute(message, args, cmd, client, Discord){
        
        // Section 1 - Image/Illustration/Comics search
        var embed_message;
        switch (args[0]){
            case 'pixiv':
                 embed_message = new Discord.MessageEmbed()
                    .setColor(embeded_color)
                    .setFooter('Type help to see all available commands in the server')
                    .addField({name: 'General syntax: `pixiv <arg>`', value: pixiv_help})
                    .setTitle('pixiv help section');
            return message.channel.send(embed_message);

            case 'xkcd':
                   embed_message = new Discord.MessageEmbed()
                      .setColor(embeded_color)
                      .setFooter('Type help to see all available commands in the server')
                      .addField({name: 'General syntax: `xkcd <arg>`', value: xkcd_help})
                      .setTitle('xkcd help section');
            return message.channel.send(embed_message);

            case 'dev':
                 embed_message = new Discord.MessageEmbed()
                      .setColor(embeded_color)
                      .setFooter('Type help to see all available commands in the server')
                      .addField({name: 'General syntax: `dev <arg>`', value: dev_help})
                             .setTitle('dev help section');
            return message.channel.send(embed_message);

            case 'search':
                 embed_message = new Discord.MessageEmbed()
                      .setColor(embeded_color)
                      .setFooter('Type help to see all available commands in the server')
                      .addField({name: 'General syntax: `search <arg>`', value: search_help})
                             .setTitle('search help section');
            return message.channel.send(embed_message);

            case 'pkm':
                 embed_message = new Discord.MessageEmbed()
                      .setColor(embeded_color)
                      .setFooter('Type help to see all available commands in the server')
                      .addField({name: 'General syntax: `pkm <arg>`', value: pkm_help})
                             .setTitle('pkm help section');
            return message.channel.send(embed_message);
            
            default:
                 embed_message = new Discord.MessageEmbed()
                      .setColor(embeded_color)
                      .setFooter('Type help to see all available commands in the server')
                      .addField({name: 'General syntax: `help <arg>`', value: help_help})
                             .setTitle('Help... uh help... yeah Help\'s help')
                             .setFooter('Type help to see all available... wait... you knew this already... nevermind');
            return message.channel.send(embed_message);

            case 'help': return message.reply("no");
        }
    }
}