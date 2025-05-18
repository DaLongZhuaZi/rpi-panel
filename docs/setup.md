# RPI-Panel 安装指南

本文档详细说明了如何在树莓派上安装和配置RPI-Panel系统。

## 一、准备工作

### 1.1 硬件准备
- 树莓派 4B 或更高版本（推荐至少2GB RAM）
- 至少16GB的高速microSD卡
- 电源适配器（建议使用官方电源）
- 显示屏（支持触摸功能更佳）
- 键盘和鼠标（初始设置时需要）
- 网线或WiFi连接

### 1.2 系统准备
- 下载最新版本的树莓派OS（推荐Raspberry Pi OS Lite 64位版本）
- 使用Raspberry Pi Imager将系统烧录到SD卡
- 启用SSH（在烧录时可通过Imager的高级选项设置）

## 二、基础系统配置

### 2.1 初始化系统
```bash
# 更新系统包
sudo apt update
sudo apt upgrade -y

# 设置地区和时区
sudo raspi-config
# 选择 Localisation Options -> Change Locale -> 选择zh_CN.UTF-8
# 选择 Localisation Options -> Change Timezone -> 选择Asia -> Shanghai
```

### 2.2 安装必要依赖
```bash
# 安装Node.js和npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v

# 安装Git和其他必要工具
sudo apt install -y git build-essential
```

## 三、安装RPI-Panel

### 3.1 克隆代码仓库
```bash
# 创建应用目录
mkdir -p /home/pi/apps
cd /home/pi/apps

# 克隆rpi-panel仓库
git clone https://github.com/DaLongZhuaZi/rpi-panel.git
cd rpi-panel
```

### 3.2 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install

# 安装PM2进程管理器
sudo npm install -g pm2
```

### 3.3 配置环境变量
```bash
# 创建环境配置文件
cp .env.example .env

# 编辑环境配置
nano .env
```

## 四、启动服务

### 4.1 启动后端服务
```bash
# 进入后端目录
cd /home/pi/apps/rpi-panel/server

# 启动服务
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4.2 启动前端服务
```bash
# 进入前端目录
cd /home/pi/apps/rpi-panel/client

# 构建生产版本
npm run build

# 启动服务
pm2 serve build 3000 --name "rpi-panel-client"
```

## 五、配置自动启动

### 5.1 配置浏览器自动启动
```bash
# 安装必要组件
sudo apt install -y chromium-browser xserver-xorg x11-xserver-utils xinit

# 创建自启动脚本
mkdir -p /home/pi/.config/autostart
cat > /home/pi/.config/autostart/kiosk.desktop << EOL
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost:3000
EOL

# 设置权限
chmod +x /home/pi/.config/autostart/kiosk.desktop
```

## 六、验证安装

1. 访问Web界面：http://localhost:3000
2. 检查服务状态：`pm2 status`
3. 检查日志：`pm2 logs`

## 七、故障排除

### 常见问题

1. 服务无法启动
   - 检查端口是否被占用
   - 检查日志：`pm2 logs`
   - 确认Node.js版本兼容性

2. 前端无法访问
   - 确认3000端口是否开放
   - 检查防火墙设置
   - 验证构建是否成功

3. 硬件接口不工作
   - 检查GPIO权限
   - 确认硬件连接正确
   - 查看系统日志

### 获取帮助

如果遇到无法解决的问题，请：

1. 检查系统日志：`sudo journalctl -xe`
2. 收集PM2日志：`pm2 logs`
3. 提交Issue到GitHub仓库
4. 联系技术支持团队

## 八、维护指南

### 系统更新
```bash
# 更新代码
cd /home/pi/apps/rpi-panel
git pull

# 更新依赖
cd client && npm install
cd ../server && npm install

# 重新构建前端
cd ../client
npm run build

# 重启服务
pm2 restart all
```

### 备份
```bash
# 备份数据
cp -r /home/pi/apps/rpi-panel/server/data /home/pi/backups/rpi-panel-data-$(date +%Y%m%d)

# 备份配置
cp /home/pi/apps/rpi-panel/.env /home/pi/backups/rpi-panel-env-$(date +%Y%m%d)
``` 