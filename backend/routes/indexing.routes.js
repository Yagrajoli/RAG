import express from 'express';
const router = express.Router();
import {indexingController} from "../controllers/indexing.controllers.js"
import multer from 'multer';


// multer setup

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

// Define your routes here

router.post('/index', upload.single('file'), indexingController);

export default router;