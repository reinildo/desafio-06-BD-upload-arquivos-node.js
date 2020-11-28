import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const directory = path.resolve(__dirname, '..', '..', 'tmp');

const config = {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename(req, file, callback) {
      const hash = crypto.randomBytes(10).toString('hex');
      const filename = `${hash}-${file.originalname}`;
      callback(null, filename);
    },
  }),
};

export default config;
