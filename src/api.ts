import { Lab, Lock } from './types';

// 这里请根据实际API地址替换
const LABS_API = '/api/labs';
const LOCKS_API = '/api/locks';

export async function fetchLabsApi(): Promise<Lab[]> {
  const res = await fetch(LABS_API);
  if (!res.ok) throw new Error('实验室API请求失败');
  return res.json();
}

export async function fetchLocksApi(): Promise<Lock[]> {
  const res = await fetch(LOCKS_API);
  if (!res.ok) throw new Error('门锁API请求失败');
  return res.json();
} 