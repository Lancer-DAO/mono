interface IAsyncResultBase {
  isLoading?: boolean;
  loadingPrompt?: string;
  error?: Error;
}

export interface IAsyncResult<T> extends IAsyncResultBase {
  result?: T;
}

export interface Option {
  label: string;
  value: string;
  icon?: string;
}
