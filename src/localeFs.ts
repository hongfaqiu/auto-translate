import fs from 'fs';
import path from 'path';
import { Dict, TranslateConfig } from './typings';

/**
 * 删除文件夹下所有文件及将文件夹下所有文件清空-同步方法
 * @param {*} path
 */
 function emptyDir(path: fs.PathLike) {
  const files = fs.readdirSync(path);
  files.forEach(file => {
      const filePath = `${path}/${file}`;
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
          emptyDir(filePath);
      } else {
          fs.unlinkSync(filePath);
          console.log(`删除${file}文件成功`);
      }
  });
}

/**
* 删除指定路径下的所有空文件夹-同步方法
* @param {*} path
*/
function rmEmptyDir(path: fs.PathLike, level=0) {
  const files = fs.readdirSync(path);
  if (files.length > 0) {
      let tempFile = 0;
      files.forEach(file => {
          tempFile++;
          rmEmptyDir(`${path}/${file}`, 1);
      });
      if (tempFile === files.length && level !== 0) {
          fs.rmdirSync(path);
      }
  }
  else {
      level !==0 && fs.rmdirSync(path);
  }
}

/**
* 清空指定路径下的所有文件及文件夹-同步方法
* @param {*} path
*/
export function clearDir(path: fs.PathLike) {
  emptyDir(path);
  rmEmptyDir(path);
}

/**
* 递归创建目录 同步方法
* @param {*} dirname
*/
const mkdirsSync = (dirname: string) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
    }
  }
  return false;
}

//写入文件
export const writeToFilePath = (info: {}, output: string) => {
  const time = new Date().getTime();
  try {
    const file = path.resolve(output);
    const dir = file.substring(0, file.lastIndexOf('\\') + 1)
    mkdirsSync(dir)
    const str = `export default${JSON.stringify(info)}`
    const result = str.replace(/\",/g, "\",\n   ").replace(/\":\"/g, "\": \"").replace(/t{/g, "t {\n   ").replace(/\"}/g, "\"\n}");
    // 异步写入数据到文件
    fs.writeFile(file, result, {
      encoding: 'utf8'
    }, (err) => {
      if (!err) {
        console.log(`>>>>>>写入${output}  成功：${ new Date().getTime() - time }ms`)
      }
    });
  } catch (e) {
    console.log(e)
  }
};

// 根据路径获取文件内容，识别文件内容
export const getFileContent = (path: fs.PathLike, config: TranslateConfig) => {
  return new Promise<Dict>((resolve, reject) => {
    const result: Dict | PromiseLike<Dict> = [];
    const buf = Buffer.alloc(102400000);
    fs.open(path, 'r+', function (err, fd) {
      if (err) {
        resolve(result)
      }
      try {
        fs.read(fd, buf, 0, buf.length, 0, function (err, bytes) {
          if (err || bytes == 0) {
            resolve(result)
          } else {
            const source = buf.slice(0, bytes).toString(); //转为字符串
            const keyValuesReg = /(\'|\")(.*?)(\'\,|\"\,)/ig;
            let matchs = source.match(keyValuesReg);
            if (matchs) {
              matchs.forEach((item, index) => {
                const ObjStr = item.split(':');
                // const key = /(\')(.*?)(\'\:")/;
                const reg = new RegExp('\'|\"', "g")
                const breakReg = new RegExp('\n', "g")
                const breakReg2 = new RegExp(/&nbsp;/ig, "g")
                const key = ObjStr[0] ? ObjStr[0].replace(reg, '').trim() : '';
                const value = ObjStr[1] ? ObjStr[1].replace(reg, '').replace(breakReg, '').replace(breakReg2, '').replace(',', '').trim() : '';
                if (key && value) {
                  result.push({
                    key, value
                  });
                }
              })
            }
            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  })
};