const sc_client_id = process.env['SCLOUD_TOKEN'];
const scSearch = new (require("soundcloud-search-core"))(sc_client_id);
const scdl = require('soundcloud-downloader').default;

const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

const Genius = require("genius-lyrics")
const Client = new Genius.Client(process.env['GENIUS_TOKEN']);

//const fs = require('fs');
//lyric shit

// Server-side global variable
const module_aliases = [
  'play', 'stop', 'skip', 'queueloop', 'loop', 'spe', 'queue', 
  'np', 'editinteractablemessage', 'pause', 'init', 'resume', 
  'shuffle', 'npc', 'pn', 'top', 'rd', 'restart', 'ly'
];


const embeded_color = "#7661B1";
const server_list = new Map();
const interactable_message = new Map();
const now_playing_list = new Map();
const platform = {
  "youtube": {
    name: "Youtube",
    icon_url: "https://cdn.discordapp.com/attachments/769427216366698496/892946902465781770/youtube.png",
  },
  "soundcloud": {
    name: "Soundcloud",
    icon_url: "https://cdn.discordapp.com/attachments/769427216366698496/892946897638133780/soundcloud.png",
  }
}

// Should have been a client-side variable
var is_playing_ad = false;
var started_playing = 0;
var finished_playing = 0;
var spotify_premium_experience = true;

/* Unused variable
var backup_data = [];
const target_channel = "769494461746642944";
const raw_playlist = fs.readFileSync('./data/playlist.json');
var playlist_database = JSON.parse(raw_playlist);
// Nightcore is broken since i am stupid
var nightcore = false;
*/
const server_exec = (guild_id, cmd, args) => {
  const server_queue = server_list.get(guild_id);
  if (!server_queue) return;
  switch (cmd) {
    case 'pause':
      server_queue.connection.dispatcher.pause();
      server_queue.pause = true;
      clearTimeout(server_queue.timer);
    break;

    case 'resume':
      if (server_queue.pause) {
        server_queue.connection.dispatcher.resume();
        server_queue.pause = false;
        setTimeout(function() {
          server_queue.timer = update_timer(server_queue, server_queue.songs[0]);
        }, 1000);
      }
    break;

    case 'skip':
      //server_queue.songs.shift();
      server_queue.connection.dispatcher.end();
    break;

    case 'shuffle':
      if (!server_queue.songs.length) return;

      var array = server_queue.songs;
      var current = array.shift();

      var shuffledArray = array.sort((a, b) => 0.5 - Math.random());
      shuffledArray.unshift(current);

      server_queue.songs = shuffledArray;
    break;

    case 'totop':
      if (args < 2) return;
      var song = server_queue.songs.splice(args, 1)[0];
      var current = server_queue.songs.shift();
      server_queue.songs.unshift(current, song);
      console.log(`Moved ${song.title} to the top`);
    break;

    case 'pn':
      if (args < 1) return;
      var song = server_queue.songs.splice(args, 1)[0];
      var current = server_queue.songs.shift();
      server_queue.songs.unshift(song, current);
      play_song(guild_id, server_queue.songs[0]);
      console.log(`Playing ${song.title}`);
    break;

    case 'remove':
      if (args < 1) return;
      var song = server_queue.songs.splice(args, 1)[0];
      console.log(`Removed ${song.title}`);
    break;

    case 'add': 
      server_queue.songs.push(args);
      console.log(`Added ${args.title}`);
    break;

    case 'att': 
      var current = server_queue.songs.shift();
      server_queue.songs.unshift(current, args);
      console.log(`Added ${args.title} to the top`);
    break;

    case 'apn':
      server_queue.songs.unshift(args);
      play_song(guild_id, server_queue.songs[0]);
      console.log(`Playing ${args.title}`);
    break;


     case 'nloop': 
      server_queue.single_loop = false; 
      server_queue.queue_loop = false;  
    break;

    case 'sloop': 
      server_queue.single_loop = true; 
      server_queue.queue_loop = false;           
    break;
    
    case 'qloop': 
      server_queue.single_loop = false; 
      server_queue.queue_loop = true;             
    break;

    case 'rd':
      var a = 0;
      var song = new Map();
      var repeated = 0;
      for (let i = 0; i < server_queue.songs.length; i++) {
        var repeat = song.get(server_queue.songs[i].id);
        if (repeat != null) {
          server_queue.songs.splice(i, 1);
          console.log(`Remove duplicate at position: ${a} - Origin: ${repeat}`);
          repeated++;
          i--;
        } else {
          song.set(server_queue.songs[i].id, i);
        }
        a++;
      }

      console.log(repeated + ` duplicated ${(repeated <= 1 ? "song":"songs")} removed`);
    break;
  }
}




