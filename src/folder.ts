import path from 'path';
import fs from 'fs';
import { TranslateConfig } from './typings';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export function promisify(fn: any): (path: fs.PathLike) => Promise<any> {
  return function () {
    const args = arguments;
    return new Promise(function (resolve, reject) {
      [].push.call(args, function (err, result) {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          resolve(result);
        }
      });
      fn.apply(null, args);
    });
  }
}

export function readDirRecur(file: string, suffix: string, callback: { (filePath: string): void; (arg0: string): any; }) {
  return readdir(file).then((files) => {
    files = files.map((item) => {
      const fullPath = file + '/' + item;
      return stat(fullPath).then((stats) => {
        if (stats.isDirectory()) {
          return readDirRecur(fullPath, suffix, callback);
        } else {
          if (item[0] == '.' || item.indexOf(suffix) == -1) {} else {
            callback && callback(fullPath)
          }
        }
      })
    });
    return Promise.all(files);
  });
}


export const getProjectAllTSXFile = (config: TranslateConfig): Promise<string[]> => {
  const fileList: string[] = []
  const timeStart = new Date().getTime();
  const filePath = path.resolve(config.readFolder)
  console.log(`>>>>>>开始读取：${config.readFolder}`);
  return new Promise(resolve => {
    readDirRecur(filePath, config.suffix, function (filePath) {
      fileList.push(filePath)
    }).then(function () {
      console.log(`>>>>>>读取完成：共${fileList.length}个文件，${new Date().getTime() - timeStart}ms `);
      resolve(fileList);
    }).catch(function (err) {
      console.log("ERRRRR:>>>>>" + err);
    });
  })
}