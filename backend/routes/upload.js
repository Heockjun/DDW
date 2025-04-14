const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

// 저장 위치 및 파일명 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // uploads 폴더에 저장
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// 업로드 라우트
router.post('/', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '파일이 없습니다.' })
  }

  res.json({
    message: '업로드 성공!',
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  })
})

module.exports = router
