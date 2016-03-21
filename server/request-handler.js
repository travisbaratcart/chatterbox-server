/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// var savedMessages = {results: [{
//   createdAt: '2013-1329101-1232',
//   objectId: '1',
//   roomname: 'hr40',
//   text: 'this better work',
//   updatedAt: '1232139-342345',
//   username: 'literally hitler'
// }]};

var qs = require('querystring');

var savedMessages = {results: []};

var objectCount = 1;

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var statusCode = 200;

  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';

  if (request.method === 'GET') {
    headers['Content-Type'] = 'text/json';
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(savedMessages)); 
  } else if (request.method === 'POST') {

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
    });


    headers['Content-Type'] = 'text/plain';

    response.writeHead(statusCode, headers);
    response.end();
  } else {
    response.writeHead(statusCode, headers);
    response.end('');
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
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

module.exports = requestHandler;