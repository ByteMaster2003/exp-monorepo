declare module "ui/utils" {
  interface RequestHeaders {
    "Content-Type"?: string;
    [key: string]: string | undefined;
  }

  function POST<T = any>(path: string, payload: any, headers?: RequestHeaders): Promise<T>;

  function GET<T = any>(path: string, headers?: RequestHeaders): Promise<T>;
}
