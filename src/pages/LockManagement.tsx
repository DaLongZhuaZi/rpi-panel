import React, { useState, useEffect, FormEventHandler } from 'react';
import { 
  LockOutlined,
  KeyOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
  WifiOutlined,
  ApiOutlined
} from '@ant-design/icons';

interface Lock {
  id: number;
  name: string;
  deviceId: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel: number;
  isLocked: boolean;
  lastActivity?: string;
  firmwareVersion?: string;
  assignedLab?: string;
}

const LockManagement: React.FC = () => {
  const [locks, setLocks] = useState<Lock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 编辑门锁表单状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLock, setCurrentLock] = useState<Lock | null>(null);
  const [formData, setFormData] = useState<Omit<Lock, 'id' | 'status' | 'batteryLevel' | 'isLocked'>>({
    name: '',
    deviceId: '',
    location: '',
    lastActivity: undefined,
    firmwareVersion: '1.0.0',
    assignedLab: undefined
  });

  useEffect(() => {
    fetchLocks();
  }, []);

  const fetchLocks = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data: Lock[] = [
        { id: 1, name: '门锁-A201', deviceId: 'LOCK-001', location: '教学楼A区 201', status: 'online', batteryLevel: 85, isLocked: true, lastActivity: '2023-11-15 14:30:22', firmwareVersion: '1.2.3', assignedLab: '物理实验室 A' },
        { id: 2, name: '门锁-B102', deviceId: 'LOCK-002', location: '教学楼B区 102', status: 'online', batteryLevel: 90, isLocked: true, lastActivity: '2023-11-15 15:10:45', firmwareVersion: '1.2.3', assignedLab: '化学实验室 B' },
        { id: 3, name: '门锁-C203', deviceId: 'LOCK-003', location: '教学楼C区 203', status: 'online', batteryLevel: 75, isLocked: false, lastActivity: '2023-11-15 13:55:30', firmwareVersion: '1.2.2', assignedLab: '物理实验室 B' },
        { id: 4, name: '门锁-D101', deviceId: 'LOCK-004', location: '教学楼D区 101', status: 'offline', batteryLevel: 60, isLocked: true, lastActivity: '2023-11-14 18:22:10', firmwareVersion: '1.2.1' },
        { id: 5, name: '门锁-E205', deviceId: 'LOCK-005', location: '教学楼E区 205', status: 'online', batteryLevel: 95, isLocked: true, lastActivity: '2023-11-15 16:05:12', firmwareVersion: '1.2.3' },
      ];
      
      setLocks(data);
      setError(null);
    } catch (err) {
      setError('获取门锁信息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLocks();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredLocks = locks.filter(lock => 
    lock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lock.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lock.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (lock?: Lock) => {
    if (lock) {
      setCurrentLock(lock);
      setFormData({
        name: lock.name,
        deviceId: lock.deviceId,
        location: lock.location,
        lastActivity: lock.lastActivity,
        firmwareVersion: lock.firmwareVersion,
        assignedLab: lock.assignedLab
      });
    } else {
      setCurrentLock(null);
      setFormData({
        name: '',
        deviceId: '',
        location: '',
        lastActivity: undefined,
        firmwareVersion: '1.0.0',
        assignedLab: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // 模拟保存逻辑
    if (currentLock) {
      // 编辑现有门锁
      setLocks(prev => 
        prev.map(lock => 
          lock.id === currentLock.id ? { 
            ...lock, 
            ...formData 
          } : lock
        )
      );
    } else {
      // 添加新门锁
      const newLock: Lock = {
        id: Math.max(0, ...locks.map(lock => lock.id)) + 1,
        ...formData,
        status: 'offline', // 新添加的门锁默认为离线状态
        batteryLevel: 100, // 新门锁电池电量默认为100%
        isLocked: true // 新门锁默认为锁定状态
      };
      setLocks(prev => [...prev, newLock]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    // 模拟删除逻辑
    setLocks(prev => prev.filter(lock => lock.id !== id));
  };

  const handleToggleLock = (id: number) => {
    // 模拟开关锁逻辑
    setLocks(prev => 
      prev.map(lock => 
        lock.id === id ? { ...lock, isLocked: !lock.isLocked } : lock
      )
    );
  };

  const getStatusColor = (status: Lock['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Lock['status']) => {
    switch (status) {
      case 'online':
        return '在线';
      case 'offline':
        return '离线';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-0">门锁管理</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="搜索门锁名称、ID或位置..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={handleSearch}
            />
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <ReloadOutlined />
            <span className="ml-1">刷新</span>
          </button>
          
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            <PlusOutlined />
            <span className="ml-1">添加门锁</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <DeleteOutlined className="text-red-500 text-2xl" />
          <p className="mt-2 text-red-600">{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            重试
          </button>
        </div>
      ) : filteredLocks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <LockOutlined className="text-gray-400 text-3xl" />
          <p className="mt-2 text-gray-500">未找到门锁</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">门锁信息</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电池电量</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">绑定实验室</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最近活动</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">控制</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocks.map(lock => (
                <tr key={lock.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <KeyOutlined className="text-primary mr-2" />
                        <div className="font-medium">{lock.name}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>ID: {lock.deviceId}</div>
                        <div>位置: {lock.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`mr-2 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lock.status)}`}>
                        <WifiOutlined className="mr-1" />
                        {getStatusText(lock.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded h-2 mr-2">
                        <div 
                          className={`h-full rounded ${getBatteryColor(lock.batteryLevel)}`} 
                          style={{ width: `${lock.batteryLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{lock.batteryLevel}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lock.assignedLab ? (
                      <div className="text-blue-600">{lock.assignedLab}</div>
                    ) : (
                      <span className="text-gray-400">未绑定</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      {lock.lastActivity || '无记录'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleLock(lock.id)}
                      disabled={lock.status !== 'online'}
                      className={`flex items-center px-2 py-1 rounded text-sm ${
                        lock.status !== 'online'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : lock.isLocked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {lock.isLocked ? (
                        <>
                          <LockOutlined className="mr-1" />
                          已锁定
                        </>
                      ) : (
                        <>
                          <UnlockOutlined className="mr-1" />
                          已解锁
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(lock)}
                        className="text-blue-600 hover:text-blue-800"
                        title="编辑"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(lock.id)}
                        className="text-red-600 hover:text-red-800"
                        title="删除"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加/编辑门锁的模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {currentLock ? '编辑门锁' : '添加门锁'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  门锁名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  设备ID
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  位置
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  固件版本
                </label>
                <input
                  type="text"
                  name="firmwareVersion"
                  value={formData.firmwareVersion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  关联实验室
                </label>
                <input
                  type="text"
                  name="assignedLab"
                  value={formData.assignedLab || ''}
                  onChange={handleInputChange}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">注意：建议在实验室管理中关联门锁</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockManagement; 