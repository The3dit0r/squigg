//const ytSearch = require('yt-search');

var search_result = [];
var current_focus = -1;
var interval;
var sclength = 0;
var stlength = 0;
var playing = false;
var repeat = 0;
var searching = false;
var connected = false;
var guild_id = "";

var timeout = false;

const repeat_png = [
    "https://cdn.discordapp.com/attachments/769427216366698496/893843086252335174/nrepeat.png",
    "https://cdn.discordapp.com/attachments/769427216366698496/893850114009997342/repeat.png",
    "https://cdn.discordapp.com/attachments/769427216366698496/894125090684411924/ezgif-2-42e4f99018ed.png"
];

const plps_png = [
    "https://cdn.discordapp.com/attachments/769427216366698496/893804037357592626/play.png",
    "https://cdn.discordapp.com/attachments/769427216366698496/893804050913562634/pause.png"
  ];

const seconds_to_mns = (d) => {
  d = Number(d);
  var m = Math.floor(d / 60);
  var s = d - (m * 60);

  var mDisplay = ((m < 10 ? "0" + m : m));
  var sDisplay = ((s < 10 ? "0" + s : s));

  return mDisplay + ":" + sDisplay;
}

const pp_button = () => {
  if (timeout | !connected) return;
  timeout = true;

  const cmd = ['resume','pause'];

  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\",\"action\":\"${cmd[+playing]}\"}`
  }).then(response => response.json())
    .then(data => {
      update_server();
      timeout = false;
    })
 
}

const sk_button = () => {
  if (timeout | !connected) return;
  timeout = true;

  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\",\"action\":\"skip\"}`
  }).then(response => response.json())
    .then(data => {
      update_server();
      timeout = false;
    })
 
}


const rd_button = () => {
  if (timeout | !connected) return;
  timeout = true;

  fetch("https://discord-bot.blueg15.repl.co/server/play", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"id\":\"769373256917975080\",\"action\":\"rd\"}"
  }).then(response => response.json())
    .then(data => {
      update_server();
      timeout = false;
    })
 
}

const sf_button = () => {
  if (timeout | !connected) return;
  timeout = true;


  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\",\"action\":\"shuffle\"}`
  }).then(response => response.json())
    .then(data => {
      //if (data.message === "ok") playing = !playing;
      timeout = false;
      update_server();
    })
 
}


const rp_button = () => {

  if (timeout | !connected) return;
  timeout = true;

  cmd = ['qloop', 'sloop', 'nloop'];

  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\",\"action\":\"${cmd[repeat]}\"}`
  }).then(response => response.json())
    .then(data => {
      var button = document.getElementById('rp-button');
      timeout = false;
      update_server();
    })
  
}

const pn_button = (id) => {
  if (timeout | !connected) return;
  timeout = true;
  var pos = parseInt(id);
  if (isNaN(pos)) return;

  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\",\"action\":\"pn\",\"args\":${pos}}`
  }).then(response => response.json())
    .then(data => {
      timeout = false;
      update_server();
    });
}

const tt_button = (id) => {
  if (timeout | !connected) return;
  timeout = true;
  var pos = parseInt(id);
  if (isNaN(pos)) return;
  fetch("https://discord-bot.blueg15.repl.co/server/play", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": `{\"id\":\"${guild_id}\",\"action\":\"totop\",\"args\":${pos}}`
  }).then(response => response.json())
    .then(data => {
      timeout = false;
      update_server();
    })
}

const rm_button = (id) => {
  if (timeout | !connected) return;
  timeout = true;
  var pos = parseInt(id);
  if (isNaN(pos)) return;
  fetch("https://discord-bot.blueg15.repl.co/server/play", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": `{\"id\":\"${guild_id}\",\"action\":\"remove\",\"args\":${pos}}`
  }).then(response => response.json())
    .then(data => {
      timeout = false;
      update_server();
    })
}

const cbs = (id) => {
  const button = document.getElementById(id);

  if (!button) return;

  if (button.classList.contains('active')) {
    current_focus = -1;
    button.classList.remove('active');
  } else {
    const prev_active = document.getElementById(current_focus);
    if (prev_active) prev_active.classList.remove('active');
    current_focus = id;
    button.classList.add('active');
  }
};


