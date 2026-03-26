export interface IElectronAPI {
  getLastLogin: () => Promise<string | null>;
  getHardwareId: () => Promise<string>;
  registerLogin: (email: string) => Promise<void>;
  switchUserDatabase: (email: string) => Promise<{ success: boolean; message?: string }>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
