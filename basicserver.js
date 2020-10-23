const http = require('http');
const url = require('url');

// 创建一个http服务器 并返回
let createServer = function() {
  let htserver = http.createServer(function(req,res){
    // 将req的服务器接收url信息挂到req.basicServer中
    req.basicServer = {
      urlparsed:url.parse(req.url,true)
    };
    // 添加有用的头信息到req.basicServer中
    processHeaders(req,res);
    // 分发到合适的处理模块中
    dispatchToContainer(htserver,req,res);
  });

  htserver.basicServer = {containers:[]};

  // 添加容器到服务器
  htserver.addContainer = function(host, path, module, options){
    if(lookupContainer(htserver, host, path) !== undefined){
      throw new Error("Already mapped " + host + '/' + path);
    }
    htserver.basicServer.containers.push({
    /** 
     * host：用于匹配host头的正则
     * path：用于匹配url的正则
     * options：选项对象 将配置采纳数传递到处理函数模块
     * module：处理函数
     */
      host:host,
      path:path,
      module:module,
      options:options
    });
    return this;
  }
  // 配置favicon的容器
  htserver.useFavIcon = function(host, path){
    return this.addContainer(host, "/favicon.ico",require('./faviconHandler'),{iconPath:path});
  }
  // 处理静态文件的容器
  htserver.docroot = function(host, path, rootPath){
    return this.addContainer(host,path,require('./staticHandler'),{docroot:rootPath});
  }
  return htserver;
};

exports.createServer = createServer;

// 扫描匹配host和path的container
let lookupContainer = function(htserver,host,path){
  for(let i = 0; i < htserver.basicServer.containers.length; i++){
    let container = htserver.basicServer.containers[i];
    // 可以通过判断Host头部匹配的容器对象来响应来自多个域名的请求
    let hostMatches = host.toLowerCase().match(container.host);
    let pathMatches = path.match(container.path);

    if(hostMatches !== null && pathMatches !== null){
      return {
        container:container,
        host:hostMatches,
        path:pathMatches
      }
    }
  }
  return undefined
}

// 搜索req.headers数组以查找cookie和Host头部；
let processHeaders = function(req,res){
  req.basicServer.cookies = [];
  let keys = Object.keys(req.headers);
  for(let i = 0, j = keys.length; i < j; i++){
    let hname = keys[i];
    let hval = req.headers[hname];
    if(hname.toLowerCase() === 'host'){
      req.basicServer.host = hval;
    }
    if(hname.toLowerCase() === "cookie"){
      req.basicServer.cookies.push(hval);
    }
  }
}

// 查找匹配的容器 分派请求到对应的容器中
let dispatchToContainer = function(htserver,req,res){
  
  // 根据req信息 查找对应的用于处理的容器
  let container = lookupContainer(htserver, req.basicServer.host,req.basicServer.urlparsed.pathname);
  if(container !== undefined){
    req.basicServer.hostMatches = container.host;
    req.basicServer.pathMatches = container.path;
    req.basicServer.container = container.container;

    console.log('tag-req.basicServer', req.basicServer);

    container.container.module.handle(req,res);
  }else{
    // 没有找到对应容器 用户会得到一个错误页面
    res.writeHead(404,{'Content-Type':'text/html'});
    res.end("no handler found for " + req.host + "/" + req.basicServer.urlparsed.path);
  }
}