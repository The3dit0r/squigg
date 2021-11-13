const translate = require('@vitalets/google-translate-api');
const module_aliases = ['tl', 'tl'];
const embeded_color = "#7661B1";
const maxlgt = 30;

const lp = [
    'af','sq','am','ar','hy','az','eu','be','bn','bs',
    'bg','ca','ceb','ny','co','hr','cs','da','nl','en',
    'eo','et','tl','fi','fr','fy','gl','ka','de','el',
    'gu','ht','ha','haw','he','iw','hi','hmn','hu','is',
    'ig','id','ga','it','ja','jw','kn','kk','km','ko',
    'ku','ky','lo','la','lv','lt','lb','mk','mg','ms','ml',
    'mt','mi','mr','mn','my','ne','no','ps','fa','pl','pt',
    'pa','ro','ru','sm','gd','sr','st','sn','sd','si','sk',
    'sl','so','es','su','sw','sv','tg','ta','te','th','tr',
    'uk','ur','uz','vi','cy','xh','yi','yo','zu','zh-CN','zh-TW'
];

const ln = {
    'auto': 'Automatic','af': 'Afrikaans','sq': 'Albanian','am': 'Amharic','ar': 'Arabic','hy': 'Armenian',
    'az': 'Azerbaijani','eu': 'Basque','be': 'Belarusian','bn': 'Bengali','bs': 'Bosnian','bg': 'Bulgarian',
    'ca': 'Catalan','ceb': 'Cebuano','ny': 'Chichewa','zh-CN': 'Chinese (Simplified)','zh-TW': 'Chinese (Traditional)',
    'co': 'Corsican','hr': 'Croatian','cs': 'Czech','da': 'Danish','nl': 'Dutch','en': 'English','eo': 'Esperanto',
    'et': 'Estonian','tl': 'Filipino','fi': 'Finnish','fr': 'French','fy': 'Frisian','gl': 'Galician','ka': 'Georgian',
    'de': 'German','el': 'Greek','gu': 'Gujarati','ht': 'Haitian Creole','ha': 'Hausa','haw': 'Hawaiian','he': 'Hebrew',
    'iw': 'Hebrew','hi': 'Hindi','hmn': 'Hmong','hu': 'Hungarian','is': 'Icelandic','ig': 'Igbo','id': 'Indonesian',
    'ga': 'Irish','it': 'Italian','ja': 'Japanese','jw': 'Javanese','kn': 'Kannada','kk': 'Kazakh','km': 'Khmer',
    'ko': 'Korean','ku': 'Kurdish (Kurmanji)','ky': 'Kyrgyz','lo': 'Lao','la': 'Latin','lv': 'Latvian','lt': 'Lithuanian',
    'lb': 'Luxembourgish','mk': 'Macedonian','mg': 'Malagasy','ms': 'Malay','ml': 'Malayalam','mt': 'Maltese','mi': 'Maori',
    'mr': 'Marathi','mn': 'Mongolian','my': 'Myanmar (Burmese)','ne': 'Nepali','no': 'Norwegian','ps': 'Pashto',
    'fa': 'Persian','pl': 'Polish','pt': 'Portuguese','pa': 'Punjabi','ro': 'Romanian','ru': 'Russian','sm': 'Samoan',
    'gd': 'Scots Gaelic','sr': 'Serbian','st': 'Sesotho','sn': 'Shona','sd': 'Sindhi','si': 'Sinhala','sk': 'Slovak',
    'sl': 'Slovenian','so': 'Somali','es': 'Spanish','su': 'Sundanese','sw': 'Swahili','sv': 'Swedish','tg': 'Tajik',
    'ta': 'Tamil','te': 'Telugu','th': 'Thai','tr': 'Turkish','uk': 'Ukrainian','ur': 'Urdu','uz': 'Uzbek',
    'vi': 'Vietnamese','cy': 'Welsh','xh': 'Xhosa','yi': 'Yiddish','yo': 'Yoruba','zu': 'Zulu'
}


var allow_repeated = false;
var final_language = 'en';
var max_turn = 10;

var term = "";
var t_list = "";

