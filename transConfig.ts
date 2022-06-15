import { TranslateConfig } from "./src/typings";

const config: TranslateConfig = {
  // 读取的目标文件夹，目标文件夹中只能存在一种语言的字典
  readFolder: './locales',
  // 指定的文件后缀
  suffix: 'ts',
  // 不填则默认自动识别
  // from: 'en',
  // 输出的原始字典文件
  outPutOrignPath: './build/origin.json',
  // 翻译失败时返回的值, 默认为'-'
  defaultValue: '-',
  // 对照文件地址映射,不要与源文件夹一致,再次执行会覆盖同名文件,建议一种一种翻译
  outPutFolder: {
    // 德语
    de: './build/de-DE.ts',
    // 法语
    /* fr: './build/fr-FR.ts',
    // 西班牙语
    es: './build/es-ES.ts',
    // 俄语
    ru: './build/ru-RU.ts',
    // 阿拉伯语
    ar: './build/ar-EG.ts',
    // 繁体中文
    'zh-TW': './build/zh-TW.ts' */
  },
  // 代理配置
  proxy: {
    host: 'localhost',
    port: 7890,
  },
  // resultReg: str => str.replace(/\"(.*?)\":/g, (match, s1) => `${s1}:`)
}

export default config