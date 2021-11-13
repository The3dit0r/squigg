const express   = require("express");
const fs        = require("fs");
const ytSearch  = require("yt-search");
const path      = require('path');
const cors      = require('cors');
const server    = express();

server.use( express.static('public') )
server.use( express.json() )
server.use( cors() )

server.get('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname+'/public/main.html'));
});

server.post('/search', cors(), (req, res) => {
  console.log(req);
  const { term } = req.body;
  
  ytSearch(term).then(data => {
    console.log(data);
    res.status(200).send(data.videos);
  });
});

server.post('/server/play/', cors(), (req, res) => {

  const { id } = req.body;
  const { action } = req.body;
  const { args } = req.body;


  if (action) {
    const command = require(`./commands/play.js`);
    command.server_exec(id, action, args);
    res.status(200).send({message: 'ok'});
  }

  const server_list = require('./commands/play.js').server_list;
  const server_queue = server_list.get(id);


 // console.log(server_queue);

  if (!server_queue) {
    res.send({message: "Cannot find ID", failed: true});
    return;
  }

  const server_info = {
    songs: server_queue.songs,
    single_loop: server_queue.single_loop,
    queue_loop: server_queue.queue_loop,
    pause: server_queue.pause,
    currentSec: server_queue.currentSec,
    failed: false
  }

  res.send(server_info);
});

server.post('/server/config/', cors(), (req, res) => {
  try {
    if (fs.existsSync(`./data/config/${id}.json`)) {
      res.sendFile(`./data/config/${id}.json`);
    }
  } catch {
    console.log('Failed when getting file');
    res.status(404).send({message: "Failed to find config file."});
  }
});



function start_server() {
  server.listen(3000, () => {
    console.log("bot's server is fucked");
    console.log("yay!! no error");
  })
}

module.exports = start_server;