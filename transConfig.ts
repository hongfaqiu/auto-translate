import { TranslateConfig } from "./src/typings";

const config: TranslateConfig = {
  // 读取的目标文件夹，目标文件夹中只能存在一种语言的字典
  readFolder: './locales/mapView',
   // 不填则默认自动识别
  from: 'zh-CN',
   // 对照文件地址映射,不要与源文件夹一致,再次执行会覆盖同名文件
  outPutFolder: {
    // 英语
    en: './build/mapView/en-US.ts',
    // 德语
    de: './build/mapView/de-DE.ts',
    // 法语
    fr: './build/mapView/fr-FR.ts',
    // 西班牙语
    es: './build/mapView/es-ES.ts',
    // 俄语
    ru: './build/mapView/ru-RU.ts',
    // 阿拉伯语
    ar: './build/mapView/ar-EG.ts',
    // 繁体中文
    'zh-TW': './build/mapView/zh-TW.ts'
  },
   // 指定的文件后缀
  suffix: 'ts',
}

export default config