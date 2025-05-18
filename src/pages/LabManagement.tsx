import React, { useState, useEffect } from 'react';
import { 
  ExperimentOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  LockOutlined
} from '@ant-design/icons';

interface Lab {
  id: number;
  name: string;
  location: string;
  capacity: number;
  equipment: string;
  status: 'active' | 'maintenance' | 'inactive';
  lockId?: number;
  lockName?: string;
}

interface Lock {
  id: number;
  name: string;
  deviceId: string;
  status: 'online' | 'offline' | 'error';
  batteryLevel: number;
  isLocked: boolean;
}

const LabManagement: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [availableLocks, setAvailableLocks] = useState<Lock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 编辑实验室表单状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLab, setCurrentLab] = useState<Lab | null>(null);
  const [formData, setFormData] = useState<Omit<Lab, 'id'>>({
    name: '',
    location: '',
    capacity: 0,
    equipment: '',
    status: 'active',
    lockId: undefined,
    lockName: undefined
  });

  useEffect(() => {
    fetchLabs();
    fetchAvailableLocks();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data: Lab[] = [
        { id: 1, name: '物理实验室 A', location: '教学楼A区 201', capacity: 30, equipment: '光学器材、测量仪', status: 'active', lockId: 1, lockName: '门锁-A201' },
        { id: 2, name: '化学实验室 B', location: '教学楼B区 102', capacity: 25, equipment: '化学试剂、燃烧器、通风柜', status: 'active', lockId: 2, lockName: '门锁-B102' },
        { id: 3, name: '生物实验室 C', location: '教学楼A区 305', capacity: 35, equipment: '显微镜、培养皿', status: 'maintenance' },
        { id: 4, name: '物理实验室 B', location: '教学楼C区 203', capacity: 40, equipment: '电子设备、测量工具', status: 'active', lockId: 3, lockName: '门锁-C203' },
        { id: 5, name: '计算机实验室', location: '教学楼D区 401', capacity: 50, equipment: '计算机40台、投影仪', status: 'active' },
        { id: 6, name: '电子实验室', location: '教学楼B区 305', capacity: 30, equipment: '电子元器件、焊接设备', status: 'inactive' },
      ];
      
      setLabs(data);
      setError(null);
    } catch (err) {
      setError('获取实验室信息失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLocks = async () => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data: Lock[] = [
        { id: 1, name: '门锁-A201', deviceId: 'LOCK-001', status: 'online', batteryLevel: 85, isLocked: true },
        { id: 2, name: '门锁-B102', deviceId: 'LOCK-002', status: 'online', batteryLevel: 90, isLocked: true },
        { id: 3, name: '门锁-C203', deviceId: 'LOCK-003', status: 'online', batteryLevel: 75, isLocked: false },
        { id: 4, name: '门锁-D101', deviceId: 'LOCK-004', status: 'offline', batteryLevel: 60, isLocked: true },
        { id: 5, name: '门锁-E205', deviceId: 'LOCK-005', status: 'online', batteryLevel: 95, isLocked: true },
      ];
      
      setAvailableLocks(data);
    } catch (err) {
      console.error('获取可用门锁失败', err);
    }
  };

  const handleRefresh = () => {
    fetchLabs();
    fetchAvailableLocks();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lab.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (lab?: Lab) => {
    if (lab) {
      setCurrentLab(lab);
      setFormData({
        name: lab.name,
        location: lab.location,
        capacity: lab.capacity,
        equipment: lab.equipment,
        status: lab.status,
        lockId: lab.lockId,
        lockName: lab.lockName
      });
    } else {
      setCurrentLab(null);
      setFormData({
        name: '',
        location: '',
        capacity: 0,
        equipment: '',
        status: 'active',
        lockId: undefined,
        lockName: undefined
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value
    }));
  };

  const handleLockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lockId = parseInt(e.target.value);
    if (lockId === 0) {
      setFormData(prev => ({
        ...prev,
        lockId: undefined,
        lockName: undefined
      }));
    } else {
      const selectedLock = availableLocks.find(lock => lock.id === lockId);
      setFormData(prev => ({
        ...prev,
        lockId,
        lockName: selectedLock?.name
      }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    // 模拟保存逻辑
    if (currentLab) {
      // 编辑现有实验室
      setLabs(prev => 
        prev.map(lab => 
          lab.id === currentLab.id ? { ...lab, ...formData } : lab
        )
      );
    } else {
      // 添加新实验室
      const newLab: Lab = {
        id: Math.max(0, ...labs.map(lab => lab.id)) + 1,
        ...formData
      };
      setLabs(prev => [...prev, newLab]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    // 模拟删除逻辑
    setLabs(prev => prev.filter(lab => lab.id !== id));
  };

  const getStatusColor = (status: Lab['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Lab['status']) => {
    switch (status) {
      case 'active':
        return '正常使用';
      case 'maintenance':
        return '维护中';
      case 'inactive':
        return '已停用';
      default:
        return '未知';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-0">实验室管理</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="搜索实验室名称或位置..."
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
            <span className="ml-1">添加实验室</span>
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
      ) : filteredLabs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <ExperimentOutlined className="text-gray-400 text-3xl" />
          <p className="mt-2 text-gray-500">未找到实验室</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实验室名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">门锁</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLabs.map(lab => (
                <tr key={lab.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <ExperimentOutlined className="text-primary mr-2" />
                      <div className="font-medium">{lab.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lab.location}</td>
                  <td className="px-4 py-3 text-gray-600">{lab.capacity} 人</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lab.status)}`}>
                      {getStatusText(lab.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lab.lockId ? (
                      <div className="flex items-center text-blue-600">
                        <LockOutlined className="mr-1" />
                        {lab.lockName}
                      </div>
                    ) : (
                      <span className="text-gray-400">未绑定</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(lab)}
                        className="text-blue-600 hover:text-blue-800"
                        title="编辑"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(lab.id)}
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

      {/* 添加/编辑实验室的模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {currentLab ? '编辑实验室' : '添加实验室'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  实验室名称
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
                  容量 (人数)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  设备清单
                </label>
                <textarea
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  状态
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">正常使用</option>
                  <option value="maintenance">维护中</option>
                  <option value="inactive">已停用</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  绑定门锁
                </label>
                <select
                  name="lockId"
                  value={formData.lockId || 0}
                  onChange={handleLockChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={0}>不绑定门锁</option>
                  {availableLocks.map(lock => (
                    <option key={lock.id} value={lock.id}>
                      {lock.name} ({lock.status === 'online' ? '在线' : '离线'})
                    </option>
                  ))}
                </select>
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

export default LabManagement; 