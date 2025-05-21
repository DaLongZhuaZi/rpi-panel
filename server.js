const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
const os = require('os');

// 从环境变量获取配置
const SERVER_IP = process.env.SERVER_IP || '192.168.5.201';
const DISABLE_SMART_ROUTING = process.env.DISABLE_SMART_ROUTING === 'true';
const ADMIN_ROUTE = process.env.ADMIN_ROUTE || '/admin-login';
const USER_ROUTE = process.env.USER_ROUTE || '/';

console.log(`服务器IP配置: ${SERVER_IP}`);
console.log(`智能路由状态: ${DISABLE_SMART_ROUTING ? '已禁用' : '已启用'}`);

// 获取本机IP地址
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  // 将127.0.0.1和localhost添加到本地地址列表
  addresses.push('127.0.0.1');
  addresses.push('::1'); // IPv6的localhost
  addresses.push('::ffff:127.0.0.1'); // IPv4映射到IPv6的localhost
  
  // 添加本机的所有IP地址
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal) {
        addresses.push(iface.address);
        
        // 对于IPv4地址，添加其IPv6映射形式
        if (iface.family === 'IPv4') {
          addresses.push(`::ffff:${iface.address}`);
        }
      }
    }
  }
  
  // 添加特定的服务器IP
  addresses.push(SERVER_IP);
  addresses.push(`::ffff:${SERVER_IP}`);
  
  return addresses;
}

// 获取客户端真实IP
function getClientIp(req) {
  // 获取X-Forwarded-For头部，可能包含多个IP地址
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // 取第一个IP（最初的客户端IP）
    return forwardedFor.split(',')[0].trim();
  }
  
  // 使用套接字的远程地址
  const socketAddress = req.connection.remoteAddress;
  return socketAddress;
}

// 检查IP是否匹配
function isLocalIp(ip, localIps) {
  if (!ip) return false;
  
  // 直接比较
  if (localIps.includes(ip)) return true;
  
  // 处理IPv6格式的IPv4地址
  if (ip.startsWith('::ffff:')) {
    const ipv4 = ip.substring(7);
    if (localIps.includes(ipv4)) return true;
  }
  
  // 检查是否是特定服务器IP
  if (ip.includes(SERVER_IP)) return true;
  
  return false;
}

// 获取本机IP地址列表
const localIpAddresses = getLocalIpAddresses();
console.log('本机IP地址列表:', localIpAddresses);

// 来源检测中间件
app.use((req, res, next) => {
  // 如果智能路由被禁用，则跳过检测
  if (DISABLE_SMART_ROUTING) {
    return next();
  }
  
  const clientIp = getClientIp(req);
  const isLocal = isLocalIp(clientIp, localIpAddresses);
  
  console.log(`请求来源: ${clientIp}, 路径: ${req.path}, 是否本地访问: ${isLocal}`);
  
  // 如果是直接访问根路径且来源是本机IP
  if (req.path === '/' && isLocal) {
    console.log('检测到来自服务器的访问，重定向到管理员登录页');
    return res.redirect(ADMIN_ROUTE);
  }
  
  next();
});

// 添加一个辅助路由用于调试
app.get('/debug-ip', (req, res) => {
  const clientIp = getClientIp(req);
  const isLocal = isLocalIp(clientIp, localIpAddresses);
  
  res.json({
    clientIp,
    isLocal,
    localIpAddresses,
    serverIp: SERVER_IP,
    smartRoutingEnabled: !DISABLE_SMART_ROUTING,
    adminRoute: ADMIN_ROUTE,
    userRoute: USER_ROUTE,
    referrer: req.headers.referer || 'none',
    userAgent: req.headers['user-agent'] || 'none'
  });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// 所有请求都返回 index.html
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
  console.log(`管理平台访问地址: http://localhost:${port}${ADMIN_ROUTE}`);
  console.log(`树莓派面板访问地址: http://树莓派IP:${port}${USER_ROUTE}`);
  console.log(`调试地址: http://localhost:${port}/debug-ip`);
}); 