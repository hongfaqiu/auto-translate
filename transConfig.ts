import { TranslateConfig } from "./src/typings";

const config: TranslateConfig = {
  // 读取的目标文件夹，目标文件夹中只能存在一种语言的字典
  readFolder: './locales/mapView',
   // 不填则默认自动识别
  from: 'zh-CN',
   // 对照文件地址映射,不要与源文件夹一致,再次执行会覆盖同名文件
  outPutFolder: {
    en: './build/mapView/en-US.ts',
    pt: './build/mapView/pt-BR.ts',
    'zh-TW': './build/mapView/zh-TW.ts'
  },
   // 指定的文件后缀
  suffix: 'ts',
}

export default config