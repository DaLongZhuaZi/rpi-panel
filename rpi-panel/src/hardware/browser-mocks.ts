/**
 * 浏览器环境中的模拟模块
 * 用于模拟 Node.js 核心模块
 */

// 模拟 child_process 模块
export const childProcess = {
  exec: (cmd: string, callback: Function) => {
    console.log('浏览器环境模拟执行命令:', cmd);
    setTimeout(() => callback(null, { stdout: '模拟输出' }), 100);
  }
};

// 模拟 util 模块
export const util = {
  promisify: (fn: Function) => {
    return (...args: any[]) => {
      return new Promise((resolve) => {
        fn(...args, (err: any, result: any) => {
          if (err) {
            console.error('模拟执行错误:', err);
          }
          resolve(result || { stdout: '模拟输出' });
        });
      });
    };
  }
}; 