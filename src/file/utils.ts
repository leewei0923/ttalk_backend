import path from 'path';
import fs from 'fs';

/**
 * 判断文件夹是否存在，不存在可以直接创建
 * @param reaPath {String} 文件路径
 * @returns {Promise<boolean>}
 */
exports.exitsFolder = async function (reaPath: string) {
  const absPath = path.resolve(__dirname, reaPath);
  try {
    await fs.promises.stat(absPath);
  } catch (e) {
    // 不存在文件夹，直接创建 {recursive: true} 这个配置项是配置自动创建多个文件夹
    await fs.promises.mkdir(absPath, { recursive: true });
  }
};

// 同步写法：
exports.exitsFolder = async function (reaPath: string) {
  const absPath = path.resolve(__dirname, reaPath);

  fs.stat(absPath, function (err, stats) {
    if (!stats) {
      fs.mkdir(absPath, { recursive: true }, (err) => {
        if (err) throw err;
      }); //Create dir in case not found
    }
  });
};
