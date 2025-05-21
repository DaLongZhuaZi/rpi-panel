# 树莓派控制面板

一个用于管理和控制树莓派硬件的Web应用程序，包含GPIO控制、I2C通信以及自动更新系统。

## 功能特点

- **硬件控制**：
  - GPIO引脚管理（输入/输出）
  - I2C设备通信
  - 传感器数据读取和显示
  
- **实验室管理**：
  - 门禁控制系统
  - 设备状态监控
  - 实验室环境数据采集
  
- **通信功能**：
  - MQTT协议支持
  - 与服务器端实时数据交互
  
- **跨平台支持**：
  - 树莓派原生硬件支持
  - Windows/Mac环境下的模拟模式
  - 自动平台检测和优雅降级

- **自动更新系统**：
  - 远程版本检查
  - 自动下载和安装更新
  - 版本回滚机制
  - 系统服务集成

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动应用

```bash
npm start
```

### 检查更新

```bash
npm run update:check
```

### 安装更新

```bash
npm run update:install
```

## 开发环境配置

### Windows环境

在Windows环境下，硬件相关功能将自动使用模拟模式运行。无需额外配置，应用会自动检测平台并相应调整行为。

### 树莓派环境

在树莓派上部署时，确保以下条件：

1. 启用I2C和GPIO接口：
   ```bash
   sudo raspi-config
   ```
   进入"Interface Options"并启用I2C和GPIO。

2. 安装必要的系统依赖：
   ```bash
   sudo apt-get update
   sudo apt-get install i2c-tools wiringpi
   ```

## 更新服务设置

在树莓派上设置自动更新服务：

```bash
cd rpi-client
chmod +x setup-update-service.sh
./setup-update-service.sh
```

## 错误排查

如遇到任何问题，请查阅`ERROR-FIX-GUIDE.md`文件获取常见问题的解决方案。

## 版本历史

查看[更新日志](CHANGELOG.md)了解详细的版本更新信息。

## 许可证

ISC 