/// <reference types="react-scripts" />

declare module 'react' {
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  
  export interface FormEvent<T = Element> {
    preventDefault(): void;
    target: T;
  }
  
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }
  
  // 添加FC类型别名
  export type FC<P = {}> = FunctionComponent<P>;
  
  export interface SVGProps<T> extends SVGAttributes<T> {
    ref?: Ref<T>;
  }
  
  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
    type: T;
    props: P;
    key: Key | null;
  };

  // 添加React的Hook导出
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export const useState: <T>(initialState: T | (() => T)) => [T, Dispatch<SetStateAction<T>>];
  export const useEffect: (effect: () => void | (() => void), deps?: readonly any[]) => void;
  export const useMemo: <T>(factory: () => T, deps: any[]) => T;
  export const useCallback: <T extends (...args: any[]) => any>(callback: T, deps: any[]) => T;
  export const useRef: <T>(initialValue: T) => { current: T };
  
  // 添加ReactNode类型
  export type ReactNode = ReactElement | string | number | Iterable<ReactNode> | boolean | null | undefined;
}

declare module 'react/jsx-runtime' {
  export default {} as any;
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ico';
declare module '*.bmp';

// 添加JSX命名空间类型定义以解决元素隐式具有'any'类型的问题
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// 添加Node.js类型定义
declare namespace NodeJS {
  interface Timeout {}
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

// 添加EventEmitter类型定义
declare module 'events' {
  class EventEmitter {
    static defaultMaxListeners: number;
    
    constructor();
    
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(event: string | symbol): Function[];
    rawListeners(event: string | symbol): Function[];
    emit(event: string | symbol, ...args: any[]): boolean;
    listenerCount(event: string | symbol): number;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): Array<string | symbol>;
  }
  
  export = EventEmitter;
}

// 声明@ant-design/icons组件
declare module '@ant-design/icons' {
  import React from 'react';
  
  // 图标组件接口
  export interface IconComponentProps {
    className?: string;
    onClick?: React.MouseEventHandler<HTMLElement>;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  // 所有图标组件类型
  export const LockOutlined: React.FC<IconComponentProps>;
  export const ScanOutlined: React.FC<IconComponentProps>;
  export const MobileOutlined: React.FC<IconComponentProps>;
  export const ClockCircleOutlined: React.FC<IconComponentProps>;
  export const EnvironmentOutlined: React.FC<IconComponentProps>;
  export const InfoCircleOutlined: React.FC<IconComponentProps>;
  export const UnlockOutlined: React.FC<IconComponentProps>;
  export const ArrowLeftOutlined: React.FC<IconComponentProps>;
  export const DeleteOutlined: React.FC<IconComponentProps>;
  export const CheckOutlined: React.FC<IconComponentProps>;
  export const LoadingOutlined: React.FC<IconComponentProps>;
  export const DashboardOutlined: React.FC<IconComponentProps>;
  export const KeyOutlined: React.FC<IconComponentProps>;
  export const AppstoreOutlined: React.FC<IconComponentProps>;
  export const SettingOutlined: React.FC<IconComponentProps>;
  export const MenuOutlined: React.FC<IconComponentProps>;
  export const CloseOutlined: React.FC<IconComponentProps>;
  export const ExperimentOutlined: React.FC<IconComponentProps>;
  export const CheckCircleOutlined: React.FC<IconComponentProps>;
  export const CloseCircleOutlined: React.FC<IconComponentProps>;
  export const ExclamationCircleOutlined: React.FC<IconComponentProps>;
  export const ReloadOutlined: React.FC<IconComponentProps>;
  export const UserOutlined: React.FC<IconComponentProps>;
  export const WifiOutlined: React.FC<IconComponentProps>;
  export const ApiOutlined: React.FC<IconComponentProps>;
  export const EditOutlined: React.FC<IconComponentProps>;
  export const PlusOutlined: React.FC<IconComponentProps>;
  export const DeleteOutlined: React.FC<IconComponentProps>;
  export const SearchOutlined: React.FC<IconComponentProps>;
  export const LockOutlined: React.FC<IconComponentProps>;
  export const UnlockOutlined: React.FC<IconComponentProps>;
  export const ScanOutlined: React.FC<IconComponentProps>;
  
  
  // IconComponent类型
  export type IconComponent = React.FC<IconComponentProps>;
  
  // 其他可能需要的图标，后续根据需要添加
}

// 补充缺失的React组件类型
declare namespace React {
  interface StrictModeProps {
    children?: ReactNode;
  }
  
  const StrictMode: React.FC<StrictModeProps>;
}

// 补充全局类型定义
declare global {
  interface Window {
    // 在此处添加全局窗口对象的自定义属性
  }
} 