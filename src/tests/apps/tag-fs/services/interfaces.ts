
export interface IFileSystemStats {
  birthTime: number; // ms
}

export interface ITagFileSystemStats extends IFileSystemStats {
  id: number;
  name: string;
  size: number;
}
