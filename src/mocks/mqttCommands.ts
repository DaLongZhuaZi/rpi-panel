export interface MqttCommandOption {
  key: string;
  label: string;
  params?: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
    default?: any;
  }>;
}

export const deviceMqttCommands: Record<string, MqttCommandOption[]> = {
  'door-lock': [
    { key: 'lock', label: '上锁' },
    { key: 'unlock', label: '解锁' },
    { key: 'queryStatus', label: '查询状态' }
  ],
  'sensor': [
    { key: 'query', label: '查询传感器数据' },
    { key: 'setThreshold', label: '设置阈值', params: [
      { key: 'temperature', label: '温度阈值', type: 'number' },
      { key: 'humidity', label: '湿度阈值', type: 'number' }
    ] }
  ],
  'light': [
    { key: 'turnOn', label: '开灯' },
    { key: 'turnOff', label: '关灯' },
    { key: 'setBrightness', label: '设置亮度', params: [
      { key: 'brightness', label: '亮度(0-100)', type: 'number', required: true, default: 80 }
    ] },
    { key: 'toggleAutoMode', label: '切换自动模式', params: [
      { key: 'autoMode', label: '自动模式', type: 'boolean', required: true, default: true }
    ] }
  ],
  'camera': [
    { key: 'snapshot', label: '抓拍' },
    { key: 'startStream', label: '开启视频流' },
    { key: 'stopStream', label: '关闭视频流' }
  ]
}; 