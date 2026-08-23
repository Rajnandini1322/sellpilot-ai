/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'sql.js' {
  type InitSqlJs = () => Promise<any>;
  const initSqlJs: InitSqlJs;
  export default initSqlJs;
}
