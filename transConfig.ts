import { TranslateConfig } from "./src/typings";

const config: TranslateConfig = {
  // 读取的目标文件夹，目标文件夹中只能存在一种语言的字典
  readFolder: './locales/mapView',
  // 指定的文件后缀
  suffix: 'ts',
  // 不填则默认自动识别
  from: 'zh-CN',
  // 对照文件地址映射,不要与源文件夹一致,再次执行会覆盖同名文件
  outPutFolder: {
    // 阿拉伯语
    ar: './build/mapView/ar-EG.ts',
  },
  // 代理配置
  proxy: {
    host: 'localhost',
    port: 7890,
  }
}

export default config