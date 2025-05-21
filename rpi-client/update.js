#!/usr/bin/env node

/**
 * 树莓派端更新脚本
 * 用于从服务器下载并安装更新
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const readline = require('readline');
const { exec } = require('child_process');
const os = require('os');

// 配置
const CONFIG = {
  // 更新服务器地址
  updateServer: process.env.UPDATE_SERVER || 'http://localhost:3000',
  // 本地版本文件路径
  versionFile: path.join(__dirname, 'version.json'),
  // 更新包下载路径
  updatePackage: path.join(os.tmpdir(), 'rpi-update.zip'),
  // 备份文件夹
  backupDir: path.join(os.tmpdir(), 'rpi-backup-' + Date.now()),
  // 应用根目录
  appRoot: __dirname
};

// 命令行参数解析
const args = process.argv.slice(2);
const COMMANDS = {
  CHECK: 'check',
  UPDATE: 'update',
  ROLLBACK: 'rollback',
  HELP: 'help',
  VERSION: 'version'
};

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('Raspberry Pi Control Panel Update Tool');
  console.log('');
  console.log('Usage:');
  console.log('  node update.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  check                Check for updates');
  console.log('  update               Download and install updates');
  console.log('  rollback             Rollback to previous version');
  console.log('  version              Show current version');
  console.log('  help                 Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  UPDATE_SERVER        Update server URL (default: http://localhost:3000)');
  console.log('');
  console.log('Examples:');
  console.log('  node update.js check');
  console.log('  UPDATE_SERVER=http://myserver.com node update.js update');
}

/**
 * 显示当前版本
 */
async function showVersion() {
  try {
    const localVersion = await getLocalVersion();
    console.log('Current Version:', localVersion.version);
    console.log('Release Date:', new Date(localVersion.releaseDate).toLocaleString());
    console.log('Description:', localVersion.description);
  } catch (error) {
    console.error('Failed to get version information:', error.message);
  }
}

/**
 * 获取本地版本信息
 */
async function getLocalVersion() {
  try {
    if (fs.existsSync(CONFIG.versionFile)) {
      const versionData = await fs.promises.readFile(CONFIG.versionFile, 'utf8');
      return JSON.parse(versionData);
    } else {
      // 如果版本文件不存在，返回默认版本信息
      return {
        version: '0.0.0',
        releaseDate: new Date().toISOString(),
        description: 'Unknown version'
      };
    }
  } catch (error) {
    console.error('Error reading local version:', error);
    throw error;
  }
}

/**
 * 检查更新
 */
async function checkForUpdates() {
  try {
    const localVersion = await getLocalVersion();
    console.log('Current Version:', localVersion.version);

    // 请求服务器检查更新
    const response = await axios.get(`${CONFIG.updateServer}/api/update/check`, {
      params: {
        version: localVersion.version
      }
    });

    if (response.data.hasUpdate) {
      console.log('');
      console.log('New version available:', response.data.currentVersion);
      console.log('Release Date:', new Date(response.data.releaseDate).toLocaleString());
      console.log('Description:', response.data.description);
      console.log('');
      console.log('Run "node update.js update" to install the update.');
      return true;
    } else {
      console.log('You are using the latest version.');
      return false;
    }
  } catch (error) {
    console.error('Error checking for updates:', error.message);
    return false;
  }
}

/**
 * 下载更新包
 */
async function downloadUpdate(progressCallback) {
  try {
    // 确保临时目录存在
    ensureDirectoryExists(path.dirname(CONFIG.updatePackage));

    // 下载更新包
    const response = await axios({
      method: 'get',
      url: `${CONFIG.updateServer}/api/update/download`,
      params: {
        type: 'rpi'
      },
      responseType: 'stream',
      onDownloadProgress: progressCallback
    });

    // 写入文件
    const writer = fs.createWriteStream(CONFIG.updatePackage);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading update:', error.message);
    throw error;
  }
}

/**
 * 安装更新
 */
async function installUpdate() {
  try {
    console.log('Installing update...');
    
    // 创建备份
    await createBackup();
    
    // 提取更新包
    console.log('Extracting update package...');
    const zip = new AdmZip(CONFIG.updatePackage);
    zip.extractAllTo(CONFIG.appRoot, true);
    
    console.log('Update installed successfully!');
    
    // 显示新版本信息
    await showVersion();
    
    // 清理更新包
    fs.unlinkSync(CONFIG.updatePackage);
    
    return true;
  } catch (error) {
    console.error('Error installing update:', error.message);
    
    // 尝试回滚
    console.log('Attempting to rollback...');
    await rollback();
    
    return false;
  }
}

/**
 * 创建备份
 */
