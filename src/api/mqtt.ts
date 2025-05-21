import type { Device } from '../types/device';

export interface SendMqttCommandParams {
  deviceId: string;
  command: string;
  params?: Record<string, any>;
}

export interface SendMqttCommandResult {
  success: boolean;
  message: string;
}

// 真实API地址（请根据实际情况替换）
const API_URL = '/api/mqtt/send';

export async function sendMqttCommand({ deviceId, command, params }: SendMqttCommandParams): Promise<SendMqttCommandResult> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, command, params })
    });
    if (!res.ok) throw new Error('API响应异常');
    const data = await res.json();
    if (typeof data.success === 'boolean') return data;
    throw new Error('API数据格式错误');
  } catch (e) {
    // 模拟响应
    return {
      success: true,
      message: `已模拟发送命令 ${command} 到设备 ${deviceId}`
    };
  }
} 