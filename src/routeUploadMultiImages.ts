import { storeImage } from './imageStorage.js';

export default async (req : any, res : any) => {
  if (!req.user) {
    console.log('unallowed image upload rejected');
    res.sendStatus(401);
    return;
  }
  //console.log(req.user)
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let files = [];
  const filedata = req.files.filedata;
  if (Array.isArray(filedata)) {
    files = await Promise.all(filedata.map(async (f) => await storeImage(f)));
  } else {
    files.push(await storeImage(filedata));
  }
  //console.log(files)
  res.send({
    success: true,
    files: files
  });
}
