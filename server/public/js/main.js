// 全局Socket.IO连接
let socket;

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Socket.IO连接
  initSocketConnection();
  
  // 初始化事件监听器
  initEventListeners();
  
  // 初始化面板特定功能
  initPageFeatures();
});

// 初始化Socket.IO连接
function initSocketConnection() {
  // 连接Socket.IO服务器
  socket = io();
  
  // 连接事件
  socket.on('connect', function() {
    console.log('已连接到服务器');
    updateConnectionStatus(true);
  });
  
  // 断开连接事件
  socket.on('disconnect', function() {
    console.log('与服务器断开连接');
    updateConnectionStatus(false);
  });
  
  // 设备连接事件
  socket.on('device-connected', function(device) {
    console.log('设备已连接:', device);
    addDeviceToList(device);
    showNotification(`设备 ${device.name} (${device.deviceId}) 已连接`, 'success');
  });
  
  // 设备断开连接事件
  socket.on('device-disconnected', function(device) {
    console.log('设备已断开连接:', device);
    updateDeviceStatus(device.deviceId, 'offline');
    showNotification(`设备 ${device.deviceId} 已断开连接`, 'warning');
  });
  
  // 设备状态更新事件
  socket.on('device-status', function(data) {
    console.log('设备状态更新:', data);
    updateDeviceData(data);
  });
  
  // 传感器数据更新事件
  socket.on('sensor-update', function(data) {
    console.log('传感器数据更新:', data);
    updateSensorData(data);
  });
  
  // GPIO操作结果事件
  socket.on('gpio-operation-result', function(data) {
    console.log('GPIO操作结果:', data);
    handleGpioResult(data);
  });
  
  // I2C操作结果事件
  socket.on('i2c-operation-result', function(data) {
    console.log('I2C操作结果:', data);
    handleI2cResult(data);
  });
}

// 更新连接状态指示器
function updateConnectionStatus(connected) {
  const statusIndicator = document.getElementById('connection-status');
  if (statusIndicator) {
    if (connected) {
      statusIndicator.className = 'badge badge-success';
      statusIndicator.textContent = '已连接';
    } else {
      statusIndicator.className = 'badge badge-danger';
      statusIndicator.textContent = '断开连接';
    }
  }
}

// 添加设备到列表
function addDeviceToList(device) {
  const devicesList = document.getElementById('devices-list');
  if (!devicesList) return;
  
  // 检查设备是否已在列表中
  const existingDevice = document.getElementById(`device-${device.deviceId}`);
  if (existingDevice) {
    // 更新现有设备状态
    updateDeviceStatus(device.deviceId, 'online');
    return;
  }
  
  // 创建新的设备卡片
  const deviceCard = document.createElement('div');
  deviceCard.className = 'card device-card';
  deviceCard.id = `device-${device.deviceId}`;
  
  deviceCard.innerHTML = `
    <div class="card-header device-card-header">
      <span>${device.name}</span>
      <span class="device-status badge badge-success">在线</span>
    </div>
    <div class="card-body">
      <p><strong>ID:</strong> ${device.deviceId}</p>
      <p><strong>类型:</strong> ${device.type}</p>
      <div class="sensor-data" id="sensor-data-${device.deviceId}">
        <p>等待数据...</p>
      </div>
      <div class="mt-3">
        <a href="/devices/${device.deviceId}" class="btn btn-sm">查看详情</a>
      </div>
    </div>
  `;
  
  devicesList.appendChild(deviceCard);
}

// 更新设备状态
function updateDeviceStatus(deviceId, status) {
  const deviceCard = document.getElementById(`device-${deviceId}`);
  if (!deviceCard) return;
  
  const statusBadge = deviceCard.querySelector('.device-status');
  if (statusBadge) {
    if (status === 'online') {
      statusBadge.className = 'device-status badge badge-success';
      statusBadge.textContent = '在线';
    } else {
      statusBadge.className = 'device-status badge badge-danger';
      statusBadge.textContent = '离线';
    }
  }
}

// 更新设备数据
function updateDeviceData(data) {
  const deviceId = data.deviceId;
  
  // 更新设备状态
  updateDeviceStatus(deviceId, data.status);
  
  // 更新硬件信息
  if (data.hardware) {
    updateHardwareInfo(deviceId, data.hardware);
  }
  
  // 更新GPIO状态
  if (data.gpioPins) {
    updateGpioPins(deviceId, data.gpioPins);
  }
  
  // 更新I2C设备
  if (data.i2cDevices) {
    updateI2cDevices(deviceId, data.i2cDevices);
  }
}

