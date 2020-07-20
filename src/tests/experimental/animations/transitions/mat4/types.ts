export type TNumberArray = {
  [key: number]: number;
  length: number;
};

export interface TNumberArrayConstructor {
  new(length: number): TNumberArray;
}
