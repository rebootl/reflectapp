import Compressor from 'compressorjs';
import { localapi } from './api-service.js';
import { uploadMultiFilesGenerator } from './api_request_helpers.js';
import { uploadMultiImagesUrl } from './api-service.js';

export const compressImage = (file, maxWidth=1920, maxHeight=1920) => {
  return new Promise((res, rej) => {
    new Compressor(file, {
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      success(result) {
        res(result);
      },
      error(err) {
        rej(err);
      }
    });
  });
};

// base64 encode data
export const encodeData = (file) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      res(reader.result);
    }
    reader.readAsDataURL(file);
  });
};

class ImageStore {
  // local storage
  async storeImage(image) {
    const blob = await compressImage(image.file, 1920, 1920);
    const db = await localapi.getSource('localimages');
    await db.add({
      filename: image.filename,
      imageBase64: await encodeData(blob),
    });
    console.log("stored image locally:", image.filename);
    delete image.file;
    if (image.failed) delete image.failed;
    return image;
  }
  async getStoredImage(filename) {
    const db = await localapi.getSource('localimages');
    const [ image ] = await db.query({ filename: filename });
    if (!image) return false;
    console.log("got local image:", filename);
    const blob = await (await fetch(image.imageBase64)).blob();
    const f = new File([blob], filename);
    return f;
  }
  async isStoredImage(filename) {
    const db = await localapi.getSource('localimages');
    const [ image ] = await db.query({ filename: filename });
    if (!image) {
      //console.log("stored image not found:", filename)
      return false;
    }
    //console.log("stored image found:", filename)
    return true;
  }
  async deleteStoredImage(filename) {
    const db = await localapi.getSource('localimages');
    const r = await db.delete({ filename: filename });
    console.log("deleted local image:", filename);
    return r;
  }
  // upload local storage
  async *uploadMultiStoredImagesGenerator(images) {
    const files = await Promise.all(images.map(async (i) => {
      return await this.getStoredImage(i.filename)
    }));
    for (const f of files) {
      if (!f) {
        yield {
          result: 'notfound',
        };
        return;
      }
    }
    for await (const r of uploadMultiFilesGenerator(uploadMultiImagesUrl, files)) {
      yield r;
    }
  }
  // upload w/ progress
  async *uploadMultiImagesGenerator(images) {
    const files = await Promise.all(images.map(async (i)=>{
      const blob = await compressImage(i.file, 1920, 1920);
      return new File([blob], i.filename);
    }));
    for await (const r of uploadMultiFilesGenerator(uploadMultiImagesUrl, files)) {
      yield r;
    }
  }
}

export const imagestore = new ImageStore();