// 更新硬件信息
function updateHardwareInfo(deviceId, hardware) {
  const hardwareInfo = document.getElementById(`hardware-info-${deviceId}`);
  if (!hardwareInfo) return;
  
  hardwareInfo.innerHTML = `
    <p><strong>型号:</strong> ${hardware.model || '未知'}</p>
    <p><strong>CPU温度:</strong> ${hardware.cpuTemp ? hardware.cpuTemp + '°C' : '未知'}</p>
    <p><strong>内存使用:</strong> ${hardware.memoryUsage || '未知'}</p>
    <p><strong>运行时间:</strong> ${hardware.uptime ? hardware.uptime + '小时' : '未知'}</p>
  `;
}

// 更新传感器数据
function updateSensorData(data) {
  const deviceId = data.deviceId;
  const sensorType = data.sensorType;
  const sensorData = data.data;
  
  const sensorContainer = document.getElementById(`sensor-data-${deviceId}`);
  if (!sensorContainer) return;
  
  // 清除"等待数据"消息
  if (sensorContainer.textContent.includes('等待数据')) {
    sensorContainer.innerHTML = '';
  }
  
  // 查找或创建传感器数据条目
  let sensorElement = document.getElementById(`sensor-${deviceId}-${sensorType}`);
  if (!sensorElement) {
    sensorElement = document.createElement('div');
    sensorElement.id = `sensor-${deviceId}-${sensorType}`;
    sensorElement.className = 'sensor-value';
    sensorContainer.appendChild(sensorElement);
  }
  
  // 根据传感器类型格式化数据
  let formattedData = '';
  if (typeof sensorData === 'object') {
    if (sensorData.temperature !== undefined) {
      formattedData += `温度: ${sensorData.temperature.toFixed(1)}°C `;
    }
    if (sensorData.humidity !== undefined) {
      formattedData += `湿度: ${sensorData.humidity.toFixed(1)}% `;
    }
    if (sensorData.pressure !== undefined) {
      formattedData += `气压: ${sensorData.pressure.toFixed(1)}hPa `;
    }
    if (sensorData.light !== undefined) {
      formattedData += `光照: ${sensorData.light.toFixed(1)}lux `;
    }
    if (Object.keys(sensorData).length === 0) {
      formattedData = JSON.stringify(sensorData);
    }
  } else {
    formattedData = String(sensorData);
  }
  
  sensorElement.innerHTML = `
    <div>${sensorType}</div>
    <div class="sensor-label">${formattedData}</div>
  `;
}

// 更新GPIO引脚状态
function updateGpioPins(deviceId, pins) {
  const pinsContainer = document.getElementById(`gpio-pins-${deviceId}`);
  if (!pinsContainer) return;
  
  pinsContainer.innerHTML = '';
  
  pins.forEach(pin => {
    const pinElement = document.createElement('div');
    pinElement.className = 'gpio-pin';
    pinElement.innerHTML = `
      <div class="pin-status ${pin.value ? 'pin-high' : 'pin-low'}"></div>
      <div>
        <strong>${pin.alias || `引脚 ${pin.pin}`}</strong> (${pin.pin})
        <div>模式: ${pin.mode === 'out' ? '输出' : '输入'}, 值: ${pin.value}</div>
      </div>
      <div style="margin-left: auto;">
        ${pin.mode === 'out' ? `
          <button class="btn btn-sm ${pin.value ? 'btn-danger' : 'btn-success'}" 
                  onclick="toggleGpioPin('${deviceId}', ${pin.pin}, ${pin.value ? 0 : 1})">
            ${pin.value ? '设为低电平' : '设为高电平'}
          </button>
        ` : ''}
      </div>
    `;
    pinsContainer.appendChild(pinElement);
  });
  
  if (pins.length === 0) {
    pinsContainer.innerHTML = '<p>没有配置的GPIO引脚</p>';
  }
}

