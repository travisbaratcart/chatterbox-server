/* Import node's http module: */
var http = require('http');
var handleRequest = require('./request-handler.js');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');

var app2 = express();
app2.use(bodyParser.urlencoded({extended: false}));
app2.use(bodyParser.json());

// Every server needs to listen on a port with a unique number. The
// standard port for HTTP servers is port 80, but that port is
// normally already claimed by another server and/or not accessible
// so we'll use a standard testing port like 3000, other common development
// ports are 8080 and 1337.
var port = 3000;

// For now, since you're running this server on your local machine,
// we'll have it listen on the IP address 127.0.0.1, which is a
// special address that always refers to localhost.
var ip = '127.0.0.1';

// var savedMessages = {"results":[{"username":"anonymous","text":"hello","roomname":"lobby","objectId":1},{"username":"anonymous","text":"something","roomname":"lobby","objectId":2}]};
var objectCount = 1;
// We use node's http module to create a server.
//
// The function we pass to http.createServer will be used to handle all
// incoming requests.

// var handleRequest = function() {
//   console.log('Received Request!');
// }
//
// After creating the server, we will tell it to listen on the given port and IP. */
// var server = http.createServer(handleRequest);
// console.log('Listening on http://' + ip + ':' + port);
// server.listen(port, ip);
var savedMessages;
const logFilePath = './savedMessages.txt';
fs.exists(logFilePath, function(exists) {
  if (exists) {
    fs.readFile(logFilePath, function(error, content) {
      savedMessages = JSON.parse(content);
      objectCount = savedMessages.objectCount;
      savedMessages.objectCount = undefined;
    });
  } else {
    console.log(logFilePath + ' does not exist');
  }
});

savedMessages = savedMessages || {results: []};

app2.use(express.static('client'));
// app2.use(express.json());

app2.get('/classes/messages', function(req, res) {
  res.send(savedMessages);
});

app2.post('/classes/messages', function(req, res) {
  // console.log(req.body);
  req.body.objectId = objectCount++;
  req.body.username = req.body.username || 'anonymous';
  req.body.createdAt = (new Date()).toJSON();
  savedMessages.results.push(req.body);
  savedMessages.objectCount = objectCount;
  fs.writeFile('./savedMessages.txt', JSON.stringify(savedMessages));
  savedMessages.objectCount = undefined;
});

app2.listen(3000, function() {
  console.log('got here');
});
// To start this server, run:
//
//   node basic-server.js
//
// on the command line.
//
// To connect to the server, load http://127.0.0.1:3000 in your web
// browser.
//
// server.listen() will continue running as long as there is the
// possibility of serving more requests. To stop your server, hit
// Ctrl-C on the command line.

