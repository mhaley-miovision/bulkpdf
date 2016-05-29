var http = require('http');
var path = require('path');
var fs = require('fs');
var static = require('node-static');
var file = new static.Server('./', {cache: false});

//Lets define a port we want to listen to
const PORT=8080;
const SAVE_FILE="saved_list.json";

//We need a function which handles requests and send response
function handleRequest(request, response){
    switch(request.url) {
        case "/list":
            //either call a function or do inline
            fs.readdir("./pdf", function(err, files) {
                response.end(JSON.stringify(files));
            });
            break;
        case "/save":
            console.log("Saving....");
            request.on('data', function (data) {
                var fd = fs.openSync(SAVE_FILE, "w");
                fs.writeSync(fd, data.toString());
                fs.closeSync(fd);
                console.log("done");
                response.end("ok");
			});
            break;
        case "/load":
            console.log("Loading...");
            file.serveFile(SAVE_FILE, 200, {}, request, response);
            break;

        default:
            file.serve(request, response);
    }
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
