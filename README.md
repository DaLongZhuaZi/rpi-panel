# RPI-Panel

树莓派控制面板子系统，用于管理和控制实验室设备访问。

## 功能特性

- 用户界面管理
- 访问控制
- 设备监控
- 实验室管理
- 锁控制系统
- 多种解锁方式支持（密码、指纹、蓝牙）

## 系统要求

- 树莓派 4B 或更高版本（推荐至少2GB RAM）
- Raspberry Pi OS Lite 64位版本
- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

## 目录结构

```
rpi-panel/
├── client/             # 前端React应用
├── server/             # 后端Node.js服务
├── scripts/            # 部署和维护脚本
└── docs/              # 文档
```

## 快速开始

请参考 [安装指南](docs/setup.md) 进行系统的初始化和配置。

## 开发指南

1. 克隆仓库
```bash
git clone https://github.com/DaLongZhuaZi/rpi-panel.git
cd rpi-panel
```

2. 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. 启动开发服务器
```bash
# 启动前端开发服务器
cd client
npm start

# 启动后端服务器
cd ../server
npm run dev
```

## 贡献指南

欢迎提交 Pull Request 和 Issue。

## 许可证

MIT License 