module.exports = {
  name: "play",
  aliases: module_aliases,
  server_list: server_list,
  description: "A Music Script for Planet AT1",
  server_exec: server_exec,
  async execute(message, args, cmd, client, Discord) {
    // Misc (Interactable message)
    if (cmd === 'editinteractablemessage') return system_interactable_message(message, args.msg_id, args.act_id);

    // Not in voice channel
    const voice_channel = message.member.voice.channel;
    if (!voice_channel) return message.reply("***Squigg is having trouble finding the vc, hop in vc to guide Squigg to the right place!***");

    // Permission checking
    const permission = voice_channel.permissionsFor(message.client.user);
    if (!permission.has('CONNECT')) return message.reply("I don't have the permission to connect");
    if (!permission.has('SPEAK')) return message.reply("I don't have the permission to speak");

    // Get server queue
    const server_queue = server_list.get(message.guild.id);

    // (Unused) Check SPE status
    if (is_playing_ad) return message.reply("***no***");

    // Command - Play / Play now / Top
    if (cmd === 'play' || cmd === 'pn' || cmd === 'top') {
      if (!args.length) return message.reply("***Squigg is currently playing nothing, as you requested 🙃***");

      let song = {};
      let playlist = null;
      
      if (args[0] === 'sc'){
        args.shift();
        song = await search_soundcloud(args, message);
      } else if (ytpl.validateID(args[0])) {
        // Youtube playlist
        playlist = await get_playlist_link(message, args[0]);
        if (!playlist) return message.channel.send("Cannot find playlist with given link");
        if (cmd === 'pn') song = playlist.item.shift();
        console.log(playlist);
      } else if (ytdl.validateURL(args[0])) {
        //Youtube download core
        const video = await ytdl.getInfo(args[0]);
        song = {
          title: video.videoDetails.title,
          url: video.videoDetails.video_url,
          id: video.videoDetails.videoId,
          requested_by: message.author.username,
          length: video.videoDetails.lengthSeconds,
          author: video.videoDetails.author.name,
          thumbnail: `https://i.ytimg.com/vi/${video.videoDetails.videoId}/hqdefault.jpg`,
          platform: "youtube"
        }
      } else {
        // Youtube search
        const video_finder = async (query) => {
          const videoResult = await ytSearch(query);
          return (videoResult.videos.length > 1 ? videoResult.videos[0] : null);
        }

        const video = await video_finder(args.join(" "));
        if (video) {
          song = {
            usert: args.join(" "),
            title: video.title,
            url: video.url,
            id: video.videoId,
            requested_by: message.author.username,
            length: video.duration.seconds,
            author: video.author.name,
            thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            platform: "youtube"
          }
        } else {
          console.log(`Error finding video (Search term: ${args.join(" ")})`);
          return message.reply(`***Squigg sadly cannot find you a ${args.join(" ")} please try something else***`);
        }
      }
      
      console.log("Song");
      console.log(song);

      if (!server_queue) {
        const queue_structure = {
          id: message.guild.id,
          voice_channel: voice_channel,
          text_channel: message.channel,
          connection: null,
          single_loop: false,
          queue_loop: false,
          pause: false,
          currentSec: 0,
          timer: null,
          songs: [],
          restart_counter: null,
        }

        server_list.set(message.guild.id, queue_structure);
        
        if (playlist) {
          queue_structure.songs = playlist.item;
          message.channel.send(`***🎶 Squigg added ${playlist.length} songs from ${playlist.name} 🎵 Requested by: @${playlist.requested_by}***`);
        } else queue_structure.songs.push(song);

        try {
          const connection = await voice_channel.join();
          queue_structure.connection = connection;
          message.channel.send(`***🎶 Squigg is playing: ${queue_structure.songs[0].title} 🎵 Requested by: @${queue_structure.songs[0].requested_by}***`);
          play_song(message.guild.id, queue_structure.songs[0]);
        } catch (err) {
          //server_list.delete(message.guild.id);
          message.channel.send("***Squigg sadly cannot play that***");
          throw err;
        }
      } else {
        if (cmd === 'pn') {
          if (playlist) {
            for (let i = playlist.item.length - 1; i >= 0; i--) {
              server_queue.songs.unshift(playlist.item[i]);
            }
            message.channel.send(`***🎶 Squigg added ${playlist.length} songs from ${playlist.name} 🎵 Requested by: @${playlist.requested_by}***`);
          }
          //skip_song(message, server_queue, 1);
          server_queue.songs.unshift(song);
          play_song(message.guild.id, song);
          return message.channel.send(`***🎶 Squigg is playing: ${song.title} 🎵 Requested by: @${song.requested_by}***`);
        } else if (cmd === 'top') {
          if (playlist) {
            playlist.item.push(server_queue.songs.shift());
            for (let i = playlist.item.length - 1; i >= 0; i--) {
              server_queue.songs.unshift(playlist.item[i]);
            }
            return message.channel.send(`***🎶 Squigg added ${playlist.length} songs from ${playlist.name} to da top 🎵 Requested by: @${playlist.requested_by}***`);
          }
          let current = server_queue.songs.shift();
          server_queue.songs.unshift(current, song);
          return message.channel.send(`***🎶 Squigg added: ${song.title} to da top 🎵 Requested by: @${song.requested_by}***`);
        }
        if (playlist) {
          for (let i = playlist.item.length - 1; i >= 0; i--) {
            server_queue.songs.unshift(playlist.item[i]);
          }
          return message.channel.send(`***🎶 Squigg added ${playlist.length} songs from ${playlist.name} 🎵 Requested by: @${playlist.requested_by}***`);
        }
        server_queue.songs.push(song);
        return message.channel.send(`🎵 **${song.title} 🎵 added to queue 👍 Position in queue: ${server_queue.songs.length - 1}**`);
        //play_song(message, queue_structure.songs[0]);
      }
    } 
    
    switch(cmd){
      case 'skip':
        skip_song(message, server_queue, parseInt(args)); 
      return;

      case 'stop':
        stop_song(message, server_queue); 
      return;

      case 'pause':
        pause_song(message, server_queue); 
      return;

      case 'resume':
        resume_song(message, server_queue); 
      return;

      case 'rd':
        remove_duplicate(message, server_queue); 
      return;

      case 'shuffle':
        shuffle_playlist(message, server_queue); 
      return;

      case 'loop':
        loop_song(message, server_queue, true); 
      return;

      case 'queueloop':
        loop_song(message, server_queue, false); 
      return;

      case 'np':
        message.channel.send(create_np(message, server_queue, Discord)); 
      return;

      case 'restart':
        server_list_restart(message.guild.id, voice_channel); 
      return;

      case 'queue':
        send_queue(message, server_queue, Discord); 
      return;

      case 'init':
        init_now_playing(message, server_queue, Discord); 
      return;

      case 'npc':
        message.channel.send(create_np(message, server_queue, Discord));
        send_queue(message, server_queue, Discord);
      return;

      case 'ly':
        if (!args[0]){
          if (server_queue){
          var lmaolol = cut_string(server_queue.songs[0].title);
          var lmaolol2 = server_queue.songs[0].usert
          var thumbnail = server_queue.songs[0].thumbnail;
          //console.log(server_queue);
          send_lyrics(Discord, message, lmaolol, lmaolol2, thumbnail);
          } else {
            var error_message = new Discord.MessageEmbed()
          .setColor('#000000')
          .setTitle(`***Server queue is empty...somehow...***`)
          .setThumbnail('https://cdn.discordapp.com/attachments/769427216366698496/889394395399479316/sad.png')
          .setDescription(`***-reload resets the server queue\npls use the manual function or manual restart me***`);
          message.channel.send(error_message);
          }
        } else {
          console.log(args.join(" "));
          send_lyrics(Discord, message, args.join(" "), args.join(" "));
        }
      return;
    }
    /*else if (cmd === 'spe') {
            if (args[0] === 'enable'){
                spotify_premium_experience = true;
                message.reply('*** !!!Good Call!!! Spotify Premium Experience have been ENABLED ***');
            } else if (args[0] === 'disable'){
                spotify_premium_experience = false;
                message.reply('*** !!!CAUTION!!! Spotify Premium Experience have been DISABLED ***');
            }
        }
        /*else if (cmd === 'preset') {
            if (!server_queue) {
				const queue_structure = {
                    id: message.guild.id,
					voice_channel: voice_channel,
					text_channel: message.channel,
					connection: null,
					single_loop: false,
					queue_loop: false,
                    pause: false,
                    currentSec: 0,
                    timer: null,
					songs: [],
                    restart_counter: null,
				}
				server_list.set(message.guild.id, queue_structure);
            } else {
                var info = await parse_playlist(message, args, server_queue);
                return message.channel.send(`*** Squigg added 🎵 ${info.name} 🎵 to queue 👍 with position: ${info.length} - Requested by: @${info.requested_by}***`);
                console.log(info);
            }
            var server_queue_new = server_list.get(message.guild.id);

            const daw = await get_playlist_link(message, args);

            server_queue_new.songs = daw.item;
            console.log(daw);

            try {
                const connection = await voice_channel.join();
                server_queue_new.connection = connection;
                play_song(message.guild.id, server_queue_new.songs[0]);
                message.channel.send(`🎶 ***Squigg is playing: ${daw.name} 🎵 Requested by: @${message.author.username}***`);
            } catch (err) {
                server_list.delete(message.guild.id);
                message.channel.send("***Squigg sadly cannot play that***");
                throw err;
            }
        }*/
  }
}

