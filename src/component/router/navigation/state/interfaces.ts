
export interface INavigationStateConstructor {
  new<TData>(url: URL, options?: INavigationStateOptions<TData>): INavigationState<TData>;
}

export interface INavigationStateOptions<TData> {
  timestamp?: number;
  data?: TData;
}

export interface INavigationState<TData = any> {
  readonly url: string;
  readonly timestamp: number;
  readonly data: TData;

  equals(state: INavigationState<TData>): boolean
}