const add = (song_id, type) => {
  if (timeout | !connected) return;
  var s = search_result[song_id];
  if (!s) return;

  console.log(s);

  timeout = true;
  fetch("https://discord-bot.blueg15.repl.co/server/play", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": `{\"id\":\"${guild_id}\",\"action\":\"${type}\",\"args\":{\"title\":\"${s.title}\",\"url\":\"${s.url}\",\"id\":\"${s.id}\",\"requested_by\":\"-\",\"length\": ${s.length},\"author\":\"${s.author}\",\"thumbnail\":\"${s.thumbnail}\",\"platform\":\"youtube\"}}`
  }).then(response => response.json())
    .then(data => {
      timeout = false;
      update_server();
    })
}


const refresh_progbar = (length, total_length) => {
  const bar = document.getElementById('main-prog');

  const clength = document.getElementById('current');
  const tlength = document.getElementById('total');

  var progress = (length / total_length) * 100;
  bar.style.setProperty('--width', progress);

  clength.innerText = seconds_to_mns(length);
  tlength.innerText = seconds_to_mns(total_length);
}

const add_queue_song = (song, id) => {
  //const song = search_result[song_id];
  var newSong = document.createElement("div");
    newSong.classList.add("item-queue");
    newSong.classList.add("active");
    newSong.setAttribute("id", `queue-${id}`);
    //newSong.setAttribute("onclick", `cbs('queue-${id}')`);
    /*newSong.innerHTML = `<button class="move-button"></button>`;*/
    newSong.innerHTML = `<img class="item-queue-cover" src="${song.thumbnail}">`;
    newSong.innerHTML += `<a class="item-queue-duration"> ${song.timestamp} </a>`;
    newSong.innerHTML += `<a class="item-queue-pos">${id}. </a>` ;
    newSong.innerHTML += `<a class="item-queue-title"> ${song.title} </a> <br>`;
    newSong.innerHTML += `<a class="item-queue-artist"> ${song.author} </a> `;
    newSong.innerHTML += `<button onclick="rm_button(${id})" class="item-queue-button"> Remove </button>`;
    newSong.innerHTML += `<button onclick="pn_button(${id})" class="item-queue-button"> Play Now </button>`;
    newSong.innerHTML += `<button onclick="tt_button(${id})" class="item-queue-button"> Move to top </button>`;
  document.getElementById('item-list').appendChild(newSong);
}

const update_server = () => {
  if (guild_id === "") return
  fetch("https://discord-bot.blueg15.repl.co/server/play", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": `{\"id\":\"${guild_id}\"}`
  }).then(response => response.json())
    .then(data => {
      if (data.failed){
        connected = false;
        document.getElementById('item-list').innerHTML = "";
        /*
        document.getElementById("ns-title").innerText = "Empty";
        document.getElementById("ns-artist").innerText = "";
        document.getElementById("ns-cover").src = "";
        */
        document.getElementById('queue-count').innerText = `Current Song Queue - Empty`;
        document.getElementById("cs-title").innerText = "Empty";
        document.getElementById("cs-artist").innerText = "";
        document.getElementById("cs-cover").src = "https://i.ytimg.com/vi/cantfindlol/hqdefault.jpg";
        document.getElementById("connect-status").innerText = "Not Connected - Server doesn't have a queue";
        document.getElementById("connect-status").style.color = "#ffcc00";
        sclength = 0;
        stlength = 0;
        return;
      }
      connected = true;
      if (!data.songs[1]) {
        /*document.getElementById("ns-title").innerText = "Empty";
        document.getElementById("ns-artist").innerText = "";
        document.getElementById("ns-cover").src = "";*/
        document.getElementById('queue-count').innerText = `Current server queue - No song queued`;
      }

      document.getElementById("connect-status").innerText = `Connected - Server ID: ${guild_id}`;
      document.getElementById("connect-status").style.color = "#4bb543";

      document.getElementById('item-list').innerHTML = "";
      sclength = data.currentSec;
      stlength = data.songs[0].length;
      refresh_progbar(sclength, stlength);

      document.getElementById('queue-count').innerText = `Current server queue - ${data.songs.length - 1} songs`;
      /*
      document.getElementById("ns-title").innerText = data.songs[1].title;
      document.getElementById("ns-artist").innerText = data.songs[1].author;
      document.getElementById("ns-cover").src = data.songs[1].thumbnail;*/

      document.getElementById("cs-title").innerText = data.songs[0].title;
      document.getElementById("cs-artist").innerText = data.songs[0].author;
      document.getElementById("cs-cover").src = data.songs[0].thumbnail;
      playing = (!data.pause);

      if (data.single_loop) repeat = 2;
      else if (data.queue_loop) repeat = 1;
      else repeat = 0;
      
      var rpbutton = document.getElementById('rp-button');
      rpbutton.src = repeat_png[repeat];

      var ppbutton = document.getElementById('pp-button');
      ppbutton.src = plps_png[+playing];
      
      for (let i = 0; i < data.songs.length; i++){
        const song = {
          thumbnail: data.songs[i].thumbnail,
          title: data.songs[i].title,
          author: data.songs[i].author,
          timestamp: seconds_to_mns(data.songs[i].length)
        }
        if (i < 1) continue;
        add_queue_song(song, i);
      }
    });
}



