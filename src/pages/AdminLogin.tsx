import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LockOutlined, 
  UserOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined,
  CheckOutlined,
  LoadingOutlined
} from '@ant-design/icons';

const AdminLogin: React.FC = () => {
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
  
  // 仅防止双指缩放
  useEffect(() => {
    // 禁止双指缩放
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // 只添加防止缩放的监听器
    document.addEventListener('touchstart', preventZoom, { passive: false });
    
    // 清理函数
    return () => {
      document.removeEventListener('touchstart', preventZoom);
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
        // 验证管理员密码，默认为 "123456"
        if (password === '123456') {
          setStatus('success');
          // 成功后1.5秒跳转到管理员页面
          setTimeout(() => {
            navigate('/admin/');
          }, 1500);
        } else {
          setStatus('error');
          // 失败后2秒重置
          setTimeout(() => {
            setStatus('input');
            setPassword('');
          }, 2000);
        }
      }, 1000);
    }
  };
  
  // 数字键盘按钮
  const renderDigitButton = (digit: number) => (
    <button
      key={digit}
      onClick={() => handleDigitClick(digit)}
      disabled={status !== 'input'}
      className={`
        flex items-center justify-center rounded-full w-16 h-16 text-2xl font-medium
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
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* 顶部导航栏 */}
      <div className={`p-4 flex items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <button
          onClick={() => navigate('/user')}
          className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ArrowLeftOutlined className="text-xl" />
        </button>
        <h1 className="ml-4 text-xl font-semibold">管理员入口</h1>
      </div>
      
      {/* 密码输入显示区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`
          mb-8 w-full max-w-xs p-4 rounded-lg text-center
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md
        `}>
          {status === 'input' ? (
            <>
              <div className="flex justify-center mb-4">
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}
                `}>
                  <UserOutlined className={`text-4xl ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
              </div>
              <div className="text-lg mb-3">请输入管理员密码</div>
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
              <div className="mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-green-500">
                <UserOutlined className="text-3xl text-white" />
              </div>
              <div className="text-lg font-medium text-green-600 dark:text-green-400">验证成功！</div>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                正在进入管理后台...
              </p>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center">
              <div className="mb-4 w-20 h-20 rounded-full flex items-center justify-center bg-red-500">
                <LockOutlined className="text-3xl text-white" />
              </div>
              <div className="text-lg font-medium text-red-600 dark:text-red-400">密码错误！</div>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                请输入正确的管理员密码
              </p>
            </div>
          )}
        </div>
        
        {/* 数字键盘 */}
        {(status === 'input' || status === 'verifying') && (
          <div className="w-full max-w-xs">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => renderDigitButton(digit))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleDelete}
                disabled={status !== 'input' || password.length === 0}
                className={`
                  flex items-center justify-center rounded-full w-16 h-16
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
                className={`
                  flex items-center justify-center rounded-full w-16 h-16
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
      
      {/* 底部信息 */}
      <div className={`p-4 text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        智能物联网实验室门禁系统 &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default AdminLogin; 