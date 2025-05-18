import React, { useState } from 'react';
import { 
  LockOutlined, 
  CheckOutlined, 
  CloseOutlined,
  UserOutlined,
  LoadingOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';

const AccessControl: React.FC = () => {
  // 创建图标组件变量
  const LockIcon = () => <LockOutlined />;
  const CheckIcon = () => <CheckOutlined />;
  const CloseIcon = () => <CloseOutlined />;
  const UserIcon = () => <UserOutlined />;
  const LoadingIcon = () => <LoadingOutlined />;
  const InfoCircleIcon = () => <InfoCircleOutlined />;

  const [passcode, setPasscode] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [authMethod, setAuthMethod] = useState<'passcode' | 'fingerprint' | 'bluetooth' | 'remote'>('passcode');
  const [accessHistory, setAccessHistory] = useState<{time: string; user: string; method: string; success: boolean}[]>([
    { time: '2025-04-23 13:42', user: '张三', method: '密码', success: true },
    { time: '2025-04-23 12:15', user: '李四', method: '指纹', success: true },
    { time: '2025-04-23 10:30', user: '访客用户', method: '远程', success: true },
    { time: '2025-04-23 09:45', user: '未知', method: '密码', success: false },
  ]);

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  };

  const handlePasscodeSubmit = async () => {
    setStatus('processing');
    
    // 模拟API请求验证密码
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 示例: 假设正确密码为 "123456"
      if (passcode === '123456') {
        setStatus('success');
        // 模拟开门操作
        console.log('门已开启');
        // 添加访问记录
        setAccessHistory(prev => [
          { time: new Date().toLocaleString('zh-CN'), user: '当前用户', method: '密码', success: true },
          ...prev
        ]);
      } else {
        setStatus('error');
        // 添加失败记录
        setAccessHistory(prev => [
          { time: new Date().toLocaleString('zh-CN'), user: '未知', method: '密码', success: false },
          ...prev
        ]);
      }
      
      // 重置状态
      setTimeout(() => {
        setStatus('idle');
        setPasscode('');
      }, 2000);
    } catch (error) {
      console.error('验证密码时出错:', error);
      setStatus('error');
    }
  };

  const handleFingerprint = () => {
    setAuthMethod('fingerprint');
    setStatus('processing');
    
    // 模拟指纹验证
    setTimeout(() => {
      setStatus('success');
      // 添加访问记录
      setAccessHistory(prev => [
        { time: new Date().toLocaleString('zh-CN'), user: '指纹用户', method: '指纹', success: true },
        ...prev
      ]);
      
      // 重置状态
      setTimeout(() => {
        setStatus('idle');
        setAuthMethod('passcode');
      }, 2000);
    }, 2000);
  };

  const handleBluetooth = () => {
    setAuthMethod('bluetooth');
    setStatus('processing');
    
    // 模拟蓝牙验证
    setTimeout(() => {
      setStatus('success');
      // 添加访问记录
      setAccessHistory(prev => [
        { time: new Date().toLocaleString('zh-CN'), user: '蓝牙用户', method: '蓝牙', success: true },
        ...prev
      ]);
      
      // 重置状态
      setTimeout(() => {
        setStatus('idle');
        setAuthMethod('passcode');
      }, 2000);
    }, 2000);
  };

  const handleRemote = () => {
    setAuthMethod('remote');
    setStatus('processing');
    
    // 模拟远程验证
    setTimeout(() => {
      setStatus('success');
      // 添加访问记录
      setAccessHistory(prev => [
        { time: new Date().toLocaleString('zh-CN'), user: '远程用户', method: '远程', success: true },
        ...prev
      ]);
      
      // 重置状态
      setTimeout(() => {
        setStatus('idle');
        setAuthMethod('passcode');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      {/* 访问控制区 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">门禁控制</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* 密码输入区 */}
          <div className={`border rounded-lg p-4 ${
            status === 'success' ? 'border-green-500 bg-green-50' :
            status === 'error' ? 'border-red-500 bg-red-50' :
            status === 'processing' ? 'border-blue-500 bg-blue-50' :
            'border-gray-200'
          }`}>
            <h3 className="text-base md:text-lg font-medium mb-3 flex items-center">
              <LockIcon />
              <span className="ml-2">密码验证</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                  请输入门禁密码
                </label>
                <input
                  type="password"
                  id="passcode"
                  value={passcode}
                  onChange={handlePasscodeChange}
                  placeholder="请输入6位密码"
                  disabled={status === 'processing' || authMethod !== 'passcode'}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none text-base ${
                    status === 'error' ? 'border-red-500' :
                    status === 'success' ? 'border-green-500' :
                    'focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50'
                  }`}
                />
              </div>
              
              <button
                onClick={handlePasscodeSubmit}
                disabled={passcode.length === 0 || status === 'processing' || authMethod !== 'passcode'}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                  status === 'processing' || passcode.length === 0 || authMethod !== 'passcode'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {status === 'processing' && authMethod === 'passcode' ? (
                  <>
                    <LoadingIcon />
                    <span className="ml-2">验证中...</span>
                  </>
                ) : status === 'success' ? (
                  <>
                    <CheckIcon />
                    <span className="ml-2">验证成功</span>
                  </>
                ) : status === 'error' ? (
                  <>
                    <CloseIcon />
                    <span className="ml-2">验证失败</span>
                  </>
                ) : (
                  '验证'
                )}
              </button>
            </div>
          </div>
          
          {/* 其他验证方式 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-base md:text-lg font-medium mb-3">其他验证方式</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleFingerprint}
                disabled={status === 'processing'}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                  authMethod === 'fingerprint' && status === 'processing'
                    ? 'bg-blue-50 border-blue-500'
                    : authMethod === 'fingerprint' && status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl md:text-3xl mb-1">👆</div>
                <span className="text-xs md:text-sm">指纹验证</span>
                {authMethod === 'fingerprint' && status === 'processing' && (
                  <LoadingIcon />
                )}
                {authMethod === 'fingerprint' && status === 'success' && (
                  <CheckIcon />
                )}
              </button>
              
              <button
                onClick={handleBluetooth}
                disabled={status === 'processing'}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                  authMethod === 'bluetooth' && status === 'processing'
                    ? 'bg-blue-50 border-blue-500'
                    : authMethod === 'bluetooth' && status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl md:text-3xl mb-1">📱</div>
                <span className="text-xs md:text-sm">蓝牙验证</span>
                {authMethod === 'bluetooth' && status === 'processing' && (
                  <LoadingIcon />
                )}
                {authMethod === 'bluetooth' && status === 'success' && (
                  <CheckIcon />
                )}
              </button>
              
              <button
                onClick={handleRemote}
                disabled={status === 'processing'}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                  authMethod === 'remote' && status === 'processing'
                    ? 'bg-blue-50 border-blue-500'
                    : authMethod === 'remote' && status === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl md:text-3xl mb-1">🔑</div>
                <span className="text-xs md:text-sm">远程开门</span>
                {authMethod === 'remote' && status === 'processing' && (
                  <LoadingIcon />
                )}
                {authMethod === 'remote' && status === 'success' && (
                  <CheckIcon />
                )}
              </button>
              
              <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed">
                <div className="text-2xl md:text-3xl mb-1">➕</div>
                <span className="text-xs md:text-sm">添加方式</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 门锁控制状态 */}
        <div className="mt-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base font-medium mb-2">门锁状态</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500">当前状态</div>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mr-1 md:mr-2"></div>
                <span className="text-sm md:text-base font-medium">已锁定</span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500">电池电量</div>
              <div className="text-sm md:text-base font-medium mt-1">85%</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500">今日开门</div>
              <div className="text-sm md:text-base font-medium mt-1">6次</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xs md:text-sm text-gray-500">上次开门</div>
              <div className="text-sm md:text-base font-medium mt-1">12:45</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 访问记录区 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">最近访问记录</h2>
        
        {accessHistory.length > 0 ? (
          <div className="space-y-3">
            {accessHistory.slice(0, 4).map((record, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  record.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <UserIcon />
                    <span className="ml-1 md:ml-2 text-sm md:text-base font-medium">{record.user}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    record.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {record.success ? '成功' : '失败'}
                  </span>
                </div>
                <div className="mt-1 text-xs md:text-sm text-gray-500">
                  <div>时间: {record.time}</div>
                  <div>方式: {record.method}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <InfoCircleIcon />
            <p className="mt-2 text-gray-500">暂无访问记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessControl; 