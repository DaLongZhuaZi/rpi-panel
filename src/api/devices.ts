import { mockDevices } from '../mocks/devices';
import type { Device } from '../types/device';

// 真实API地址（请根据实际情况替换）
const API_URL = '/api/devices';

export async function fetchDevices(): Promise<Device[]> {
  try {
    const res = await fetch(API_URL, { method: 'GET' });
    if (!res.ok) throw new Error('API响应异常');
    const data = await res.json();
    // 可根据实际API结构调整
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.devices)) return data.devices;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 降级到模拟数据
    return mockDevices;
  }
}

/** 获取单个设备详情 */
export async function fetchDeviceById(id: string): Promise<Device | undefined> {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'GET' });
    if (!res.ok) throw new Error('API响应异常');
    const data = await res.json();
    if (data && typeof data === 'object' && data.id === id) return data;
    if (data && data.device && data.device.id === id) return data.device;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 降级到mock
    return mockDevices.find(d => d.id === id);
  }
}

/** 新增设备 */
export async function createDevice(device: Device): Promise<Device> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(device)
    });
    if (!res.ok) throw new Error('API响应异常');
    const data = await res.json();
    if (data && typeof data === 'object' && data.id) return data;
    if (data && data.device && data.device.id) return data.device;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 降级到mock（仅内存，刷新失效）
    mockDevices.push(device);
    return device;
  }
}

/** 编辑设备 */
export async function updateDevice(id: string, update: Partial<Device>): Promise<Device | undefined> {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error('API响应异常');
    const data = await res.json();
    if (data && typeof data === 'object' && data.id === id) return data;
    if (data && data.device && data.device.id === id) return data.device;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 降级到mock
    const idx = mockDevices.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    mockDevices[idx] = { ...mockDevices[idx], ...update };
    return mockDevices[idx];
  }
}

/** 删除设备 */
export async function deleteDevice(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API响应异常');
    // 假设API返回 { success: true }
    const data = await res.json();
    if (data && data.success === true) return true;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 降级到mock
    const idx = mockDevices.findIndex(d => d.id === id);
    if (idx === -1) return false;
    mockDevices.splice(idx, 1);
    return true;
  }
} 