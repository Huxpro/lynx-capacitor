// Faithful ports of @capacitor/core's HTTP helpers. Some official plugin web
// fallbacks (e.g. @capacitor/filesystem's downloadFile) import these from
// '@capacitor/core' at module scope, so the adapter must export them for the
// bundle to link — even though on-device the native implementation is used.

export interface HttpHeaders {
  [key: string]: string;
}

export interface HttpOptions {
  url: string;
  method?: string;
  params?: Record<string, string | string[]>;
  data?: any;
  headers?: HttpHeaders;
  readTimeout?: number;
  connectTimeout?: number;
  disableRedirects?: boolean;
  webFetchExtra?: RequestInit;
  responseType?: string;
  shouldEncodeUrlParams?: boolean;
  dataType?: 'file' | 'formData';
}

export function normalizeHttpHeaders(headers: HttpHeaders = {}): HttpHeaders {
  const originalKeys = Object.keys(headers);
  const loweredKeys = Object.keys(headers).map(k => k.toLocaleLowerCase());
  const normalized = loweredKeys.reduce<HttpHeaders>((acc, key, index) => {
    acc[key] = headers[originalKeys[index]];
    return acc;
  }, {});
  return normalized;
}

export function buildUrlParams(
  params?: Record<string, string | string[]>,
  shouldEncode = true,
): string | null {
  if (!params) {
    return null;
  }
  const output: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(str => {
        output.push(`${key}=${shouldEncode ? encodeURIComponent(str) : str}`);
      });
    } else {
      output.push(`${key}=${shouldEncode ? encodeURIComponent(value) : value}`);
    }
  });
  const encoded = output.join('&');
  return encoded.length ? encoded : null;
}

export function buildRequestInit(
  options: HttpOptions,
  extra: RequestInit = {},
): RequestInit {
  const output: RequestInit = {
    method: options.method || 'GET',
    headers: options.headers,
    ...extra,
  };
  const headers = normalizeHttpHeaders(options.headers);
  const type = headers['content-type'] || '';

  if (typeof options.data === 'string') {
    output.body = options.data;
  } else if (type.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.data || {})) {
      params.set(key, value as any);
    }
    output.body = params.toString();
  } else if (type.includes('multipart/form-data') || options.data instanceof FormData) {
    const form = new FormData();
    if (options.data instanceof FormData) {
      options.data.forEach((value, key) => {
        form.append(key, value);
      });
    } else {
      for (const key of Object.keys(options.data)) {
        form.append(key, options.data[key]);
      }
    }
    output.body = form;
    const hdrs = new Headers(output.headers);
    hdrs.delete('content-type');
    output.headers = hdrs;
  } else if (type.includes('application/json') || typeof options.data === 'object') {
    output.body = JSON.stringify(options.data);
  }
  return output;
}
