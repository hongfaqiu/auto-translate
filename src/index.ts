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

const std = {
  total: 0,
  done: 0,
  leave: 0
}

const updateStd = () => {
  readline.cursorTo(outStream, 0, 1); 
  readline.clearScreenDown(outStream);
  rl.write(`共计: ${std.total}, 已完成: ${std.done}, 剩余: ${std.leave} \n`);
}

const convertLang = (taskArray: Dict, options: {
  from?: string;
  targetLang: Languages;
  path: string;
}) => {
  const { from, targetLang, path } = options;
  std.total = taskArray.length;
  std.done = 0;
  std.leave = taskArray.length;
  updateStd();
  const promiseArray = taskArray.map(async (item, index) => {
    const res = await doTranslate(item, {
      from,
      to: targetLang
    });
    std.done += 1;
    std.leave -= 1;
    updateStd();
    return res
  })
  return Promise.all(promiseArray).then(transRes => {
    let outPutFileArrayResult: any[] = [];
    transRes.forEach(item => {
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
    writeToFilePath(outPutFileObjectResult, path);
  })
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
      for (let lang in config.outPutFolder) {
        await convertLang(result, {
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
  return new Promise<DictItem>(resolve => {
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
      resolve({
        key: obj.key,
        value: '-'
      })
    })
  })
}

execFun()

export default execFun