module.exports = {
    name: "tl",
    aliases: module_aliases,
    async execute(message, args, cmd, client, Discord){
        if (args[0] === '!set'){
            const val = parseInt(args[1]);
            if (!args.length || isNaN(val)) 
                return message.channel.send(`***Current repeat time is set to: ${max_turn}***`);
            
            if (val < 0) max_turn = 0;
            if (val >= 50) max_turn = 50;

            max_turn = val;
            return message.channel.send(`***Current repeat time has been set to: ${max_turn}***`);
        } else if (args[0] === '!rpt'){
            var t_accept = ['true','t','enable','e','on'];
            var f_accept = ['false','f','disable','d','off'];
            if (t_accept.includes(args[1])){
                allow_repeated = true;
            } else if (f_accept.includes(args[1])){
                allow_repeated = false;
            }

            message.channel.send(`*** Language repeat is ${(allow_repeated ? "enable":"disable")}***`);
        } else if (args[0] === '!fin'){
            if (args[1]){
                var new_lang = ln[args[1]];
                if (!new_lang) return message.channel.send('***Cannot find language***');
                final_language = args[1];
            }

            message.channel.send(`*** Output language is ${ln[final_language]}***`);
        } else {
            if (!args.length) return;
            const raw_term = args.join(" ");
            term = raw_term;
            t_list = "English";
            const embed_message = new Discord.MessageEmbed()
                .setColor(embeded_color)
                .setAuthor(`📙 Squigg' Bruh Translator 📘`)
                .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png')
                .setDescription(`***__Translating text__: ${raw_term}***`)
                .addFields({ name: `0    ${'░'.repeat(maxlgt)}    ${max_turn}`, value: 'Initializing translator...' });
            message.channel.send(embed_message).then((msg) => {
                translate_recursion(Discord, msg, 0, raw_term, lp, 'auto');
            });
        }
    }
}

const translate_recursion = async (Discord, message, turn, raw_term, language_pack, prev) => {
    var lp = language_pack.sort((a, b) => 0.5 - Math.random());
    var next = (!allow_repeated ? lp.shift():lp[0]);

    translate(raw_term, {from: prev, to: next}).then(result => {
        //console.log(`(${turn+1}/${max_turn}) Translated from ${ln[prev]} to ${ln[next]} - ${result.text}`);
        t_list += ` - ${ln[next]}`;
        var prog_text = `Translating from ${ln[prev]} to ${ln[next]}`;
        var prog = Math.floor(((turn + 1)/max_turn) * maxlgt);
        var remain = maxlgt - prog;

        //console.log(`${prog} - ${remain}`)

        const embed = new Discord.MessageEmbed()
            .setColor(embeded_color)
            .setAuthor(`📙 Squigg' Bruh Translator 📘`)
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png')
            .setDescription(`***__Translating text__: ${term}***`)
            .addFields(
                { name: `${turn+1}    ${'█'.repeat(prog)}${'░'.repeat(remain)}    ${max_turn}`, value: `${prog_text}` },
                { name: '***__Translated language list__***', value: `${t_list}`}
            );
        message.channel.messages.fetch({around: message.id, limit: 1})
        .then(msg => {
            const fetchedMsg = msg.first();
            fetchedMsg.edit(embed);
        });

        turn++;
        if (turn === max_turn){
            t_list += ` - ${ln[final_language]}`;
            translate(result.text, {from: next, to: final_language}).then(final => {
                console.log(`Final translation from ${ln[next]} to ${ln[final_language]} - ${final.text}`);
                console.log(`Finished after ${turn} turns`);

                const embed = new Discord.MessageEmbed()
                    .setColor(embeded_color)
                    .setAuthor(`📙 Squigg' Bruh Translator 📘 (Finished)`)
                    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/d/db/Google_Translate_Icon.png')
                    .setDescription(`***__Translating text__: ${term}\n__Result__: ${final.text}***`)
                    .addFields(
                        { name: `${turn}    ${'█'.repeat(maxlgt)}     ${turn}`, value: `Translated from ${ln[next]} to ${ln[final_language]} - Done`},
                        { name: '***__Translated language list__***', value: `${t_list}`}
                    );
                    message.channel.messages.fetch({around: message.id, limit: 1}).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(embed);
                    });
                return console.log(final.text);
            });
        } else translate_recursion(Discord, message, turn, result.text, lp, next);
    });
}