/**
 * 
 * @param {string} guild_id 
 * @param {object} song 
 * @param {integer} timestamp Deprecated
 * @returns {void}
 */
const play_song = async (guild_id, song, timestamp) => {
  const server_queue = server_list.get(guild_id);
  //timestamp = (timestamp ? timestamp:"0s");
  //console.log(song);

  if (!song) {
    server_queue.voice_channel.leave();
    //target.setTopic("Music request for @squigg");
    clearTimeout(server_queue.restart_counter);
    server_list.delete(guild_id);
    return;
  }
  if (!server_queue) return;

  server_queue.restart_counter = setTimeout(function() {
    console.log("Failed to load song for 15 seconds !! Restarting");
    server_list_restart(guild_id, server_queue.voice_channel);
  }, 15000);
/*
  if (!spotify_premium_experience) {
    if (started_playing % 5 === 0) {
      console.log(`Played ${finished_playing} !!! Ad will be played after this song !!!`);
    }

    if (finished_playing % 5 === 0) {
      server_queue.connection.play('./data/play/ad.mp3')
        .on('start', () => {
          ís_playing_ad = true;
          console.log(`Playing ad! Ignoring user input!!`);
        }).on('finish', () => {
          console.log(`Ad finished playing! User input re-enabled`);
          is_playing_ad = false;

          server_queue.currentSec = 0;
          server_queue.timer = null;

          finished_playing++;
          // Check if single loop is enable
          if (server_queue.single_loop) {
            play_song(guild_id, server_queue.songs[0]);
            return;
          }
          // Get finshed playing song
          const finished_song = server_queue.songs.shift();
          // Check if queue loop is enable
          if (server_queue.queue_loop) server_queue.songs.push(finished_song);
          // Play next song in queue
          play_song(guild_id, server_queue.songs[0]);
        });
      return;
    }
  }*/

  var stream;
  if (song.platform === 'youtube'){
    stream = await ytdl(song.url, {filter: 'audioonly'});
  } else if (song.platform === 'soundcloud'){
    stream = await scdl.download(song.url);
  }


  server_queue.connection.play(stream, {
      seek: 0,
      volume: 0.75
    })
    .on('start', () => {
      server_queue.currentSec = 0;
      clearTimeout(server_queue.timer);
      server_queue.timer = null;
      started_playing++;
      console.log(`(${started_playing}) [${platform[song.platform].name}] Playing: ${song.title} | From: ${song.author}`);
      clearTimeout(server_queue.restart_counter);
      setTimeout(function() {
        server_queue.timer = update_timer(server_queue, song);
      }, 1000);
    }).on('finish', () => {
      finished_playing++;
      // Check if single loop is enable
      if (server_queue.single_loop) {
        play_song(guild_id, server_queue.songs[0]);
        return;
      }
      // Get finshed playing song
      const finished_song = server_queue.songs.shift();
      // Check if queue loop is enable
      if (server_queue.queue_loop) server_queue.songs.push(finished_song);
      // Play next song in queue
      play_song(guild_id, server_queue.songs[0]);
    });
  return;
}

