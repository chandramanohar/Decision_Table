var http=require('http')
var fs=require('fs')
var server =http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'text/html'})
    var R=fs.createReadStream(__dirname+"/views/Home.html",'utf-8');
    R.pipe(res);
})
server.listen(3000,'127.0.0.1');
console.log("Server Started")