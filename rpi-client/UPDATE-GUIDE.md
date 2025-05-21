# 树莓派控制面板更新指南

此文档介绍了如何使用命令行更新工具来更新树莓派控制面板客户端。

## 设置更新服务器

在使用更新工具之前，请确保设置了正确的更新服务器地址。有两种方式可以设置：

1. 环境变量：

```bash
export UPDATE_SERVER=http://your-server-address:3000
```

2. 在更新命令前指定：

```bash
UPDATE_SERVER=http://your-server-address:3000 node update.js check
```

## 命令行工具使用

更新工具提供了以下命令：

### 检查更新

```bash
node update.js check
```

或者使用NPM脚本：

```bash
npm run update:check
```

这将检查服务器上是否有新版本可用，并显示版本信息。

### 执行更新

```bash
node update.js update
```

或者使用NPM脚本：

```bash
npm run update
```

这将检查是否有更新，如果有，会询问是否要安装更新。更新过程会自动创建当前版本的备份。

### 回滚到上一个版本

如果更新后出现问题，可以回滚到上一个版本：

```bash
node update.js rollback
```

### 查看当前版本

要查看当前安装的版本信息：

```bash
node update.js version
```

## 自动更新

如果已经运行了 `setup-update-service.sh` 脚本，系统会每天自动检查更新。

您可以随时手动运行更新检查：

```bash
sudo /usr/local/bin/rpi-panel-update-check
```

## 系统服务管理

如果已经设置了系统服务，可以使用以下命令来管理：

```bash
# 查看服务状态
sudo systemctl status rpi-panel

# 重启服务
sudo systemctl restart rpi-panel

# 停止服务
sudo systemctl stop rpi-panel

# 启动服务
sudo systemctl start rpi-panel

# 查看日志
sudo journalctl -u rpi-panel
```

## 故障排除

1. **更新失败**：如果更新失败，系统会自动尝试回滚到上一个版本。

2. **无法连接到更新服务器**：检查网络连接和更新服务器地址是否正确。

3. **回滚失败**：如果回滚失败，可能需要手动恢复备份。备份位置记录在应用目录下的 `.last-backup` 文件中。

4. **权限问题**：确保应用目录具有正确的权限。

## 更新内容

每次更新的详细内容可以通过以下命令查看：

```bash
curl http://your-server-address:3000/api/update/changelog
``` 