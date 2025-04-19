import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Multer extends Multer {}
  }
} 