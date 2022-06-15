import googleTranslateApi from '@vitalets/google-translate-api'
import { ProxyOptions } from 'tunnel'

type Languages = keyof typeof googleTranslateApi.languages
export interface TranslateConfig {
  readFolder: string;
  from?: Languages;
  outPutOrignPath?: string;
  outPutFolder: {
    [K in Languages]?: string;
  };
  defaultValue?: string
  suffix: string;
  proxy?: ProxyOptions
  resultReg?: (str: string) => str
}

export type DictItem = {
  key: string;
  value: string;
}

export type Dict = DictItem[]