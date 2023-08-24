interface IAsyncResultBase {
  isLoading?: boolean;
  loadingPrompt?: string;
  error?: Error;
}

export interface IAsyncResult<T> extends IAsyncResultBase {
  result?: T;
}

export type Option = {
  label: string;
  value: string | number;
  icon?: string;
};
