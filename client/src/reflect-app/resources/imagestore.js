import Compressor from 'compressorjs';
import { localapi } from './api-service.js';
import { uploadFile } from './api_request_helpers.js';
import { uploadImageUrl } from './api-service.js';

export const compressImage = (file, maxWidth=1920, maxHeight=1920) => {
  return new Promise((res, rej) => {
    new Compressor(file, {
      maxWidth,
      maxHeight,
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
  async storeImage(image) {
    const imageBlob = await compressImage(image.file, 1920, 1920);
    const db = await localapi.getSource('localimages');
    await db.add({
      filename: image.filename,
      imageBlobData: await encodeData(imageBlob),
    });
    console.log("stored image locally:", image.filename);
  }
  async storeImages(images) {
    for (const image of images) {
      await this.storeImage(image);
      delete image.file;
    }
    return images;
  }
  async uploadImages(images) {
    for (const image of images) {
      const imageBlob = await compressImage(image.file, 1920, 1920);
      const res = await uploadFile(uploadImageUrl, imageBlob);
      if (res.success) {
        image.uploaded = true;
        image.filepath = res.filepath;
        delete image.file;
        console.log("uploaded image:", image.filename);
      }
      // -> if not success store local -> or throw maybe... ????
    }
    return images;
  }
  async uploadStoredImage(filename) {
    // -> todo
  }
  async getImage(filename) {
    const db = await localapi.getSource('localimages');
    const [ image ] = await db.query({ filename: filename });
    console.log("get local image:", image.filename)
    // -> decode
    return image;
  }
}

export const imagestore = new ImageStore();
