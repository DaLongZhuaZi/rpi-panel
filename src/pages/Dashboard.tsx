import React, { useState, useEffect } from 'react';
import { 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  ExperimentOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { api, Reservation as ApiReservation } from '../services/api';
import { mockReservations, mockLocks, MockReservation, MockLock } from '../services/mockData';

interface Reservation {
  id: number;
  labName: string;
  status: 'available' | 'booked' | 'in-use' | 'maintenance';
  startTime?: string;
  endTime?: string;
  user?: string;
}

interface Lock {
  id: number;
  name: string;
  status: 'online' | 'offline';
  isLocked: boolean;
  batteryLevel: number;
  labName?: string;
}

const Dashboard: React.FC = () => {
  const CheckCircleIcon = () => <CheckCircleOutlined />;
  const ClockCircleIcon = () => <ClockCircleOutlined />;
  const CloseCircleIcon = () => <CloseCircleOutlined />;
  const ExclamationCircleIcon = () => <ExclamationCircleOutlined />;
  const ReloadIcon = () => <ReloadOutlined />;
  const InfoCircleIcon = () => <InfoCircleOutlined />;
  const LockIcon = () => <LockOutlined />;
  const UnlockIcon = () => <UnlockOutlined />;
  const ExperimentIcon = () => <ExperimentOutlined />;

  const [reservations, setReservations] = useState<MockReservation[]>([]);
  const [locks, setLocks] = useState<MockLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false); // 调试模式，是否回退到模拟数据

  // API转UI数据格式
  const mapApiToUiReservation = (apiRes: ApiReservation): Reservation => {
    let status: Reservation['status'] = 'available';
    switch (apiRes.status) {
      case 'active':
        status = 'in-use';
        break;
      case 'upcoming':
        status = 'booked';
        break;
      case 'completed':
        status = 'available';
        break;
      case 'cancelled':
        status = 'maintenance';
        break;
      default:
        status = 'available';
    }
    return {
      id: apiRes.id,
      labName: apiRes.labName,
      status: status as Reservation['status'],
      startTime: apiRes.startTime ? apiRes.startTime.slice(11, 16) : undefined,
      endTime: apiRes.endTime ? apiRes.endTime.slice(11, 16) : undefined,
      user: apiRes.username,
    };
  };

  // 获取数据（API优先，失败回退）
  const fetchData = async () => {
    setLoading(true);
    setFallback(false);
    setError(null);
    try {
      // 获取预约数据
      const apiReservations = await api.getReservations();
      // 获取实验室数据（可用于门锁分配等）
      const labs = await api.getLabs();
      // 这里假设门锁数据暂无API，直接用mock
      setReservations(apiReservations.map(mapApiToUiReservation));
      setLocks(mockLocks);
    } catch (err) {
      // API失败，回退到模拟数据
      setReservations(mockReservations);
      setLocks(mockLocks);
      setFallback(true);
      setError('API获取失败，已切换为模拟数据');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'booked':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'in-use':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'available':
        return '可用';
      case 'booked':
        return '已预约';
      case 'in-use':
        return '使用中';
      case 'maintenance':
        return '维护中';
      default:
        return '未知';
    }
  };

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon />;
      case 'booked':
        return <ClockCircleIcon />;
      case 'in-use':
        return <ClockCircleIcon />;
      case 'maintenance':
        return <CloseCircleIcon />;
      default:
        return <ExclamationCircleIcon />;
    }
  };

  const getLockStatusColor = (status: Lock['status']) => {
    return status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'bg-green-500';
    if (level >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 计算门锁统计数据
  const totalLocks = locks.length;
  const onlineLocks = locks.filter(lock => lock.status === 'online').length;
  const offlineLocks = locks.filter(lock => lock.status === 'offline').length;
  const lockedLocks = locks.filter(lock => lock.isLocked).length;
  const unlockedLocks = locks.filter(lock => !lock.isLocked).length;
  const assignedLocks = locks.filter(lock => lock.labName).length;

  return (
    <div className="h-full w-full flex flex-col overflow-auto pb-4">
      {/* 实验室状态概览 */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg md:text-xl font-semibold">实验室状态</h2>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
          >
            <ReloadIcon />
            <span className="ml-1">刷新</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            <p className="flex items-center">
              <ExclamationCircleIcon />
              <span className="ml-2">{error}</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {reservations.map(reservation => (
              <div 
                key={reservation.id} 
                className={`border rounded-lg p-3 ${getStatusColor(reservation.status)}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium flex items-center">
                    <ExperimentIcon />
                    <span className="ml-2">{reservation.labName}</span>
                  </h3>
                  <span className="flex items-center text-sm">
                    {getStatusIcon(reservation.status)}
                    <span className="ml-1">{getStatusText(reservation.status)}</span>
                  </span>
                </div>
                
                {(reservation.status === 'booked' || reservation.status === 'in-use') && (
                  <div className="mt-2 text-sm">
                    <p>时间: {reservation.startTime} - {reservation.endTime}</p>
                    <p>预约人: {reservation.user}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 门锁状态概览 */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
        <h2 className="text-lg md:text-xl font-semibold mb-3">门锁状态</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* 门锁统计 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">总数量</p>
                <p className="text-xl font-semibold">{totalLocks}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">在线</p>
                <p className="text-xl font-semibold text-green-600">{onlineLocks}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">离线</p>
                <p className="text-xl font-semibold text-gray-600">{offlineLocks}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">已锁</p>
                <p className="text-xl font-semibold text-red-600">{lockedLocks}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">未锁</p>
                <p className="text-xl font-semibold text-yellow-600">{unlockedLocks}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">已分配</p>
                <p className="text-xl font-semibold text-purple-600">{assignedLocks}</p>
              </div>
            </div>
            
            {/* 门锁列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locks.map(lock => (
                <div key={lock.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <KeyOutlined />
                      <span className="ml-2">{lock.name}</span>
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getLockStatusColor(lock.status)}`}>
                      {lock.status === 'online' ? '在线' : '离线'}
                    </span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      {lock.isLocked ? (
                        <span className="flex items-center text-red-600">
                          <LockIcon />
                          <span className="ml-1">已锁定</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-green-600">
                          <UnlockIcon />
                          <span className="ml-1">未锁定</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${getBatteryColor(lock.batteryLevel)} h-2.5 rounded-full`} 
                          style={{ width: `${lock.batteryLevel}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs">{lock.batteryLevel}%</span>
                    </div>
                  </div>
                  
                  {lock.labName && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <InfoCircleIcon />
                      <span className="ml-1">所属: {lock.labName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 