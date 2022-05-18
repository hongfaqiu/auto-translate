import { TranslateConfig } from "./src/typings";

const config: TranslateConfig = {
  readFolder: './locales/mapView', // 读取的目标文件夹
  from: 'zh-CN', // 不填则默认自动识别
  outPutFolder: {
    en: './build/en-US.ts',
    pt: './build/pt-BR.ts',
    'zh-TW': './build/zh-TW.ts'
  }, // 对照文件地址映射,不要与源文件夹一致
  suffix: 'ts', // 指定的文件后缀
}

export default config