import { getFileContent, writeToFilePath, } from './localeFs';
import { getProjectAllTSXFile } from './folder';
import translate from '@vitalets/google-translate-api';
import config from '../transConfig'
import { Languages, Dict, DictItem } from './typings';

const convertLang = (taskArray: Dict, options: {
  from?: string;
  targetLang: Languages;
  path: string;
}) => {
  const { from, targetLang, path } = options;
  const promiseArray = taskArray.map((item, index) => {
    return doTranslate(item, {
      from,
      to: targetLang
    });
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
  return new Promise<DictItem>(resolve => {
    translate(obj.value, {
      from,
      to,
      tld: 'cn'
    }).then(res => {
      const data = res.text
      resolve({
        key: obj.key,
        value: data
      });
    })
  })
}

execFun()

export default execFun