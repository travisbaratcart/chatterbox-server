/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/



var qs = require('querystring');
var fs = require('fs');
var path = require('path');

var savedMessages;

const logFilePath = './savedMessages.txt';
fs.exists(logFilePath, function(exists) {
  if (exists) {
    fs.readFile(logFilePath, function(error, content) {
      savedMessages = JSON.parse(content);
    });
  } else {
    console.log(logFilePath + ' does not exist');
  }
});

savedMessages = savedMessages || {results: []};

var objectCount = 1;

var statusCode = 200;

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var extensions = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg'
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);  

  var headers = defaultCorsHeaders;

  if (request.url.indexOf('messages') > -1) {
    if (request.method === 'GET') {
      headers['Content-Type'] = 'text/json';
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(savedMessages)); 
    } else if (request.method === 'POST') {
      receiveMessage(request, response); 
    } else {
      headers['Content-Type'] = 'text/plain';
      response.writeHead(statusCode, headers);
      response.end('');
    }
  } else {
    var filePath = './client' + (request.url === '/' ? '/index.html' : request.url);

    fs.readFile(filePath, function(error, content) {
      if (error) {
        response.writeHead(500);
        response.end();
      } else {
        ext = path.extname(filePath);
        headers['Content-Type'] = extensions[ext];
        response.writeHead(statusCode, headers);
        response.end(content);
      }
    });
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


var receiveMessage = function(request, response) {
  var headers = defaultCorsHeaders;
  var body = '';

  request.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      request.connection.destroy();
    }
  });

  request.on('end', function () {
    var post = qs.parse(body);
    var message;

    for (var key in post) {
      message = JSON.parse(key);
    }

    message.objectId = objectCount++;
    if (!message.username) {
      message.username = 'anonymous';
    }
    savedMessages.results.push(message);
    fs.writeFile('./savedMessages.txt', JSON.stringify(savedMessages));
  });


  headers['Content-Type'] = 'text/plain';

  response.writeHead(statusCode, headers);
  response.end();
};

module.exports = requestHandler;