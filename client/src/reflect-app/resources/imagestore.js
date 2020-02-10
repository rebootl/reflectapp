import Compressor from 'compressorjs';
import { localapi } from './api-service.js';
import { uploadFile, uploadFileProgress } from './api_request_helpers.js';
import { uploadImageUrl } from './api-service.js';

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
    return image;
  }
  async getStoredImage(filename) {
    const db = await localapi.getSource('localimages');
    const [ image ] = await db.query({ filename: filename });
    console.log("get local image:", image.filename);
    const blob = await (await fetch(image.imageBase64)).blob()
    const f = new File([blob], filename);
    return f;
  }
  async deleteStoredImage(filename) {
    const db = await localapi.getSource('localimages');
    const r = await db.delete({ filename: filename });
    console.log("deleted local image:", filename);
    return r;
  }
  async uploadStoredImage(filename) {
    const imagefile = await this.getStoredImage(filename);
    const res = await this._uploadImage(imagefile);
    if (res.uploaded) {
      this.deleteStoredImage(filename);
    }
    return res;
  }
  // upload
  async _uploadImage(file) {
    const res = await uploadFile(uploadImageUrl, file);
    if (res.success) {
      console.log("uploaded image:", file.name);
      return {
        uploaded: true,
        filepath: res.filepath,
      };
    }
    console.log("uploading failed...:", file.name);
    return { uploaded: false };
  }
  async uploadImage(image) {
    const blob = await compressImage(image.file, 1920, 1920);
    const file = new File([blob], image.filename);
    const res = await this._uploadImage(file);
    if (res.uploaded) {
      image.uploaded = true;
      image.filepath = res.filepath;
      delete image.file;
      if (image.keepLocal) delete image.keepLocal;
      if (image.upload) delete image.upload;
    }
    return image;
  }
  // upload w/ progress
  async _uploadImageProgress(file, image, component) {
    const r = await uploadFileProgress(uploadImageUrl, file, image, component);
    if (r.success) console.log("uploaded image:", file.name);
    else console.log("uploading failed...:", file.name);
    return r;
  }
  async uploadImageProgress(image, component) {
    const blob = await compressImage(image.file, 1920, 1920);
    const file = new File([blob], image.filename);
    return await this._uploadImageProgress(file, image, component);
  }
}

export const imagestore = new ImageStore();
