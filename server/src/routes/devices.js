const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// 获取所有设备
router.get('/', deviceController.getAllDevices);

// 获取特定设备
router.get('/:deviceId', deviceController.getDeviceById);

// 添加新设备
router.post('/', deviceController.addDevice);

// 更新设备信息
router.put('/:deviceId', deviceController.updateDevice);

// 删除设备
router.delete('/:deviceId', deviceController.deleteDevice);

// 获取设备状态
router.get('/:deviceId/status', deviceController.getDeviceStatus);

// 获取设备历史数据
router.get('/:deviceId/history', deviceController.getDeviceHistory);

// 发送命令到设备
router.post('/:deviceId/command', deviceController.sendCommand);

module.exports = router; 