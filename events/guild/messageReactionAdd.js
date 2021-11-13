module.exports = async (Discord, client, reaction, user) => {
    // When a reaction is received, check if the structure is partial
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}

    if (reaction.me) return;

    /* -------------------- Execute command -------------------- */
    var action = 0;
    switch (reaction._emoji.name){
        case '⬅️':
            action = -1;
        break;

        case '➡️':
            action = 1;
        break;

        case '❤️':
            var _cmd = 'bookmarkillust';
            var _command = client.commands.get(_cmd) || client.commands.find(a => a.aliases && a.aliases.includes(_cmd));
            _command.execute(reaction.message, reaction.message.id, _cmd, client, null);
            //console.log(reaction.message);
        return;

        case '❌':
            var _cmd = 'deletequeueillust';
            var _command = client.commands.get(_cmd) || client.commands.find(a => a.aliases && a.aliases.includes(_cmd));
            _command.execute(reaction.message, reaction.message.id, _cmd, client, null);
        return;

        case '🔎':
            var _cmd = 'relatedillust';
            var _command = client.commands.get(_cmd) || client.commands.find(a => a.aliases && a.aliases.includes(_cmd));
            _command.execute(reaction.message, reaction.message.id, _cmd, client, null);
        return;

        default:
        return;
    }

    const cmd = 'editinteractablemessage';
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    const args = {
        msg_id: reaction.message.id,
        act_id: action
    }

    try {
		command.execute(reaction.message, args, cmd, client, Discord);
	} catch (err) {
		//message.reply("MEOWW! Me cant execute command :(");
		console.log(err);
	}
}