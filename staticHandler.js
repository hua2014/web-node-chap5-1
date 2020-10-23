const fs = require('fs');
const mime = require('mime');

// 静态文件处理程序：处理文件系统内的文件
exports.handle = function(req,res){
  if(req.method !== 'GET'){
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end("invalid method " + req.method);
  }else{
    // docroot指示存放文件的文件夹路径
    let fname = req.basicServer.container.options.docroot + req.basicServer.urlparsed.pathname;
    if(fname.match(/\/$/)){
      fname += "index.html";
    }

    fs.stat(fname, function(err, stats){
      if(err){
        res.writeHead(500,{
          'Content-Type':'text/plain'
        });
        res.end('File ' + fname + ' not found ' + err);
      }else{
        fs.readFile(fname, function(err, buf){
          if(err){
            res.writeHead(500,{
              'Content-Type':'text/plain'
            });
            res.end('File ' + fname + ' not readable ' + err);
          }else{
            // 读取文件如果没发生问题 文件内容会被包含在res对象中发送回浏览器
            res.writeHead(200,{
              'Content-Type':mime.getType(fname),
              'Content-Length':buf.length
            });
            res.end(buf);
          }
        });
      }
    });
  }
}
