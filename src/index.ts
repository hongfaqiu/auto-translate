import { getFileContent, writeToFilePath, } from './localeFs';
import { getProjectAllTSXFile } from './folder';
import translate from '@vitalets/google-translate-api';
import config from '../transConfig'
import { Languages, Dict } from './typings';

const convertLang = (taskArray: any[], options: {
  from?: string;
  targetLang: Languages;
  path: string;
}) => {
  const { from, targetLang, path } = options;
  const promiseArray = taskArray.map((item, index) => {
    return doTranslate(item.data, {
      translateChart: item.chart,
      from,
      to: targetLang
    });
  })
  return Promise.all(promiseArray).then(transRes => {
    let outPutFileArrayResult: any[] = [];
    transRes.forEach(item => {
      outPutFileArrayResult = [...outPutFileArrayResult, ...item]
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
      const result = res.reduce(function (total, curr) {
        return total.concat(curr)
      }, []);
      const taskArray = getPartTransFun(result);
      for (let lang in config.outPutFolder) {
        await convertLang([...taskArray], {
          targetLang: lang as any,
          from: config.from,
          path: config.outPutFolder[lang]
        })
      }
      
    })
    .catch((err) => {
      // console.log(err);
    });
}


const getPartTransFun = (array: Dict) => {
  let currentArray: Dict = [];
  let translateChart = ""
  let promiseTaskArray: { data: Dict; chart: string; }[] = [];
  try {
    array.forEach(item => {
      if (translateChart.length >= 100) {
        translateChart = translateChart + '|' + item[Object.getOwnPropertyNames(item)[0]];
        currentArray.push(item);
        promiseTaskArray.push({
          data: currentArray,
          chart: translateChart
        })
        currentArray = [];
        translateChart = "";
      } else {
        translateChart = translateChart + '|' + item[Object.getOwnPropertyNames(item)[0]];
        currentArray.push(item)
      }
    })
    return promiseTaskArray;
  } catch (e) {
    return []
  }
}

// 获取翻译结果
const doTranslate = (partArray: string[], options: {
  translateChart: string;
} & translate.IOptions) => {
  const { translateChart, from, to} = options;
  return new Promise<string[]>(resolve => {
    translate(translateChart, {
      from,
      to,
      tld: 'cn'
    }).then(res => {
      const data = res.text.split('|').filter(item => {
        return item
      });
      const array = partArray.map((item, index) => {
        const format = item;
        format[Object.getOwnPropertyNames(format)[0]] = data[index]?.trim();
        return format;
      })
      resolve(array);
    })
  })
}

execFun()

export default execFun