/**
 * Skip an amount of songs
 * @param {object} message 
 * @param {object} server_queue 
 * @param {string, integer} time 
 * @returns {void}
 */
const skip_song = (message, server_queue, time) => {
  var t = (isNaN(parseInt(time)) ? 1 : parseInt(time));
  if (!server_queue) {
    return message.reply("***Squigg cannot find any song in the queue!***");
  }
  //console.log(time);
  
  for (let i = 1; i <= time; i++) {
    server_queue.songs.shift();
  }
    
  server_queue.connection.dispatcher.end();
  var txt = `Skipped ${t} ${t > 1 ? "songs":"song"}.`;
  console.log(txt);
  message.channel.send(txt);
}

/**
 * Delete server's queue and leave
 * @param {object} message 
 * @param {object} server_queue 
 * @returns {void}
 */
const stop_song = (message, server_queue) => {
  //skip_song(message, server_queue, 1);
  if (!server_queue) return message.channel.send("❌ *** Squigg is not in a voice channel *** ❌");;
  message.channel.send("❌ *** Squigg have left the voice channel *** ❌");
  server_queue.connection.dispatcher.end();
  server_queue.voice_channel.leave();
  clearTimeout(server_queue.restart_counter);
  server_list.delete(server_queue.id);
  //target.setTopic("Music request for @squigg");
}

/**
 * Loop the current song
 * @param {object} message 
 * @param {object} server_queue 
 * @param {object} single 
 * @returns {void}
 */
const loop_song = (message, server_queue, single) => {
  if (single) {
    server_queue.single_loop = (server_queue.single_loop ? false : true);
    return message.channel.send(`🔂 ***Squigg is now${(server_queue.single_loop ? "":" not")} looping the current song***`);
  } else {
    server_queue.queue_loop = (server_queue.queue_loop ? false : true);
    return message.channel.send(`🔁 ***Squigg is now${(server_queue.queue_loop ? "":" not")} looping the queue***`);
  }
}

/**
 * Pause the current song
 * @param {object} message 
 * @param {object} server_queue 
 * @returns {void}
 */
