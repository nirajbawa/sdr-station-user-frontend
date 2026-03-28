export interface IElectronAPI {
  getLastLogin: () => Promise<string | null>;
  getHardwareId: () => Promise<string>;
  registerLogin: (email: string) => Promise<void>;
  switchUserDatabase: (email: string) => Promise<{ success: boolean; message?: string }>;
  executeRawPrompt: (prompt: string, page: number, limit: number, email?: string, token?: string) => Promise<any>;
  showSaveDialog: (options: any) => Promise<{ filePath: string | undefined; canceled: boolean }>;
  exportRecords: (options: any, filePath: string) => Promise<{ success: boolean; error?: string }>;
  getRecordById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
