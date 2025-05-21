const express = require('express');
const router = express.Router();
const gpioController = require('../controllers/gpioController');

// 获取所有配置的GPIO引脚
router.get('/pins', gpioController.getAllPins);

// 获取特定GPIO引脚状态
router.get('/pins/:pin', gpioController.getPinStatus);

// 配置GPIO引脚
router.post('/pins', gpioController.setupPin);

// 更新GPIO引脚值
router.put('/pins/:pin', gpioController.updatePinValue);

// 释放GPIO引脚
router.delete('/pins/:pin', gpioController.releasePin);

// 释放所有GPIO引脚
router.delete('/pins', gpioController.releaseAllPins);

module.exports = router; 