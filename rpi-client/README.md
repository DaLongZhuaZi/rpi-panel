# 树莓派硬件控制客户端

这个项目是一个树莓派硬件控制客户端，用于与服务器通信，控制GPIO和I2C设备。

## 功能特点

- 通过Socket.IO与服务器实时通信
- 支持GPIO引脚控制（读取、写入、配置）
- 支持I2C设备操作（扫描、读取、写入）
- 自动上报设备状态和传感器数据
- 支持远程配置和控制
- 断线重连和自动恢复功能
- 完善的日志记录

## 安装

1. 克隆项目到树莓派

```bash
git clone <项目地址>
cd rpi-client
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制`.env.example`为`.env`，并根据实际情况修改配置：

```bash
cp .env.example .env
nano .env
```

## 运行

启动客户端：

```bash
npm start
```

使用开发模式（自动重启）：

```bash
npm run dev
```

**注意：必须在 rpi-client 目录下运行本客户端，否则会报错退出。**

## 硬件接口

### GPIO

客户端支持以下GPIO操作：

- 设置引脚模式（输入/输出）
- 读取引脚状态
- 写入引脚值
- 释放引脚

### I2C

客户端支持以下I2C操作：

- 扫描I2C总线查找设备
- 读取I2C设备数据
- 写入I2C设备数据
- 配置和管理I2C设备

## 服务器通信

客户端通过Socket.IO与服务器建立实时连接，支持以下事件：

- `register`: 向服务器注册设备
- `status-update`: 定期发送设备状态
- `gpio-control`: 接收GPIO控制命令
- `gpio-result`: 发送GPIO操作结果
- `i2c-control`: 接收I2C控制命令
- `i2c-result`: 发送I2C操作结果
- `sensor-data`: 发送传感器数据

## 目录结构

```
rpi-client/
├── src/
│   ├── index.js        # 主入口文件
│   ├── gpio-manager.js # GPIO管理器
│   ├── i2c-manager.js  # I2C管理器
│   └── api-client.js   # API客户端
├── .env                # 环境变量配置
├── package.json        # 项目依赖
└── README.md           # 说明文档
```

## 模拟模式

客户端支持在非树莓派环境中以模拟模式运行，用于开发和测试。在模拟模式下，硬件操作将被模拟而不是实际执行。

## 注意事项

- 确保树莓派已启用I2C接口（使用`raspi-config`）
- 运行客户端需要root权限或将用户添加到gpio/i2c组
- 建议使用PM2等工具管理进程，确保客户端始终运行

## 许可证

ISC 

## 更新日志

### 1.0.1 (2024-06-09)
- 修复启动入口文件路径，`npm start` 现在指向 `src/index.js`，解决找不到模块报错。 