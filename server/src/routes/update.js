const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { promises: fsPromises } = require('fs');

// 获取当前版本信息
router.get('/version', async (req, res) => {
  try {
    // 读取版本信息文件
    const versionPath = path.join(__dirname, '../../version.json');
    
    if (fs.existsSync(versionPath)) {
      const versionData = await fsPromises.readFile(versionPath, 'utf8');
      const versionInfo = JSON.parse(versionData);
      res.json(versionInfo);
    } else {
      // 如果版本文件不存在，返回默认版本信息
      res.json({
        version: '1.0.0',
        releaseDate: new Date().toISOString(),
        description: 'Initial version'
      });
    }
  } catch (error) {
    console.error('Error getting version info:', error);
    res.status(500).json({ error: 'Failed to get version information' });
  }
});

// 检查更新
router.get('/check', async (req, res) => {
  try {
    const clientVersion = req.query.version;
    const versionPath = path.join(__dirname, '../../version.json');
    
    if (!fs.existsSync(versionPath)) {
      return res.json({ hasUpdate: false });
    }
    
    const versionData = await fsPromises.readFile(versionPath, 'utf8');
    const versionInfo = JSON.parse(versionData);
    
    // 简单的版本比较（实际项目中可能需要更复杂的语义化版本比较）
    const hasUpdate = versionInfo.version !== clientVersion;
    
    res.json({
      hasUpdate,
      currentVersion: versionInfo.version,
      releaseDate: versionInfo.releaseDate,
      description: versionInfo.description
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    res.status(500).json({ error: 'Failed to check for updates' });
  }
});

// 下载更新包
router.get('/download', async (req, res) => {
  try {
    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=rpi-update.zip');
    
    // 创建一个zip压缩流
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });
    
    // 当压缩出错时
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).send('Error creating update package');
    });
    
    // 将压缩流管道连接到响应流
    archive.pipe(res);
    
    // 确定客户端类型（如果有参数）
    const clientType = req.query.type || 'rpi';
    
    // 根据客户端类型选择源文件夹
    let sourceDir;
    if (clientType === 'rpi') {
      sourceDir = path.join(__dirname, '../../rpi-client');
    } else {
      sourceDir = path.join(__dirname, '../../dist');
    }
    
    // 将源文件夹下的所有文件添加到压缩包
    archive.directory(sourceDir, false);
    
    // 添加版本信息文件
    const versionPath = path.join(__dirname, '../../version.json');
    if (fs.existsSync(versionPath)) {
      archive.file(versionPath, { name: 'version.json' });
    }
    
    // 结束压缩流
    await archive.finalize();
  } catch (error) {
    console.error('Error creating update package:', error);
    res.status(500).send('Failed to create update package');
  }
});

// 更新日志
router.get('/changelog', async (req, res) => {
  try {
    const changelogPath = path.join(__dirname, '../../CHANGELOG.md');
    
    if (fs.existsSync(changelogPath)) {
      const changelog = await fsPromises.readFile(changelogPath, 'utf8');
      res.set('Content-Type', 'text/markdown');
      res.send(changelog);
    } else {
      res.status(404).send('Changelog not found');
    }
  } catch (error) {
    console.error('Error getting changelog:', error);
    res.status(500).send('Failed to get changelog');
  }
});

module.exports = router; 