 

declare module 'sql.js' {
  type InitSqlJs = (config?: {
    locateFile?: (file: string) => string;
  }) => Promise<any>;

  const initSqlJs: InitSqlJs;

  export default initSqlJs;
}