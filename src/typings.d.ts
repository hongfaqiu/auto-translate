import googleTranslateApi from '@vitalets/google-translate-api'

type Languages = keyof typeof googleTranslateApi.languages
export interface TranslateConfig {
  readFolder: string;
  from?: Languages;
  outPutFolder: {
  [K in Languages]?: string;
};
  suffix: string;
}