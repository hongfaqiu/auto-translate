import googleTranslateApi from '@vitalets/google-translate-api'
import { ProxyOptions } from 'tunnel'

type Languages = keyof typeof googleTranslateApi.languages
export interface TranslateConfig {
  readFolder: string;
  from?: Languages;
  outPutFolder: {
    [K in Languages]?: string;
  };
  suffix: string;
  proxy?: ProxyOptions
}

export type DictItem = {
  key: string;
  value: string;
}

export type Dict = DictItem[]