async function createBackup() {
  try {
    console.log('Creating backup...');
    
    // 确保备份目录存在
    ensureDirectoryExists(CONFIG.backupDir);
    
    // 复制所有文件（除了node_modules和备份相关文件）
    const filesToBackup = await getFilesToBackup(CONFIG.appRoot);
    
    for (const file of filesToBackup) {
      const relativePath = path.relative(CONFIG.appRoot, file);
      const backupPath = path.join(CONFIG.backupDir, relativePath);
      
      // 确保目标目录存在
      ensureDirectoryExists(path.dirname(backupPath));
      
      // 复制文件
      await fs.promises.copyFile(file, backupPath);
    }
    
    console.log(`Backup created at ${CONFIG.backupDir}`);
    
    // 记录备份信息
    const backupInfo = {
      timestamp: Date.now(),
      path: CONFIG.backupDir,
      version: (await getLocalVersion()).version
    };
    
    await fs.promises.writeFile(
      path.join(CONFIG.appRoot, '.last-backup'),
      JSON.stringify(backupInfo, null, 2)
    );
    
    return true;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    throw error;
  }
}

/**
 * 回滚到上一个版本
 */
async function rollback() {
  try {
    // 检查是否存在备份信息
    const backupInfoPath = path.join(CONFIG.appRoot, '.last-backup');
    
    if (!fs.existsSync(backupInfoPath)) {
      console.error('No backup found. Cannot rollback.');
      return false;
    }
    
    // 读取备份信息
    const backupInfo = JSON.parse(await fs.promises.readFile(backupInfoPath, 'utf8'));
    
    if (!fs.existsSync(backupInfo.path)) {
      console.error('Backup directory not found:', backupInfo.path);
      return false;
    }
    
    console.log('Rolling back to version', backupInfo.version);
    
    // 复制备份文件到应用目录
    const backupFiles = await getFilesToBackup(backupInfo.path);
    
    for (const file of backupFiles) {
      const relativePath = path.relative(backupInfo.path, file);
      const restorePath = path.join(CONFIG.appRoot, relativePath);
      
      // 确保目标目录存在
      ensureDirectoryExists(path.dirname(restorePath));
      
      // 复制文件
      await fs.promises.copyFile(file, restorePath);
    }
    
    console.log('Rollback completed successfully!');
    
    return true;
  } catch (error) {
    console.error('Error during rollback:', error.message);
    return false;
  }
}

/**
 * 获取需要备份的文件列表
 */
async function getFilesToBackup(dir) {
  const files = [];
  
  async function scanDir(directory) {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      // 忽略node_modules和临时目录
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await scanDir(dir);
  return files;
}

/**
 * 确保目录存在
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 更新进度显示
 */
function updateProgressBar(progress, total) {
  // 清空当前行
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  
  const barWidth = 40;
  const percent = Math.min(Math.floor((progress / total) * 100), 100);
  const filledWidth = Math.floor((percent / 100) * barWidth);
  
  const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
  
  process.stdout.write(`Downloading update: [${bar}] ${percent}% | ${formatSize(progress)} / ${formatSize(total)}`);
}

/**
 * 格式化文件大小显示
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  else return (bytes / (1024 * 1024 *.1024)).toFixed(2) + ' GB';
}

/**
 * 重启服务
 */
async function restartService() {
  return new Promise((resolve) => {
    console.log('Restarting service...');
    
    // 在生产环境中，这里应该重启相关的系统服务
    exec('pm2 restart rpi-panel || echo "Service restart not available in development mode"', (error) => {
      if (error) {
        console.log('Service restart not available or failed.');
      } else {
        console.log('Service restarted successfully!');
      }
      resolve();
    });
  });
}

/**
 * 主函数
 */
async function main() {
  // 如果没有指定命令，显示帮助
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0].toLowerCase();
  
  switch (command) {
    case COMMANDS.CHECK:
      await checkForUpdates();
      break;
      
    case COMMANDS.UPDATE:
      console.log('Checking for updates...');
      const hasUpdate = await checkForUpdates();
      
      if (hasUpdate) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('Do you want to install this update? (y/n): ', async (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'y') {
            console.log('');
            console.log('Downloading update...');
            
            let lastProgressPercent = 0;
            
            await downloadUpdate((progressEvent) => {
              if (progressEvent.total) {
                updateProgressBar(progressEvent.loaded, progressEvent.total);
                lastProgressPercent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
              }
            });
            
            // 完成下载，换行
            console.log('');
            console.log('Download completed!');
            
            // 安装更新
            const success = await installUpdate();
            
            if (success) {
              // 提示重启服务
              const rl2 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });
              
              rl2.question('Do you want to restart the service now? (y/n): ', async (answer) => {
                rl2.close();
                
                if (answer.toLowerCase() === 'y') {
                  await restartService();
                } else {
                  console.log('Remember to restart the service to apply the update.');
                }
              });
            }
          } else {
            console.log('Update cancelled.');
          }
        });
      }
      break;
      
    case COMMANDS.ROLLBACK:
      await rollback();
      break;
      
    case COMMANDS.VERSION:
      await showVersion();
      break;
      
    case COMMANDS.HELP:
    default:
      showHelp();
      break;
  }
}

// 执行主函数
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 