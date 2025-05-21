const express = require('express');
const router = express.Router();
const i2cController = require('../controllers/i2cController');

// 扫描I2C总线上的设备
router.get('/scan/:bus?', i2cController.scanDevices);

// 获取所有已配置的I2C设备
router.get('/devices', i2cController.getAllDevices);

// 获取特定I2C设备信息
router.get('/devices/:deviceId', i2cController.getDeviceById);

// 添加I2C设备
router.post('/devices', i2cController.addDevice);

// 从特定设备读取数据
router.get('/read/:bus/:address', i2cController.readDevice);

// 向特定设备写入数据
router.post('/write/:bus/:address', i2cController.writeDevice);

// 删除I2C设备配置
router.delete('/devices/:deviceId', i2cController.removeDevice);

// 获取设备历史数据
router.get('/history/:deviceId', i2cController.getDeviceHistory);

module.exports = router; 