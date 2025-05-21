const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// 获取系统日志
router.get('/system', logController.getSystemLogs);

// 获取设备日志
router.get('/device', logController.getDeviceLogs);

// 获取GPIO日志
router.get('/gpio', logController.getGpioLogs);

// 获取I2C日志
router.get('/i2c', logController.getI2cLogs);

// 清除所有日志
router.post('/clear', logController.clearAllLogs);

module.exports = router; 