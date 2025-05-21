const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const gpioController = require('../controllers/gpioController');
const i2cController = require('../controllers/i2cController');

// 主仪表盘页面
router.get('/dashboard', (req, res) => {
  const devices = Object.values(deviceController.getOnlineDevices());
  res.render('dashboard', {
    title: '树莓派硬件控制中心',
    devices,
    activeTab: 'dashboard'
  });
});

// 设备管理页面
router.get('/devices', (req, res) => {
  const devices = Object.values(deviceController.getAllDevices());
  res.render('devices', {
    title: '设备管理',
    devices,
    activeTab: 'devices'
  });
});

// 单个设备详情页面
router.get('/devices/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const device = deviceController.getDeviceById({ params: { deviceId } });
  
  if (!device) {
    return res.status(404).render('error', {
      title: '错误',
      message: '设备未找到',
      error: { status: 404 }
    });
  }
  
  res.render('device-detail', {
    title: `设备: ${device.name}`,
    device,
    activeTab: 'devices'
  });
});

// GPIO管理页面
router.get('/gpio', (req, res) => {
  const allPins = gpioController.getAllPins({ query: {} });
  const devices = Object.values(deviceController.getAllDevices());
  
  res.render('gpio', {
    title: 'GPIO管理',
    pins: allPins,
    devices,
    activeTab: 'gpio'
  });
});

// I2C管理页面
router.get('/i2c', (req, res) => {
  const allDevices = i2cController.getAllDevices({ query: {} });
  const devices = Object.values(deviceController.getAllDevices());
  
  res.render('i2c', {
    title: 'I2C管理',
    i2cDevices: allDevices,
    devices,
    activeTab: 'i2c'
  });
});

// 日志查看页面
router.get('/logs', (req, res) => {
  const devices = Object.values(deviceController.getAllDevices());
  
  res.render('logs', {
    title: '日志查看',
    devices,
    activeTab: 'logs',
    settings: {
      logLevel: 'info',
      logRetention: 7,
      logToConsole: true
    }
  });
});

// 设置页面
router.get('/settings', (req, res) => {
  res.render('settings', {
    title: '系统设置',
    activeTab: 'settings',
    settings: {
      systemName: '树莓派管理系统',
      serverPort: process.env.PORT || 3000,
      refreshInterval: 60,
      enableWebsocket: true,
      logLevel: 'info',
      logRetention: 7,
      logToConsole: true
    },
    nodeVersion: process.version,
    osInfo: `${process.platform} ${process.arch}`
  });
});

// 帮助页面
router.get('/help', (req, res) => {
  res.render('help', {
    title: '帮助',
    activeTab: 'help'
  });
});

module.exports = router; 