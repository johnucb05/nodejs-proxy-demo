let http = require('http')
let request = require('request')

let argv = require('yargs')
    .default('host', '127.0.0.1')
    .argv
let scheme = 'http://'
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
//process.stdout.write("\nargv.host: " + argv.host + "\n");
let destinationUrl = argv.url || scheme + argv.host + ':' + port
//process.stdout.write("\ndestinationUrl: " +destinationUrl+ "\n");

let path = require('path')
let fs = require('fs')
let logPath = argv.logdestination && path.join(__dirname, argv.logdestination)
//let getLogStream = ()=> logPath ? fs.createWriteStream(logPath) : process.stdout
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout

http.createServer((req, res) => {
    destinationUrl = req.headers['x-destination-url'] || destinationUrl
    console.log("Proxying request to: " + destinationUrl + " " + req.url)
    let options = {
        headers: req.headers,
        //url: "http://${destinationUrl}${req.url}",
	url: destinationUrl,
	method: req.method
    }
    //req.pipe(request(options)).pipe(res)
    process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
    //req.pipe(process.stdout)
    //req.pipe(getLogStream())
    logStream.write("Request Headers: " + JSON.stringify(req.headers) + "\n\n");
    req.pipe(logStream, {end: false})
    let downstreamResponse = req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(process.stdout)
    //downstreamResponse.pipe(logStream, {end: false})
    downstreamResponse.pipe(res)
}).listen(8001)

