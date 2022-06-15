import { getFileContent, writeToFilePath, } from './localeFs';
import { getProjectAllTSXFile } from './folder';
import translate from '@vitalets/google-translate-api';
import tunnel from 'tunnel';
import config from '../transConfig'
import { Languages, Dict, DictItem } from './typings';
import readline from 'readline';
 
const outStream = process.stdout; 

const rl = readline.createInterface({ 
  input: process.stdin, 
  output: outStream 
}); 

const std: {
  total: number
  done: number
  leave: number
  error: Dict
  now?: DictItem
} = {
  total: 0,
  done: 0,
  leave: 0,
  error: [],
  now: undefined
}

const updateStd = () => {
  readline.cursorTo(outStream, 0, 1); 
  readline.clearScreenDown(outStream);
  rl.write(`共计: ${std.total}, 已完成: ${std.done}, 剩余: ${std.leave}, 失败: ${std.error.length}, 当前: ${std.now?.value} \n`);
}

const convertLang = (taskArray: Dict, options: {
  from?: string;
  targetLang: Languages;
  path: string;
}) => {
  const { from, targetLang, path } = options;
  std.done = 0;
  updateStd();
  const translated: Dict = taskArray.map(item => ({
    key: item.key,
    value: config.defaultValue ?? '-'
  }))
  taskArray.map(async (item, index) => {
    const res = await doTranslate(item, {
      from,
      to: targetLang
    }).then(res => {
      std.done += 1;
      return res
    }).catch(e => {
      std.error.push(item)
      return null
    })
    std.leave -= 1;
    std.now = item
    updateStd();
    if (res) {
      translated[index] = res
      Dict2File(translated, path)
    }
    return res
  })
}

const Dict2File = (dict: Dict, path: string, ts = true) => {
  let outPutFileArrayResult: any[] = [];
  dict.forEach(item => {
    outPutFileArrayResult = [...outPutFileArrayResult, {
      [item.key]: item.value
    }]
  })
  let outPutFileObjectResult = {};
  outPutFileArrayResult.forEach(item => {
    outPutFileObjectResult = {
      ...outPutFileObjectResult,
      ...item
    }
  })
  writeToFilePath(outPutFileObjectResult, path, ts);
}

const execFun = async () => {
  // 获取项目所有的jsx路径
  const AllPath = await getProjectAllTSXFile(config);
  // 根据每一个文件路径，获取{key:value,key:value},组成一个promise数组
  const promiseArray = AllPath.map((path) => {
    return getFileContent(path, config);
  });
  // 读取所有的文件，生成一个对象，并写入文件
  Promise.all(promiseArray)
    .then(async (res) => {
      let result: Dict = [];
      res.map(item => {
        result = [...result, ...item]
      })
      console.log(`>>>>>>正在尝试将${result.length}条文本翻译为${ Object.keys(config.outPutFolder).length }种目标语言，如果翻译失败，请重新执行`)
      console.log(`>>>>>>报302错误请使用代理配置`)
      if (config.outPutOrignPath) Dict2File(result, config.outPutOrignPath, false)
      std.total = result.length * Object.keys(config.outPutFolder).length
      std.leave = std.total;
      for (let lang in config.outPutFolder) {
        convertLang(result, {
          targetLang: lang as any,
          from: config.from,
          path: config.outPutFolder[lang]
        })
      }
      
    })
    .catch((err) => {
      console.log(err);
    });
}

// 获取翻译结果
const doTranslate = (obj: DictItem, options: translate.IOptions) => {
  const { from, to} = options;
  return new Promise<DictItem>((resolve, reject) => {
    translate(obj.value, {
      from,
      to,
      tld: 'cn',
    }, config.proxy ? {
      agent: tunnel.httpsOverHttp({
        proxy: config.proxy
      }
      )
    } : undefined).then(res => {
      const data = res.text
      resolve({
        key: obj.key,
        value: data
      });
    }).catch(e => {
      console.error(e)
      reject(e)
    })
  })
}

execFun()

export default execFun