/** TYPES **/

export interface INavigationStateOptions<TData> {
  url: URL | string;
  timestamp?: number;
  data?: TData;
}