// 更新I2C设备列表
function updateI2cDevices(deviceId, devices) {
  const devicesContainer = document.getElementById(`i2c-devices-${deviceId}`);
  if (!devicesContainer) return;
  
  devicesContainer.innerHTML = '';
  
  devices.forEach(device => {
    const deviceElement = document.createElement('div');
    deviceElement.className = 'i2c-device';
    deviceElement.innerHTML = `
      <div>
        <strong>${device.name || '未知设备'}</strong>
        <span class="i2c-address">地址: ${device.address}</span>
        <span>总线: ${device.busNumber}</span>
      </div>
      <div class="mt-2">
        <button class="btn btn-sm" onclick="readI2cDevice('${deviceId}', ${device.busNumber}, '${device.address}')">
          读取数据
        </button>
      </div>
    `;
    devicesContainer.appendChild(deviceElement);
  });
  
  if (devices.length === 0) {
    devicesContainer.innerHTML = '<p>没有配置的I2C设备</p>';
  }
}

// 显示通知
function showNotification(message, type = 'info') {
  // 查找或创建通知容器
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '1000';
    document.body.appendChild(notificationContainer);
  }
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `card notification ${type}`;
  notification.style.marginBottom = '10px';
  notification.style.minWidth = '200px';
  notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  notification.style.animation = 'fadeIn 0.3s ease-out';
  
  // 设置背景颜色
  switch (type) {
    case 'success':
      notification.style.borderLeft = '4px solid var(--secondary-color)';
      break;
    case 'warning':
      notification.style.borderLeft = '4px solid var(--warning-color)';
      break;
    case 'error':
      notification.style.borderLeft = '4px solid var(--danger-color)';
      break;
    default:
      notification.style.borderLeft = '4px solid var(--primary-color)';
      break;
  }
  
  notification.innerHTML = `
    <div class="card-body" style="padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>${message}</div>
        <button style="background: none; border: none; cursor: pointer; font-size: 18px;" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
      </div>
    </div>
  `;
  
  // 添加到容器中
  notificationContainer.appendChild(notification);
  
  // 自动关闭
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// 处理GPIO操作结果
function handleGpioResult(data) {
  if (data.success) {
    showNotification(`GPIO操作成功: 引脚 ${data.pin}, 命令 ${data.command}`, 'success');
  } else {
    showNotification(`GPIO操作失败: ${data.error}`, 'error');
  }
}

// 处理I2C操作结果
function handleI2cResult(data) {
  if (data.success) {
    showNotification(`I2C操作成功: 总线 ${data.busNumber}, 地址 ${data.address}, 命令 ${data.command}`, 'success');
  } else {
    showNotification(`I2C操作失败: ${data.error}`, 'error');
  }
}

// 初始化页面特定功能
function initPageFeatures() {
  // 根据当前页面初始化特定功能
  const pageId = document.body.getAttribute('data-page');
  
  switch (pageId) {
    case 'dashboard':
      initDashboard();
      break;
    case 'devices':
      initDevicesPage();
      break;
    case 'device-detail':
      initDeviceDetailPage();
      break;
    case 'gpio':
      initGpioPage();
      break;
    case 'i2c':
      initI2cPage();
      break;
  }
}

// 初始化事件监听器
function initEventListeners() {
  // 为所有的切换开关添加事件监听器
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('change', function() {
      const pinId = this.getAttribute('data-pin');
      const value = this.checked ? 1 : 0;
      updateGpioPin(pinId, value);
    });
  });
  
  // 为设备卡片添加点击事件
  document.querySelectorAll('.device-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        const deviceId = this.id.replace('device-', '');
        window.location.href = `/devices/${deviceId}`;
      }
    });
  });
}

// 初始化仪表盘
function initDashboard() {
  console.log('初始化仪表盘...');
  // 这里可以添加仪表盘特定的初始化代码
}

// 初始化设备页面
function initDevicesPage() {
  console.log('初始化设备页面...');
  // 这里可以添加设备页面特定的初始化代码
}

// 初始化设备详情页面
function initDeviceDetailPage() {
  console.log('初始化设备详情页面...');
  
  // 获取设备ID
  const deviceId = document.getElementById('device-detail')?.getAttribute('data-device-id');
  if (!deviceId) return;
  
  // 添加刷新按钮事件
  const refreshBtn = document.getElementById('refresh-device');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      sendCommandToDevice(deviceId, 'system-control', { command: 'update-status' });
    });
  }
  
  // 添加重启设备按钮事件
  const restartBtn = document.getElementById('restart-device');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      if (confirm('确定要重启设备吗?')) {
        sendCommandToDevice(deviceId, 'system-control', { command: 'restart' });
      }
    });
  }
}

