let port = 4080;

exports.port = port;

let server = require('./basicserver').createServer();

// 配置服务器 对不同请求 使用相应的模块进行处理

/** 
 * 直接访问 '127.0.0.1:4080/favicon.ico'（这个文件名是硬编码在useFavIcon方法中的）
 * 会被处理对应./docroot/favicon.ico的文件 并返回
 */
server.useFavIcon("127.0.0.1","./docroot/favicon.ico");

// 输入'127.0.0.1:4080/1/ex1' '127.0.0.1:4080/1/ex2'会被重定向
server.addContainer(".*","/1/(.*)$",require('./redirector'),{});

/**
 * 直接访问 '127.0.0.1:4080/xxx.xx'
 * 都会被对应到./docroot目录下的某静态文件
 * 直接访问 '127.0.0.1:4080' 会被改指向 '127.0.0.1:4080/index.html'
 */
server.docroot("127.0.0.1",'/','./docroot');

// 打印已支持的容器
console.log('tag-server-containers', server.basicServer.containers);

// 启动http的会话监听
require('./httpsniffer').sniffOn(server);

// 所有的请求仅在对应端口才会被响应
server.listen(port);

console.log(`Listening to http://127.0.0.1:${port}/`);
