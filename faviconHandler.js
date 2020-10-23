const fs = require('fs');
const mime = require('mime');

// 处理对favicon.ico的请求
exports.handle = function(req,res){
  // 该请求仅对Get有效
  if(req.method !== "GET"){
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end("invalid method " + req.method);
  }else if(req.basicServer.container.options.iconPath !== undefined){
    fs.readFile(req.basicServer.container.options.iconPath,function(err, buf){
      if(err){
        res.writeHead(500,{
          'Content-Type':'text/plain'
        });
        res.end(req.basicServer.container.options.iconPath + ' not found');
      }else{
        res.writeHead(200,{
          // MIME模块将根据给出的图标文件 确定正确的MIME类型
          'Content-Type':mime.getType(req.basicServer.container.options.iconPath),
          'Content-Length':buf.length
        });
        res.end(buf);
      }
    });
  }else{
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.end("no favicon")
  }
}