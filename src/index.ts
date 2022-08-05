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
} = {
  total: 0,
  done: 0,
  leave: 0,
  error: []
}

const updateStd = () => {
  readline.cursorTo(outStream, 0, 1); 
  readline.clearScreenDown(outStream);
  rl.write(`共计: ${std.total}, 已完成: ${std.done}, 剩余: ${std.leave}, 失败: ${std.error.length} \n`);
  if(std.leave === 0) rl.close()
}

const convertLang = async (taskArray: Dict, options: {
  from?: string;
  targetLang: Languages;
  path: string;
}) => {
  const { from, targetLang, path } = options;
  std.done = 0;
  updateStd();
  const oldTranslated = await getFileContent(path)
  const oldTranslatedObj = Dict2Object(oldTranslated)

  const translated: Dict =taskArray.map(item => ({
    key: item.key,
    value: oldTranslatedObj[item.key] ?? config.defaultValue ?? '-'
  }))

  const translatedObj = Dict2Object(translated)

  return taskArray.map(async (item, index) => {
    if (translatedObj[item.key] !== config.defaultValue && translatedObj[item.key] !== '-') {
      std.done += 1;
      std.leave -= 1;
      updateStd();
      return translated[index]
    }

    return doTranslate(item, {
      from,
      to: targetLang
    }).then(res => {
      std.done += 1;
      std.leave -= 1;
      updateStd();
      if (res) {
        translated[index] = res
        Dict2File(translated, path)
      }
      return res
    }).catch(e => {
      console.log('失败: ', item.key)
      updateStd();
      std.error.push(item)
      return null
    })
  })
}

const Dict2Object = (dict: Dict) => {
  let outPutFileArrayResult: any[] = [];
  dict = dict.sort((a, b) => a.key.localeCompare(b.key))
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
  return outPutFileObjectResult
}

const Dict2File = (dict: Dict, path: string, ts = true) => {
  const outPutFileObjectResult = Dict2Object(dict)
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
      Object.entries(config.outPutFolder).map(([lang, path]) => {
        convertLang(result, {
          targetLang: lang as any,
          from: config.from,
          path
        })
      })
      
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
      tld: 'com',
    }, config.proxy ? {
      agent: tunnel.httpsOverHttp({
        proxy: config.proxy
      })
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