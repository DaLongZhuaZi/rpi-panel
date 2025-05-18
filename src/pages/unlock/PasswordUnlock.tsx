import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LockOutlined, 
  UnlockOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined,
  CheckOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const PasswordUnlock: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<'input' | 'verifying' | 'success' | 'error'>('input');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // 检测当前时间以设置深色/浅色模式
  useEffect(() => {
    const checkDarkMode = () => {
      const hour = new Date().getHours();
      setIsDarkMode(hour >= 20 || hour < 6);
    };
    
    checkDarkMode(); // 初始检查
    const timer = setInterval(checkDarkMode, 60000); // 每分钟检查一次
    
    return () => clearInterval(timer);
  }, []);
  
  // 仅防止双指缩放并设置全屏布局
  useEffect(() => {
    // 禁止双指缩放
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // 添加防止缩放的监听器和全屏样式
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    // 添加CSS样式确保全屏显示和防止用户选择文本
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body {
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      html, #root, .App {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // 处理数字按键点击
  const handleDigitClick = (digit: number) => {
    if (password.length < 6 && status === 'input') {
      setPassword(prev => prev + digit);
    }
  };
  
  // 处理删除按键点击
  const handleDelete = () => {
    if (password.length > 0 && status === 'input') {
      setPassword(prev => prev.slice(0, -1));
    }
  };
  
  // 处理提交
  const handleSubmit = () => {
    if (password.length > 0) {
      setStatus('verifying');
      
      // 模拟验证过程
      setTimeout(() => {
        // 示例：密码为 "123456"
        if (password === '123456') {
          setStatus('success');
          // 成功后2秒返回主界面
          setTimeout(() => {
            navigate('/user');
          }, 2000);
        } else {
          setStatus('error');
          // 失败后2秒重置
          setTimeout(() => {
            setStatus('input');
            setPassword('');
          }, 2000);
        }
      }, 1500);
    }
  };
  
  // 计算键盘按钮大小，确保在各种屏幕上都能有合适尺寸
  const getButtonSize = () => {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    // 在较小屏幕上返回较小值，较大屏幕上固定最大值
    return {
      width: `min(14vmin, 4rem)`,
      height: `min(14vmin, 4rem)`
    };
  };
  
  // 动态计算键盘按钮尺寸
  const buttonSize = getButtonSize();
  
  // 数字键盘按钮
  const renderDigitButton = (digit: number) => (
    <button
      key={digit}
      onClick={() => handleDigitClick(digit)}
      disabled={status !== 'input'}
      style={{
        width: buttonSize.width,
        height: buttonSize.height
      }}
      className={`
        flex items-center justify-center rounded-full text-2xl font-medium
        ${isDarkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
        transition-colors duration-200 focus:outline-none disabled:opacity-50
      `}
    >
      {digit}
    </button>
  );
  
  return (
    <div className={`flex flex-col h-full min-h-screen w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* 顶部导航栏 */}
      <div className={`p-3 flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <button
          onClick={() => navigate('/user')}
          className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">密码开锁</h1>
      </div>
      
      {/* 密码输入显示区域 - 使用flex-1确保填充可用空间 */}
      <div className="flex-1 flex flex-col items-center justify-between py-4">
        <div className={`
          w-full max-w-xs p-4 mx-auto mb-4 rounded-lg text-center
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md
        `}>
          {status === 'input' ? (
            <>
              <div className="text-lg mb-3">请输入门禁密码</div>
              <div className="flex justify-center space-x-3 mb-2">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center border
                      ${password.length > index 
                        ? isDarkMode ? 'bg-blue-600 border-blue-600' : 'bg-blue-500 border-blue-500' 
                        : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                      }
                    `}
                  >
                    {password.length > index && '•'}
                  </div>
                ))}
              </div>
            </>
          ) : status === 'verifying' ? (
            <div className="py-6 flex flex-col items-center">
              <LoadingOutlined className="text-4xl mb-3 text-blue-500" />
              <div className="text-lg">验证中...</div>
            </div>
          ) : status === 'success' ? (
            <div className="py-6 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="animate-ping absolute h-16 w-16 rounded-full bg-green-400 opacity-50"></div>
                <div className="relative rounded-full h-16 w-16 flex items-center justify-center bg-green-500">
                  <UnlockOutlined className="text-3xl text-white" />
                </div>
              </div>
              <div className="text-lg font-medium text-green-600 dark:text-green-400">开锁成功！</div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center">
              <div className="relative rounded-full h-16 w-16 flex items-center justify-center bg-red-500 mb-4">
                <LockOutlined className="text-3xl text-white" />
              </div>
              <div className="text-lg font-medium text-red-600 dark:text-red-400">密码错误！</div>
            </div>
          )}
        </div>
        
        {/* 数字键盘 - 使用max-w-xs和mx-auto使其居中且限制宽度 */}
        {(status === 'input' || status === 'verifying') && (
          <div className="w-full max-w-xs mx-auto px-2">
            <div className="grid grid-cols-3 gap-2 place-items-center mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => renderDigitButton(digit))}
            </div>
            <div className="grid grid-cols-3 gap-2 place-items-center">
              <button
                onClick={handleDelete}
                disabled={status !== 'input' || password.length === 0}
                style={{
                  width: buttonSize.width,
                  height: buttonSize.height
                }}
                className={`
                  flex items-center justify-center rounded-full
                  ${isDarkMode 
                    ? 'bg-red-900 text-white hover:bg-red-800' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }
                  transition-colors duration-200 focus:outline-none disabled:opacity-50
                `}
              >
                <DeleteOutlined className="text-xl" />
              </button>
              {renderDigitButton(0)}
              <button
                onClick={handleSubmit}
                disabled={status !== 'input' || password.length === 0}
                style={{
                  width: buttonSize.width,
                  height: buttonSize.height
                }}
                className={`
                  flex items-center justify-center rounded-full
                  ${isDarkMode 
                    ? 'bg-green-900 text-white hover:bg-green-800' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                  }
                  transition-colors duration-200 focus:outline-none disabled:opacity-50
                `}
              >
                <CheckOutlined className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 底部状态栏 */}
      <div className={`p-2 text-center text-sm ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-white'} shadow-inner`}>
        系统状态: 正常运行中
      </div>
    </div>
  );
};

export default PasswordUnlock; 