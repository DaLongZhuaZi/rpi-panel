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

// 自定义主题颜色变量定义
interface ThemeColors {
  primary: string;
  'primary-dark': string;
  'primary-light': string;
  secondary: string;
  'secondary-dark': string;
  'secondary-light': string;
  background: string;
  'background-light': string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// 为了解决Ant Design图标组件问题
declare module '@ant-design/icons' {
  // 定义图标组件接口
  interface IconProps {
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  
  export const ApiOutlined: React.FC<IconProps>;
  export const WifiOutlined: React.FC<IconProps>;
  export const InfoCircleOutlined: React.FC<IconProps>;
  export const CheckOutlined: React.FC<IconProps>;
  export const CloseOutlined: React.FC<IconProps>;
  export const LoadingOutlined: React.FC<IconProps>;
  export const SettingOutlined: React.FC<IconProps>;
  export const TeamOutlined: React.FC<IconProps>;
  export const LockOutlined: React.FC<IconProps>;
  export const DashboardOutlined: React.FC<IconProps>;
  export const LogoutOutlined: React.FC<IconProps>;
  export const MenuFoldOutlined: React.FC<IconProps>;
  export const MenuUnfoldOutlined: React.FC<IconProps>;
  export const BankOutlined: React.FC<IconProps>;
  export const HomeOutlined: React.FC<IconProps>;
  export const PlusOutlined: React.FC<IconProps>;
  export const SyncOutlined: React.FC<IconProps>;
  export const ToolOutlined: React.FC<IconProps>;
  export const CheckCircleOutlined: React.FC<IconProps>;
  export const CloseCircleOutlined: React.FC<IconProps>;
  export const UserOutlined: React.FC<IconProps>;
  export const UserAddOutlined: React.FC<IconProps>;
  export const UserDeleteOutlined: React.FC<IconProps>;
  export const UserEditOutlined: React.FC<IconProps>;
  export const UserViewOutlined: React.FC<IconProps>;
  export const UserSearchOutlined: React.FC<IconProps>;
  export const ArrowLeftOutlined: React.FC<IconProps>;
  export const DeleteOutlined: React.FC<IconProps>;
  export const LoadingOutlined: React.FC<IconProps>;
  export const ClockCircleOutlined: React.FC<IconProps>;
  export const ExclamationCircleOutlined: React.FC<IconProps>;
  export const ReloadOutlined: React.FC<IconProps>;
  export const UnlockOutlined: React.FC<IconProps>;
  export const ExperimentOutlined: React.FC<IconProps>;
  export const KeyOutlined: React.FC<IconProps>;
  export const EditOutlined: React.FC<IconProps>;
  export const PlusOutlined: React.FC<IconProps>;
  export const SearchOutlined: React.FC<IconProps>;
  export const LockOutlined: React.FC<IconProps>;
  export const UnlockOutlined: React.FC<IconProps>;
  export const ExperimentOutlined: React.FC<IconProps>;
  export const ScanOutlined: React.FC<IconProps>;
  export const MobileOutlined: React.FC<IconProps>;
  export const EnvironmentOutlined: React.FC<IconProps>;
  export const InfoCircleOutlined: React.FC<IconProps>;
  export const AppstoreOutlined: React.FC<IconProps>;
  export const ApiOutlined: React.FC<IconProps>;
  export const WifiOutlined: React.FC<IconProps>;
  export const LoadingOutlined: React.FC<IconProps>;
  export const CheckOutlined: React.FC<IconProps>;
  export const CloseOutlined: React.FC<IconProps>;
  

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