const pause_song = (message, server_queue) => {
  if (!server_queue.songs.length) {
    return message.reply("***Squigg cannot find any song in the queue!***");
  }

  if (!server_queue.pause) {
    server_queue.connection.dispatcher.pause();
    server_queue.pause = true;
    return message.channel.send("⏸️ ***Squigg have pause the music***");
  } else {
    return message.channel.send("⏸️ ***Squigg have already paused the music***");
  }
}

/**
 * Shuffle server's current queue 
 * @param {object} message 
 * @param {object} server_queue 
 * @returns {void}
 */
const shuffle_playlist = (message, server_queue) => {
  if (!server_queue.songs.length) {
    return message.reply("🔀 ***Squigg have shuffled your... blank list***");
  }

  var array = server_queue.songs;
  var current = array.shift();

  var shuffledArray = array.sort((a, b) => 0.5 - Math.random());
  shuffledArray.unshift(current);

  server_queue.songs = shuffledArray;
  message.channel.send("🔀 ***Squigg have shuffled your list***");
}

/**
 * Un-pause/Resume current song.
 * @param {object} message 
 * @param {object} server_queue 
 * @returns {void}
 */
const resume_song = (message, server_queue) => {
  if (!server_queue.songs.length) {
    return message.reply("***Squigg cannot find any song in the queue!***");
  }

  if (server_queue.pause) {
    server_queue.connection.dispatcher.resume();
    server_queue.pause = false;
    setTimeout(function() {
      server_queue.timer = update_timer(server_queue, server_queue.songs[0]);
    }, 1000);
    return message.channel.send("▶️ ***Squigg have unpaused the music***");
  } else {
    return message.channel.send("▶️ ***The music is playing. Bruh***");
  }
}

/**
 * Parse a playlist with given link
 * @param {object} message 
 * @param {string} link 
 * @param {object} server_queue 
 * @returns {object} 
 * @deprecated Too lazy to delete, don't use this function, use get_playlist_link instead
 */
const parse_playlist = async (message, link, server_queue) => {
  if (link !== null) {
    const playlist = await get_playlist_link(message, link);
    if (!playlist)
      return message.reply("***Squigg found that URL very unhelpful, pls provide another***");

    for (let i = 0; i < playlist.length; i++) {
      server_queue.songs.push(playlist.item[i]);
    }

    var a = {
      name: playlist.name,
      duration: playlist.duration,
      length: playlist.length,
      requested_by: message.author.username
    }

    return a;
    //console.log(server_queue);
  }
  return;
  //playlist_database.push(playlist_constructor);
  //message.reply(`Playlist created [${_name} (ID: ${id})]`);
}

/**
 * Parse a playlist with given link
 * @param {object} message 
 * @param {string} link 
 * @returns {object}
 */
const get_playlist_link = async (message, link) => {
  // Youtube playlist
  var list = {
    item: [],
    name: null,
    length: null,
    duration: null,
    durationSec: null,
    requested_by: message.author.username,
    //is_playlist: true,
  }
  const playlist = await ytpl(link);

  if (!playlist) {
    console.log("Cannot find specific playlist! Invalid/Bad URL request!");
    return;
  }

  list.name = playlist.title;
  list.length = playlist.items.length;

  playlist.items.forEach(item => {
    const song_constructor = {
      title: item.title,
      url: item.shortUrl,
      id: item.id,
      requested_by: message.author.username,
      length: item.durationSec,
      author: item.author.name,
      thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      platform: "youtube"
    }
    list.item.push(song_constructor);
    list.durationSec += item.durationSec;
  });
  list.duration = seconds_to_ms(list.durationSec);

  return list;
}

/**
 * Send current playing song.
 * @deprecated Old function
 * @param {object} message 
 * @param {object} server_queue 
 * @param {object} Discord 
 */
const send_current = (message, server_queue, Discord) => {

  var targetChannel = message.channel;

  var next_song = (server_queue.songs[1] ? `${server_queue.songs[1].title}\nRequested by: ${server_queue.songs[1].requested_by}` : "Empty queue");

  //console.log(`https://i.ytimg.com/vi/${server_queue.songs[0].id}/hqdefault.jpg`);

  let thumbnail = `https://i.ytimg.com/vi/${server_queue.songs[0].id}/hqdefault.jpg`;

  const now_playing = new Discord.MessageEmbed()
    .setColor(embeded_color)
    .setAuthor(`------  Squigg is playing  ------`)
    .setTitle(server_queue.songs[0].title)
    .setThumbnail(thumbnail)
    .setDescription(`Requested by ${server_queue.songs[0].requested_by}`)
    .addFields({
      name: 'Next song:',
      value: ` ${next_song}`
    })
  targetChannel.send(now_playing);
}

/**
 * Send server's current queue
 * @param {object} message 
 * @param {object} server_queue 
 * @param {object} Discord 
 * @returns {void}
 */
