# 树莓派客户端配置指南

## 网络配置

### 服务器地址设置

树莓派客户端需要连接到局域网中的主服务器。默认配置已设置为连接到IP地址`192.168.5.201`，端口`3000`的服务器。如果您的服务器使用不同的IP地址或端口，请修改以下文件：

1. 编辑`.env`文件：
   ```bash
   cd rpi-client
   nano .env
   ```

2. 修改`SERVER_URL`配置项：
   ```
   SERVER_URL=http://您的服务器IP:端口
   ```

3. 保存并退出

### 网络连接测试

部署前，请确保树莓派可以正常访问服务器：

```bash
ping 192.168.5.201
```

如果返回正常响应，说明网络连接正常。

## 部署说明

### 安装依赖

1. 确保树莓派已安装Node.js：
   ```bash
   node -v
   ```
   
   如果未安装，请执行：
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. 安装项目依赖：
   ```bash
   cd rpi-client
   npm install
   ```

### 启动服务

1. 手动启动：
   ```bash
   cd rpi-client
   node src/index.js
   ```

2. 设置开机自启（推荐）：
   ```bash
   chmod +x setup-service.sh
   sudo ./setup-service.sh
   ```

3. 检查服务状态：
   ```bash
   sudo systemctl status rpi-client
   ```

## 常见问题

### 连接被拒绝

如果看到"Connection refused"错误，请检查：
- 服务器IP地址是否正确
- 服务器端的应用是否已启动
- 端口`3000`是否被防火墙阻止

### 找不到设备

如果硬件接口（GPIO、I2C）无法正常工作，请确保：
- 已启用相关接口：`sudo raspi-config`
- 用户有足够权限：`sudo usermod -a -G gpio,i2c $USER`
- 重启树莓派：`sudo reboot`

## 日志查看

客户端日志保存在：
- `rpi-client/client.log`（全部日志）
- `rpi-client/client-error.log`（错误日志）

查看实时日志：
```bash
tail -f rpi-client/client.log
```

## 更新

当服务器IP地址变更时，需要更新配置：

1. 停止服务：
   ```bash
   sudo systemctl stop rpi-client
   ```

2. 更新配置（如前文所述）

3. 重启服务：
   ```bash
   sudo systemctl start rpi-client
   ```

## 调试更新服务

更新检查脚本和日志被存放在用户主目录下，方便检查和调试：

1. 更新检查脚本路径：
   ```
   /home/用户名/rpi-panel-update-check.sh
   ```

2. 更新日志路径：
   ```
   /home/用户名/update-check.log
   ```

3. 手动运行更新检查：
   ```bash
   ~/rpi-panel-update-check.sh
   ```

4. 查看最近的更新记录：
   ```bash
   tail -f ~/update-check.log
   ```

5. 重新配置更新服务（如果需要）：
   ```bash
   cd rpi-client
   sudo ./update.sh
   ``` 