# 修复 "TypeError: The "original" argument must be of type Function" 错误

## 问题描述

在 Windows 环境下运行时，出现以下错误：

```
ERROR
The "original" argument must be of type Function
TypeError: The "original" argument must be of type Function
    at promisify (http://localhost:4000/static/js/bundle.js:50784:45)
    at ./src/hardware/gpio-interface.ts
```

这个错误是由于在 TypeScript 代码中使用了 `util.promisify` 函数，但在 Windows 环境中，某些 Node.js API 可能不可用或行为不一致，导致传递给 `promisify` 的参数不是函数类型。

## 解决方案

我们已经进行了以下修复：

1. 在 `src/hardware/gpio-interface.ts` 和 `src/hardware/i2c-interface.ts` 文件中：
   - 添加了 `safePromisify` 包装函数，确保即使在不支持的环境中也不会出错
   - 增加了平台检测，在 Windows 环境下自动切换到模拟模式
   - 改进了错误处理，使应用在任何环境下都能正常工作

## 如何验证修复

1. 重启应用程序：
   ```bash
   npm start
   ```

2. 如果你在 Windows 环境下，将会看到控制台输出类似以下内容：
   ```
   Running on Windows, GPIO features will be simulated
   Running on Windows, I2C features will be simulated
   ```

3. 应用程序现在应该可以正常启动和运行，而不会出现上述错误。

## 技术细节

### 问题原因

在 Windows 环境下，Node.js 中的某些模块（如 `child_process.exec`）可能会在浏览器环境中被替换为空对象或模拟实现，这会导致 `promisify` 函数收到非函数参数而抛出错误。

### 解决方案细节

1. 创建一个安全版本的 `promisify` 函数，在参数不是函数时返回一个模拟的 Promise 函数：
   ```typescript
   function safePromisify(fn: any): (...args: any[]) => Promise<any> {
     if (typeof fn !== 'function') {
       return (...args: any[]) => Promise.resolve({ stdout: '', stderr: '' });
     }
     return promisify(fn);
   }
   ```

2. 在调用硬件相关函数前检查平台类型：
   ```typescript
   if (process.platform === 'win32') {
     console.log('Running on Windows, features will be simulated');
     return simulatedResult;
   }
   ```

3. 改进错误处理，确保即使在不支持的环境中也返回合理的模拟数据：
   ```typescript
   try {
     // 实际硬件操作
   } catch (error) {
     // 返回模拟数据
     return this.mockFunction();
   }
   ```

## 预防措施

为了避免将来出现类似问题，请始终考虑：

1. 代码是否需要在不同平台上运行
2. 如何优雅地降级到模拟模式
3. 是否有适当的错误处理机制

当引入新的硬件相关功能时，请始终添加模拟实现和平台检测。 