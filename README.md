# 树莓派硬件控制面板

基于React的树莓派硬件控制面板，用于管理实验室门禁系统、I2C设备和GPIO控制。

## 主要功能

- 实验室门禁管理和授权
- GPIO引脚实时控制与监测
- I2C设备扫描、连接与数据读取
- 系统状态监控与展示

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Ant Design Icons
- React Router DOM

## 硬件支持

- 支持树莓派GPIO引脚控制
- 支持I2C设备连接与数据读取
  - BME280温湿度气压传感器
  - BH1750光照传感器
  - 其他I2C设备可自定义添加

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（端口4000）
npm start

# 构建生产版本
npm run build
```

## 部署到树莓派

1. 构建项目：`npm run build`
2. 将构建产物复制到树莓派：`scp -r build/ pi@your-raspberry-pi-ip:/var/www/html/`
3. 确保树莓派上已安装Nginx或Apache，并配置指向该目录
4. 启用树莓派的I2C和GPIO接口：
   ```bash
   sudo raspi-config
   # 选择 Interfacing Options > I2C > Yes
   # 选择 Interfacing Options > GPIO > Yes
   ```
5. 安装必要的系统组件：
   ```bash
   sudo apt-get update
   sudo apt-get install -y i2c-tools
   sudo apt-get install -y wiringpi   # 或者替代GPIO库
   ```

## 项目结构

- `/src/hardware/` - 硬件接口实现（GPIO、I2C等）
- `/src/services/` - 服务层，提供统一的硬件访问接口
- `/src/pages/` - 页面组件
  - `/pages/HardwareTest.tsx` - 硬件测试面板
- `/src/components/` - 可复用组件
- `/public/` - 静态资源

## 注意事项

- 访问GPIO和I2C接口需要root权限，请确保运行Web服务器的用户有足够权限
- 在生产环境中，建议使用Node.js后端代理硬件访问，而不是直接在浏览器中访问硬件
- 开发模式下会使用模拟数据，无需实际的硬件设备 