const send_queue = (message, server_queue, Discord) => {
  if (!server_queue || !server_queue.songs.length)
    return message.channel.send("***Squigg's queue is empty!***");

  const structure = {
    page: [],
    current: 0,
  }

  const page = Math.ceil(server_queue.songs.length / 10);



  for (let i = 0; i < page; i++) {
    var song_list = "\n";
    for (let j = i * 10 + 1; j <= (server_queue.songs.length - 1 > ((i * 10) + 10) ? ((i * 10) + 10) : server_queue.songs.length - 1); j++) {
      song_list += `${j}. ${server_queue.songs[j].title}\n\n`;
    }
    const last_song_in_page = (((i + 1) * 10) < server_queue.songs.length ? ((i + 1) * 10) : server_queue.songs.length);
    const v_page = new Discord.MessageEmbed()
      .setColor(embeded_color)
      .setTitle(`***🎶 ------ Squigg's queue ------ 🎶***`)
      .addFields({
        name: `Page: ${i+1} of ${page} (From ${i*10+1} to ${last_song_in_page} of ${server_queue.songs.length})`,
        value: '```' + song_list + '```'
      })
      .setFooter(`⬅️ Previous page     ➡️ Next page     🔂 Loop: ${server_queue.single_loop}     🔁 Queue loop: ${server_queue.queue_loop}`);
    structure.page.push(v_page);
  }

  message.channel.send(structure.page[0]).then((msg) => {
    Promise.all([
      msg.react('⬅️'),
      msg.react('➡️')
    ]).catch(error => console.log("Failed to react!"));

    interactable_message.set(msg.id, structure);
    setTimeout(function() {
      interactable_message.delete(msg.id);
    }, 300000);

  });
}

/**
 * Convert seconds to MM:SS format
 * @param {integer} d 
 * @returns {string}
 */

const seconds_to_ms = (d) => {
  d = Number(d);
  var m = Math.floor(d / 60);
  var s = d - (m * 60);

  var mDisplay = ((m < 10 ? "0" + m : m));
  var sDisplay = ((s < 10 ? "0" + s : s));

  return mDisplay + ":" + sDisplay;
}

/**
 * Restart server's queue (15 seconds timeout).
 * @param {string} guild_id 
 * @param {object} voice_channel 
 * @returns void
 */
const server_list_restart = async (guild_id, voice_channel) => {
  /*if (!guild_id){
      var backup_server_counter = 0;
      var key = server_list.keys();
      if (!key) {
          return console.log(`Backup Session Complete (No server is required to be backup)`);
      }
      backup_data.push(key.data);

      while (true){
          if (key.next().done){
              console.log(`Backup Session Complete (${backup_server_counter} servers)`);
              break;
          }
          // Close connection
          key.data.connection.dispatcher.end();
          key.data.connection = null;
          // Push data into backup array
          backup_data.push(key.data);
          // Delete key from server list
          console.log(`Removing ${key.data.id} ...`);
          server_list.delete(key.data.id);
          backup_server_counter++;
      }
  }*/
  var server_queue = server_list.get(guild_id);
  if (!server_queue) return console.log("Cant find guild with id of " + guild_id);

  // Backup data
  var temp_song = server_queue.songs;
  var temp_sloop = server_queue.single_loop;
  var temp_qloop = server_queue.queue_loop;
  //Delete queue
  server_list.delete(guild_id);

  const queue_structure = {
    id: guild_id,
    voice_channel: voice_channel,
    connection: null,
    single_loop: temp_sloop,
    queue_loop: temp_qloop,
    pause: false,
    currentSec: 0,
    timer: null,
    songs: temp_song,
    restart_counter: null
  }

  server_list.set(guild_id, queue_structure);
  console.log("Restarting ...");

  server_queue = server_list.get(guild_id);
  try {
    const connection = await voice_channel.join();
    server_queue.connection = connection;
    //server_queue.songs.unshift(server_queue.songs[0]);
    play_song(server_queue.id, server_queue.songs[0]);
  } catch (err) {
    console.log("Server failed to restart");
    throw err;
  }

  return console.log("Server restarting process completed !!!");
}

/**
 * Handle all interactable (through emojis) message 
 * @param {object} _message 
 * @param {string} message_id 
 * @param {integer} action_id 
 * @returns {void}
 */
const system_interactable_message = (_message, message_id, action_id) => {
  var message = interactable_message.get(message_id);

  if (!message) {
    return;
  }

  switch (action_id) {
    case -1:
      if (message.current === 0) {
        message.current = message.page.length;
        break;
      }
      message.current--;
      break;

    case 1:
      if (message.current === message.page.length) {
        message.current = 0;
        break;
      }
      message.current++;
      break;
  }

  const embed = message.page[message.current];

  _message.channel.messages.fetch({
      around: message_id,
      limit: 1
    })
    .then(msg => {
      const fetchedMsg = msg.first();
      fetchedMsg.edit(embed);
    });
}

