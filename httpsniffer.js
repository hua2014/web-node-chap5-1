const url = require('url');

exports.sniffOn = function(server){
  // server是一个给定的HTTP服务器
  server.on('request',function(req,res){
    // req.method
    // req.httpVersion
    // req.url
    url.parse(req.url, true)

    // req.headers
    // req.trailers
    console.log('tag-request',req.method + ' ' + req.httpVersion + ' ' + req.url);

    console.log(`Listening to http://127.0.0.1:${require('./server').port}/`);
  });

  server.on('close',function(errno){
    console.log('tag-close');
  });

  server.on('checkContinue',function(req,res){
    console.log('tag-checkContinue');
    res.writeContinue();
  });

  server.on('upgrade',function(req,socket, head){
    console.log('tag-upgrade');
  });

  server.on('clientError',function(){
    console.log('tag-clientError');
  });

  // 其他事件，如connection
}