/// <reference types="react-scripts" />

// 解决 @ant-design/icons 的类型问题
declare module '@ant-design/icons' {
  import * as React from 'react';

  // 基础图标接口
  export interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    spin?: boolean;
    rotate?: number;
    twoToneColor?: string;
  }

  // 所有缺失的图标组件
  export const UserOutlined: React.FC<IconProps>;
  export const ArrowLeftOutlined: React.FC<IconProps>;
  export const DeleteOutlined: React.FC<IconProps>;
  export const CheckOutlined: React.FC<IconProps>;
  export const CloseOutlined: React.FC<IconProps>;
  export const LockOutlined: React.FC<IconProps>;
  export const UnlockOutlined: React.FC<IconProps>;
  export const ExperimentOutlined: React.FC<IconProps>;
  export const KeyOutlined: React.FC<IconProps>;
  export const EditOutlined: React.FC<IconProps>;
  export const PlusOutlined: React.FC<IconProps>;
  export const ReloadOutlined: React.FC<IconProps>;
  export const SearchOutlined: React.FC<IconProps>;
  export const LoadingOutlined: React.FC<IconProps>;
  export const InfoCircleOutlined: React.FC<IconProps>;
  export const CheckCircleOutlined: React.FC<IconProps>;
  export const ClockCircleOutlined: React.FC<IconProps>;
  export const CloseCircleOutlined: React.FC<IconProps>;
  export const ExclamationCircleOutlined: React.FC<IconProps>;
  export const ScanOutlined: React.FC<IconProps>;
  export const MobileOutlined: React.FC<IconProps>;
  export const EnvironmentOutlined: React.FC<IconProps>;
  export const AppstoreOutlined: React.FC<IconProps>;
  export const SettingOutlined: React.FC<IconProps>;
  export const WifiOutlined: React.FC<IconProps>;
  export const ApiOutlined: React.FC<IconProps>;
  export const BankOutlined: React.FC<IconProps>;

  // 添加其他可能缺失的图标...
} 