/**
 * Create current playing song embed message
 * @param {object} message 
 * @param {object} server_queue 
 * @param {object} Discord 
 * @returns {object} Embed Message
 */
const create_np = (message, server_queue, Discord) => {
  var now_playing;

  if (!server_queue || !server_queue.songs.length) {
    now_playing = new Discord.MessageEmbed()
      .setColor(embeded_color)
      .setAuthor(`📻 Squigg' Undead Musigg Player 📻`)
      .setTitle('No song is playing at the moment')
      .setThumbnail("https://cdn.discordapp.com/attachments/769427216366698496/889394395399479316/sad.png")
      .setDescription(`Type [play <song_name/link>] to play a song.`);
    return (now_playing);
  }
  var next_song = (server_queue.songs[1] ? `${server_queue.songs[1].title}\nRequested by: ${server_queue.songs[1].requested_by}` : "Empty queue");

  //console.log(`https://i.ytimg.com/vi/${server_queue.songs[0].id}/hqdefault.jpg`);


  var prog_len = 55;

  var now = server_queue.currentSec;
  var max = server_queue.songs[0].length;

  var pass = Math.ceil((now / max) * prog_len);
  var next = prog_len - pass;

  var dnow = seconds_to_ms(now);
  var dmax = seconds_to_ms(max);

  var tm = `***${dnow}***      ${'-'.repeat(pass)}o${'-'.repeat(next)}     ***${dmax}***`;

  var current_song = server_queue.songs[0];
  let thumbnail = current_song.thumbnail;
  now_playing = new Discord.MessageEmbed()
    .setColor(embeded_color)
    .setAuthor(`📻 Squigg' Undead Musigg Player 📻`, platform[current_song.platform].icon_url)
    .setTitle(current_song.title)
    .setThumbnail(thumbnail)
    .setDescription(`${tm}\n\n***From: ${current_song.author}***\nRequested by: ${current_song.requested_by}`)
    .addFields({
      name: 'Next song:',
      value: ` ${next_song}`
    });
  return (now_playing);
  //targetChannel.send(now_playing).id;
}

/**
 * Song's progress tracker 
 * @param {object} server_queue 
 * @param {object} song 
 * @returns {void}
 */
const update_timer = (server_queue, song) => {
  if (server_queue.currentSec === song.length) {
    return;
  } else {
    server_queue.currentSec++;
  }

  if (server_queue.pause) return;
  //console.log(`${song.title} | ${server_queue.currentSec}/${song.length}`);

  server_queue.timer = setTimeout(function() {
    update_timer(server_queue, song);
  }, 1000);
}

//const update
/*
const apply_nightcore_effect = async (message, song) => {
    //let link = "https://www.youtube.com/watch?v=idipMrfAZHk&ab_channel=ArtzieMusic";
	console.log(`Received request for ${song.url}`);


    const youtubeMp3Converter = require('youtube-mp3-converter')
    const convertLinkToMp3 = youtubeMp3Converter(".");
    
    const pathToMp3 = await convertLinkToMp3(song.url, {
        title: 'input'
    })
    
    console.log(`Downloaded song, changing pitch`);

    var spawn = require('child_process').spawn;
    var cmd = 'ffmpeg';

    try {
        fs.unlink('output.mp3', (haha) => console.log(haha));
    } catch (err){
        console.log(err);
    }

    var args = [
        '-i', 'input.mp3',
        '-af', 'asetrate=44100*1.22',
        '-f', 'mp3', 'output.mp3'
    ];

    var proc = spawn(cmd, args);

    proc.stdout.on('data', function(data) {
        console.log(data);
        console.log("Pitch changed successfully of mp3");
        console.log(outputFilePath);
        return true;
    });

    //proc.stderr(console.log("Err"));

	proc.on('close', function() {
        console.log('finished');
        setTimeout(function(){play_song(message, song, true)}, 1000);
        //fs.unlink(`./data/play-temp/input.mp3`, (err) => console.log(err));
    });
    //}, 5000);
}
*/

/**
 * Remove duplicated song function
 * @param {object} message 
 * @param {object} server_queue 
 */
const remove_duplicate = (message, server_queue) => {
  var a = 0;
  var song = new Map();
  var repeated = 0;

  for (let i = 0; i < server_queue.songs.length; i++) {
    var repeat = song.get(server_queue.songs[i].id);

    if (repeat != null) {
      server_queue.songs.splice(i, 1);
      console.log(`Remove duplicate at position: ${a} - Origin: ${repeat}`);
      repeated++;
      i--;
    } else {
      song.set(server_queue.songs[i].id, i);
    }
    a++;
  }

  console.log(repeated + ` duplicated ${(repeated <= 1 ? "song":"songs")} removed`);
  message.channel.send(repeated + ` duplicated ${(repeated <= 1 ? "song":"songs")} removed`);
}

