const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const path = require('path');
const devicesRouter = require('./routes/devices');
const gpioRouter = require('./routes/gpio');
const i2cRouter = require('./routes/i2c');
const logsRouter = require('./routes/logs');
const dashboardRouter = require('./routes/dashboard');
const updateRouter = require('./routes/update');
const deviceController = require('./controllers/deviceController');
const logController = require('./controllers/logController');

// 加载环境变量
dotenv.config();

// 创建日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// 初始化Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置静态文件目录
app.use(express.static(path.join(__dirname, '../public')));

// 设置视图引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  logController.addSystemLog('info', `${req.method} ${req.url}`);
  next();
});

// 将io对象传递给路由使用
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API路由
app.use('/api/devices', devicesRouter);
app.use('/api/gpio', gpioRouter);
app.use('/api/i2c', i2cRouter);
app.use('/api/logs', logsRouter);
app.use('/api/update', updateRouter);

// Web界面路由
app.use('/', dashboardRouter);

// 根路由 - 重定向到仪表盘
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// WebSocket处理
io.on('connection', (socket) => {
  logger.info(`客户端连接: ${socket.id}`);
  logController.addSystemLog('info', `客户端连接: ${socket.id}`);
  
  // 设备注册
  socket.on('register', (data) => {
    deviceController.registerDevice(socket.id, data);
    logger.info(`设备注册: ${data.deviceId || 'unknown'}`);
    logController.addDeviceLog(data.deviceId, 'info', `设备已注册: ${data.name || data.deviceId}`);
    
    // 广播新设备加入
    io.emit('device-connected', {
      deviceId: data.deviceId,
      name: data.name,
      type: data.type,
      status: 'online',
      timestamp: Date.now()
    });
  });
  
  // 硬件状态更新
  socket.on('status-update', (data) => {
    deviceController.updateDeviceStatus(socket.id, data);
    logController.addDeviceLog(data.deviceId, 'info', `状态已更新: ${JSON.stringify(data.status || {})}`);
    
    // 广播状态更新给所有客户端
    io.emit('device-status', {
      deviceId: data.deviceId,
      status: data.status,
      hardware: data.hardware,
      gpioPins: data.gpioPins,
      i2cDevices: data.i2cDevices,
      timestamp: Date.now()
    });
  });
  
  // 传感器数据更新
  socket.on('sensor-data', (data) => {
    deviceController.recordSensorData(data);
    logController.addDeviceLog(data.deviceId, 'info', `传感器数据已更新: ${data.sensorType}`);
    
    // 广播传感器数据给所有客户端
    io.emit('sensor-update', {
      deviceId: data.deviceId,
      sensorType: data.sensorType,
      data: data.data,
      timestamp: Date.now()
    });
  });
  
  // GPIO操作结果
  socket.on('gpio-result', (data) => {
    logController.addGpioLog(data.success ? 'info' : 'error', 
      `GPIO操作${data.success ? '成功' : '失败'}: 引脚 ${data.pin}, 命令 ${data.command}, ${data.error || ''}`);
    io.emit('gpio-operation-result', data);
  });
  
  // I2C操作结果
  socket.on('i2c-result', (data) => {
    logController.addI2cLog(data.success ? 'info' : 'error', 
      `I2C操作${data.success ? '成功' : '失败'}: 总线 ${data.busNumber}, 地址 ${data.address}, 命令 ${data.command}, ${data.error || ''}`);
    io.emit('i2c-operation-result', data);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    const deviceId = deviceController.getDeviceIdBySocketId(socket.id);
    
    if (deviceId) {
      // 广播设备离线消息
      io.emit('device-disconnected', {
        deviceId,
        status: 'offline',
        timestamp: Date.now()
      });
      
      logController.addDeviceLog(deviceId, 'warn', `设备已断开连接`);
    }
    
    deviceController.removeDevice(socket.id);
    logger.info(`客户端断开连接: ${socket.id}`);
    logController.addSystemLog('info', `客户端断开连接: ${socket.id}`);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`服务器运行在 http://0.0.0.0:${PORT}`);
  logController.addSystemLog('info', `服务器启动成功，监听端口 ${PORT}`);
}); 