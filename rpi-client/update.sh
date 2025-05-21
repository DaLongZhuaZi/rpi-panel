#!/bin/bash

# 树莓派更新服务配置脚本
# 此脚本用于配置系统级别的更新服务

# 检查是否具有sudo权限
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root. Try 'sudo $0'" 1>&2
   exit 1
fi

# 获取应用路径
APP_PATH=$(pwd)
echo "Installing update service for application at: $APP_PATH"
CURRENT_USER=$(logname)
USER_HOME="/home/$CURRENT_USER"
echo "Current user: $CURRENT_USER, home directory: $USER_HOME"

# 创建更新检查脚本
cat > $USER_HOME/rpi-panel-update-check.sh << EOF
#!/bin/bash
cd $APP_PATH
node update.js check
echo "\$(date): Update check completed" >> $USER_HOME/update-check.log
EOF

# 设置执行权限
chmod +x $USER_HOME/rpi-panel-update-check.sh
chown $CURRENT_USER:$CURRENT_USER $USER_HOME/rpi-panel-update-check.sh

# 创建systemd服务
cat > /etc/systemd/system/rpi-panel.service << EOF
[Unit]
Description=Raspberry Pi Control Panel
After=network.target

[Service]
ExecStart=/usr/bin/node $APP_PATH/index.js
WorkingDirectory=$APP_PATH
Restart=always
User=$CURRENT_USER
Environment=NODE_ENV=production
Environment=UPDATE_SERVER=http://192.168.5.201:3000

[Install]
WantedBy=multi-user.target
EOF

# 创建定时检查更新的服务
cat > /etc/systemd/system/rpi-panel-update-check.service << EOF
[Unit]
Description=Check for Raspberry Pi Control Panel updates
After=network.target

[Service]
Type=oneshot
ExecStart=$USER_HOME/rpi-panel-update-check.sh
User=$CURRENT_USER
Environment=UPDATE_SERVER=http://192.168.5.201:3000
EOF

# 创建定时器
cat > /etc/systemd/system/rpi-panel-update-check.timer << EOF
[Unit]
Description=Run Raspberry Pi Control Panel update check daily

[Timer]
OnBootSec=5min
OnUnitActiveSec=1d
Persistent=true

[Install]
WantedBy=timers.target
EOF

# 重新加载systemd
systemctl daemon-reload

# 启用服务和定时器
systemctl enable rpi-panel.service
systemctl enable rpi-panel-update-check.timer

# 启动服务和定时器
systemctl start rpi-panel.service
systemctl start rpi-panel-update-check.timer

echo "Services installed and started successfully!"
echo "Main service: rpi-panel.service"
echo "Update check: rpi-panel-update-check.timer (runs daily)"
echo "Update script location: $USER_HOME/rpi-panel-update-check.sh"
echo "Update logs: $USER_HOME/update-check.log"
echo ""
echo "Commands:"
echo "  Check status: systemctl status rpi-panel"
echo "  Check logs: journalctl -u rpi-panel"
echo "  Manual update check: $USER_HOME/rpi-panel-update-check.sh"
echo ""
echo "To debug or check for updates:"
echo "  1. Run the update script manually: $USER_HOME/rpi-panel-update-check.sh"
echo "  2. Check the update log: cat $USER_HOME/update-check.log"
echo ""
echo "Note: You should edit /etc/systemd/system/rpi-panel.service and"
echo "      /etc/systemd/system/rpi-panel-update-check.service"
echo "      to set the correct UPDATE_SERVER address." 