// 初始化GPIO页面
function initGpioPage() {
  console.log('初始化GPIO页面...');
  
  // 添加设置GPIO引脚表单提交事件
  const setupForm = document.getElementById('gpio-setup-form');
  if (setupForm) {
    setupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const pin = document.getElementById('gpio-pin').value;
      const mode = document.getElementById('gpio-mode').value;
      const deviceId = document.getElementById('gpio-device').value;
      const initialState = document.getElementById('gpio-initial-state').value;
      const pullUpDown = document.getElementById('gpio-pull').value;
      const alias = document.getElementById('gpio-alias').value;
      
      setupGpioPin(deviceId, pin, mode, initialState, pullUpDown, alias);
    });
  }
}

// 初始化I2C页面
function initI2cPage() {
  console.log('初始化I2C页面...');
  
  // 添加扫描I2C设备按钮事件
  const scanBtn = document.getElementById('scan-i2c');
  if (scanBtn) {
    scanBtn.addEventListener('click', function() {
      const deviceId = document.getElementById('i2c-device').value;
      const busNumber = document.getElementById('i2c-bus').value || 1;
      
      scanI2cBus(deviceId, busNumber);
    });
  }
  
  // 添加配置I2C设备表单提交事件
  const setupForm = document.getElementById('i2c-setup-form');
  if (setupForm) {
    setupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const deviceId = document.getElementById('i2c-device').value;
      const busNumber = document.getElementById('i2c-bus').value;
      const address = document.getElementById('i2c-address').value;
      const deviceType = document.getElementById('i2c-type').value;
      
      setupI2cDevice(deviceId, busNumber, address, deviceType);
    });
  }
}

// ====== API函数 ======

// 向设备发送命令
function sendCommandToDevice(deviceId, command, data) {
  fetch(`/api/devices/${deviceId}/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command, data })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showNotification(`命令已发送到设备: ${command}`, 'success');
      } else {
        showNotification(`发送命令失败: ${data.error}`, 'error');
      }
    })
    .catch(error => {
      showNotification(`发送命令出错: ${error}`, 'error');
    });
}

// 切换GPIO引脚状态
function toggleGpioPin(deviceId, pin, value) {
  sendCommandToDevice(deviceId, 'gpio-control', {
    pin: pin,
    command: 'write',
    value: value
  });
}

// 设置GPIO引脚
function setupGpioPin(deviceId, pin, mode, initialState, pullUpDown, alias) {
  fetch('/api/gpio/pins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pin: parseInt(pin, 10),
      mode,
      initialState: parseInt(initialState, 10),
      pullUpDown,
      alias,
      deviceId
    })
  })
    .then(response => response.json())
    .then(data => {
      showNotification(`GPIO引脚配置成功: ${pin}`, 'success');
      
      // 发送命令到设备
      sendCommandToDevice(deviceId, 'gpio-control', {
        pin: parseInt(pin, 10),
        command: 'setup',
        mode,
        options: {
          initialState: parseInt(initialState, 10),
          pullUpDown,
          alias
        }
      });
    })
    .catch(error => {
      showNotification(`GPIO引脚配置失败: ${error}`, 'error');
    });
}

// 扫描I2C总线
function scanI2cBus(deviceId, busNumber) {
  sendCommandToDevice(deviceId, 'i2c-control', {
    busNumber: parseInt(busNumber, 10),
    command: 'scan'
  });
  
  showNotification(`正在扫描I2C总线 ${busNumber}...`, 'info');
}

// 设置I2C设备
function setupI2cDevice(deviceId, busNumber, address, deviceType) {
  fetch('/api/i2c/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      busNumber: parseInt(busNumber, 10),
      address,
      name: deviceType,
      deviceId
    })
  })
    .then(response => response.json())
    .then(data => {
      showNotification(`I2C设备配置成功: ${address} (${deviceType})`, 'success');
    })
    .catch(error => {
      showNotification(`I2C设备配置失败: ${error}`, 'error');
    });
}

// 读取I2C设备数据
function readI2cDevice(deviceId, busNumber, address) {
  sendCommandToDevice(deviceId, 'i2c-control', {
    busNumber: parseInt(busNumber, 10),
    address,
    command: 'read'
  });
  
  showNotification(`正在读取I2C设备 ${address}...`, 'info');
} 