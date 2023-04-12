import { devInfo, HttpMethod } from '@glyph-cat/swiss-army-knife'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import queryString, { StringifiableRecord } from 'query-string'
import { ENV } from '~constants'
import { ConfigSource } from '~sources/config'

interface NetworkConfigTemplateOptions {
  config?: AxiosRequestConfig
  token?: string
}

async function getNetworkConfigTemplate({
  config: customConfig = {},
  token,
}: NetworkConfigTemplateOptions): Promise<AxiosRequestConfig> {
  const {
    headers: customHeaders,
    ...remainingCustomConfig
  } = customConfig
  const { deviceKey } = await ConfigSource.getAsync()
  return {
    headers: {
      api_key: ENV.APP_API_KEY,
      ...customHeaders,
      ...(token ? { authorization: `bearer ${token}` } : {}),
      ...(deviceKey ? { device_key: deviceKey } : {}),
    },
    ...remainingCustomConfig,
  }
}

/**
 * @public
 */
export async function networkGet<Q, R>(
  url: string,
  query?: Q,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<R>> {
  const FINAL_url = queryString.stringifyUrl({ url, query: query as StringifiableRecord })
  const FINAL_config = await getNetworkConfigTemplate({ config })
  devInfo(HttpMethod.GET, { url: FINAL_url, query, config: FINAL_config })
  const res = await axios.get(FINAL_url, FINAL_config)
  return res
}

/**
 * @public
 */
export async function networkPost<Q, D, R>(
  url: string,
  query?: Q,
  data?: D,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<R>> {
  const FINAL_url = queryString.stringifyUrl({ url, query: query as StringifiableRecord })
  const FINAL_config = await getNetworkConfigTemplate({ config })
  devInfo(HttpMethod.POST, { url: FINAL_url, query, data, config: FINAL_config })
  const res = await axios.post(FINAL_url, data, FINAL_config)
  return res
}

/**
 * @public
 */
export async function networkDelete<Q, R>(
  url: string,
  query?: Q,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<R>> {
  const FINAL_url = queryString.stringifyUrl({ url, query: query as StringifiableRecord })
  const FINAL_config = await getNetworkConfigTemplate({ config })
  devInfo(HttpMethod.DELETE, { url: FINAL_url, query, config: FINAL_config })
  const res = await axios.delete(FINAL_url, FINAL_config)
  return res
}