const add_searched_song = (song, id) => {
  var newSong = document.createElement("div");
  newSong.classList.add("item-queue");
  newSong.setAttribute("id", `result-${id}`)
  newSong.innerHTML = `<img class="item-queue-cover" src="${song.thumbnail}">`;
  newSong.innerHTML += `<a class="item-queue-duration"> ${song.timestamp} </a>`;
  newSong.innerHTML += `<a class="item-queue-title"> ${song.title} </a> <br>`;
  newSong.innerHTML += `<a class="item-queue-artist"> ${song.author.name} </a>`;
  newSong.innerHTML += `<button onclick="add(${id}, 'apn')" class="r-button"> Play Now </button>`;
  newSong.innerHTML += `<button onclick="add(${id}, 'att')" class="r-button"> Add to top </button>`;
  newSong.innerHTML += `<button onclick="add(${id}, 'add')" class="r-button"> Add </button>`;
  document.getElementById('search-result').appendChild(newSong);
}

const search_youtube = (term) => {
  if (searching) return;
  if (!term) {
    term = document.getElementById("search-box").value;
    if (!term.length) return;
  }

  const show_counter = document.getElementById("result-counter");
  show_counter.innerText = "Searching . . ."
  document.getElementById('search-result').innerHTML = "";

  searching = true;
  fetch("https://Discord-bot.blueg15.repl.co/search", {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": `{\"term\":\"${term}\"}`
    }).then(response => response.json())
    .then(data => {
      console.log(data);
      search_result = [];
      show_counter.innerText = (!data.length ? "No result found" : `Found ${data.length} results`);
      for (let i = 0; i < data.length; i++) {
        add_searched_song(data[i], i);
        const song = {
          title: data[i].title,
          url: data[i].url,
          id: data[i].videoId,
          requested_by: '',
          length: data[i].seconds,
          author: data[i].author.name,
          thumbnail: `https://i.ytimg.com/vi/${data[i].videoId}/hqdefault.jpg`,
          platform: "youtube"
        }
        console.log(song);
        search_result.push(song);
      }
      searching = false;
    });
}


function cgi(){
  var temp = document.getElementById('guild-id').value;
  if (temp.length !== 18 || isNaN(parseInt(temp))){
    document.getElementById("connect-status").innerText = "Invalid ID";
    document.getElementById("connect-status").style.color = "#cc3300";
    return;
  } else {
    guild_id = temp;
    document.getElementById("connect-status").innerText = "Connecting. . .";
    document.cookie = guild_id;
    document.getElementById("connect-status").style.color = "#ffffff";
  }

  update_server();
}

function init(){
  
  if (document.cookie) {
    guild_id = document.cookie;
    document.getElementById('guild-id').value = guild_id;
  } else {
    document.getElementById('guild-id').value = "";
    document.getElementById('guild-button').innerText = "Save";
    document.getElementById("connect-status").innerText = "Please enter an ID";
  }


  document.getElementById('item-list').innerHTML = "";
  /*
  document.getElementById("ns-title").innerText = "Loading . . .";
  document.getElementById("ns-artist").innerText = "";
  document.getElementById("ns-cover").src = "";*/
  
  document.getElementById("cs-title").innerText = "Loading . . .";
  document.getElementById("cs-artist").innerText = "";
  document.getElementById("cs-cover").src = "";
  
  sclength = 0;
  stlength = 0;

  document.getElementById('rp-button').src = repeat_png[0];
  document.getElementById('pp-button').src = plps_png[0];


  var server_update = setInterval(function(){
    update_server(); 
  }, 2000);

  setInterval(function(){
    sclength += (playing ? 1:0);
    refresh_progbar(sclength, stlength);
  }, 1000);
}

