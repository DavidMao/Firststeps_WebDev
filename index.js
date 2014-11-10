var app = require("http").createServer(createServer);
var fs = require('fs');
var url = require('url');
var port = process.env.PORT || 5000

function createServer(req, res) {
    var path = url.parse(req.url).pathname;
    var fsCallback = function(error, data) {
        if(error) throw error;

        res.writeHead(200);
        res.write(data);
        res.end();
    }

    switch(path) {
        case '/':
            doc = fs.readFile(__dirname + '/source/index.html', fsCallback);
		break;
        case '/morning':
            doc = fs.readFile(__dirname + '/source/morning/morning.html', fsCallback);
        break;
        case '/jiayi':
            doc = fs.readFile(__dirname + '/source/jiayi.html', fsCallback);
        break;
        default:
            doc = fs.readFile(__dirname + '/source/notFound.html', fsCallback);
        break;
	}
}

app.listen(port, function() {
  console.log("Node app is running at localhost:" + port)
})
