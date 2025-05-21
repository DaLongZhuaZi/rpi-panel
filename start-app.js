/**
 * 应用启动脚本
 * 用于确保在启动前所有必要的服务都已经准备好
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查MQTT服务是否运行
function checkMqttService() {
  return new Promise((resolve, reject) => {
    // 在Windows上检查MQTT服务
    if (process.platform === 'win32') {
      exec('netstat -an | findstr "1883"', (error, stdout) => {
        if (error) {
          console.log('MQTT服务未运行，正在启动...');
          resolve(false);
          return;
        }
        
        if (stdout.includes('LISTENING') || stdout.includes('1883')) {
          console.log('MQTT服务已运行');
          resolve(true);
        } else {
          console.log('MQTT服务未运行，正在启动...');
          resolve(false);
        }
      });
    } 
    // 在Linux上检查MQTT服务
    else if (process.platform === 'linux') {
      exec('ps aux | grep mosquitto | grep -v grep', (error, stdout) => {
        if (error || !stdout) {
          console.log('MQTT服务未运行，正在启动...');
          resolve(false);
          return;
        }
        
        console.log('MQTT服务已运行');
        resolve(true);
      });
    } 
    // 其他平台
    else {
      console.log('未知平台，假设MQTT服务已运行');
      resolve(true);
    }
  });
}

// 启动MQTT服务
function startMqttService() {
  return new Promise((resolve, reject) => {
    // 在Windows上启动MQTT服务
    if (process.platform === 'win32') {
      // 检查是否安装了Mosquitto
      const mosquittoPath = path.join('C:', 'Program Files', 'mosquitto', 'mosquitto.exe');
      
      if (fs.existsSync(mosquittoPath)) {
        exec(`"${mosquittoPath}" -v`, (error) => {
          if (error) {
            console.error('启动MQTT服务失败:', error);
            reject(error);
            return;
          }
          
          console.log('MQTT服务启动成功');
          resolve();
        });
      } else {
        console.log('未找到Mosquitto，使用模拟MQTT服务');
        resolve();
      }
    } 
    // 在Linux上启动MQTT服务
    else if (process.platform === 'linux') {
      exec('sudo systemctl start mosquitto', (error) => {
        if (error) {
          console.error('启动MQTT服务失败:', error);
          reject(error);
          return;
        }
        
        console.log('MQTT服务启动成功');
        resolve();
      });
    } 
    // 其他平台
    else {
      console.log('未知平台，跳过MQTT服务启动');
      resolve();
    }
  });
}

// 启动React应用
function startReactApp() {
  return new Promise((resolve, reject) => {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const reactApp = exec(`${npmCommand} start`, { stdio: 'inherit' });
    
    reactApp.stdout.on('data', (data) => {
      console.log(data);
    });
    
    reactApp.stderr.on('data', (data) => {
      console.error(data);
    });
    
    reactApp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`React应用退出，退出码: ${code}`));
        return;
      }
      
      resolve();
    });
  });
}

// 主函数
async function main() {
  try {
    console.log('正在启动应用...');
    
    // 检查MQTT服务
    const mqttRunning = await checkMqttService();
    
    // 如果MQTT服务未运行，则启动它
    if (!mqttRunning) {
      await startMqttService();
    }
    
    // 等待一段时间确保MQTT服务完全启动
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 启动React应用
    console.log('正在启动React应用...');
    await startReactApp();
  } catch (error) {
    console.error('启动应用失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();