/**
 * Create live now playing (init message)
 * @param {object} message 
 * @param {object} server_queue 
 * @param {object} Discord 
 */
const init_now_playing = (message, server_queue, Discord) => {
  const np = now_playing_list.get(message.guild.id);
  var txt = "Created";
  if (np) {
    txt = "Recreated";
    clearInterval(np.clock);
    np.msg.delete();
    now_playing_list.delete(message.guild.id);
  }

  //message.channel.send(txt + " now playing message!");
  message.channel.send(create_np(message, server_queue, Discord))
    .then((msg) => {
      const obj = {
        msg: msg,
        clock: setInterval(function() {
          update_now_playing(message.guild.id, Discord);
        }, 5000),
      }

      now_playing_list.set(message.guild.id, obj);
    });
}
/**
 * Update active init message (Live now playing)
 * @param {string} guild_id 
 * @param {object} Discord 
 * @returns {void}
 */
const update_now_playing = (guild_id, Discord) => {
  const message = now_playing_list.get(guild_id).msg;
  const server_queue = server_list.get(guild_id);

  if (!message) return;

  message.channel.messages.fetch({
    around: message.id,
    limit: 1
  })
  .then(msg => {
    const fetchedMsg = msg.first();
    fetchedMsg.edit(create_np(message, server_queue, Discord));
  });
}

const search_soundcloud = async (args, message) => {
  if (args[0].includes('soundcloud.com')){
    console.log("Getting stream from link: " + args[0])
    return scdl.getInfo(args[0]).then(result => {
      //console.log(result);
      if (!result) return console.log("Cannot find song");
      song = {
        title: result.title,
        url: result.permalink_url,
        id: result.id,
        requested_by: message.author.username,
        length: Math.round(result.duration/1000),
        author: result.user.username,
        thumbnail: result.artwork_url,
        platform: "soundcloud"
      }
      return song;
    });
  } else {
    var searchTerm = args.join(" ");
    console.log("Searching link from: " + searchTerm);
    return scSearch.tracks(searchTerm, 1, results => {
      //console.log(results);
      if (!results.length) return console.log("Cannot find song");
      song = {
        title: results[0].title,
        url: results[0].permalink_url,
        id: results[0].id,
        requested_by: message.author.username,
        length: Math.round(results[0].duration/1000),
        author: results[0].user.username,
        thumbnail: results[0].artwork_url,
        platform: "soundcloud"
      }
      return song;
    });
  }
}

const send_lyrics = async(Discord, message, searchterm, searchtermII, sth) => {
    var thumbnail = (!sth ? "https://media.discordapp.net/attachments/769427216366698496/893126933896912946/dd3dow7-b4ef3924-a9f5-4793-be94-9c71b56447b4.png":sth);
    var lyrics = null;
    var info = null;

    
    try {
      var searches = await Client.songs.search(searchterm);
      
      info = await searches[0];
      var cow = await searches[0].lyrics()
      .then(data => {
        lyrics = data;
        })
      .catch(err => lyrics = null);
    } catch (err){
      console.log(`Failed to find lyrics by (${searchterm}), initiating second attempt`);
      if (searchtermII){
          try{
            var searches = await Client.songs.search(searchtermII);
            info = await searches[0];
            await searches[0].lyrics()
            .then(data => {
              lyrics = data;
              })
            .catch(err => lyrics = null);
            
          }catch(err){
            console.log(`Failed to find lyrics by (${searchtermII}), terminating second attempt`);
          }
      } else console.log("searchterm2 dont fucking exist" );
    }

    

    var embed_message = new Discord.MessageEmbed()
      .setColor('#000000')
    console.log(`searches lyics for ${searchterm}`);
    if (!lyrics) {
      if (!info){
      embed_message.setDescription(`***Squigg found nothing, sory...***`);
      embed_message.setThumbnail("https://cdn.discordapp.com/attachments/769427216366698496/889394395399479316/sad.png")
      embed_message.setTitle(`***ERROR 404***`);
      console.log("lyrics found failed");
      } else {
        embed_message.setDescription(`***This song have no lyrics, baka***`);
        embed_message.setThumbnail("https://cdn.discordapp.com/attachments/769427216366698496/893846976616087592/ezgif-3-237238890170.png");
        embed_message.setTitle(`***ERROR 410 GONE***`);
        console.log("lyrics found failed...partially");
      }
      
      
      
    } else {
      embed_message.setDescription(`***${lyrics}\n\n\n\n\nNot what you want? search manually instead!***`);
      embed_message.setTitle(`***${info.title} by ${info.artist.name}***`);
      embed_message.setThumbnail(thumbnail);
    }
    message.channel.send(embed_message);
}


const cut_string = (str) => {
  var rval = "";
  for (let i = 0; i < str.length; i++){
    if (str[i] === '('){
      return rval.trim();
    } else {
      rval += str[i];
    }
  }
  return rval;
}