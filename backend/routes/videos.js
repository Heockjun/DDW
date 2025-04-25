const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const Video = require('../models/Video')
const authMiddleware = require('../middleware/authMiddleware')

// 업로드된 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('지원하지 않는 파일 형식입니다.'))
    } else {
      cb(null, true)
    }
  },
})

// 동영상 업로드
router.post(
  '/upload',
  authMiddleware,
  upload.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '동영상 파일이 필요합니다.' })
      }

      const {
        title,
        description,
        watermarkText,
        watermarkPosition,
        watermarkOpacity,
      } = req.body

      const video = new Video({
        user: req.user.userId,
        title: title || req.file.originalname,
        description: description || '',
        originalName: req.file.originalname,
        filePath: req.file.path,
        watermark: {
          text: watermarkText,
          position: watermarkPosition,
          opacity: watermarkOpacity,
        },
        status: 'processing',
      })

      await video.save()

      // TODO: 워터마크 처리 작업을 큐에 추가

      res.json({
        message: '동영상이 업로드되었습니다.',
        videoId: video._id,
      })
    } catch (error) {
      console.error('동영상 업로드 실패:', error)
      res.status(500).json({ message: '동영상 업로드에 실패했습니다.' })
    }
  }
)

// 동영상 목록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.userId }).sort({
      createdAt: -1,
    })
    res.json(videos)
  } catch (error) {
    console.error('동영상 목록 조회 실패:', error)
    res.status(500).json({ message: '동영상 목록을 불러오는데 실패했습니다.' })
  }
})

// 동영상 상세 정보 조회
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!video) {
      return res.status(404).json({ message: '동영상을 찾을 수 없습니다.' })
    }

    res.json(video)
  } catch (error) {
    console.error('동영상 조회 실패:', error)
    res.status(500).json({ message: '동영상을 불러오는데 실패했습니다.' })
  }
})

// 동영상 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const video = await Video.findOne({
      _id: req.params.id,
      user: req.user.userId,
    })

    if (!video) {
      return res.status(404).json({ message: '동영상을 찾을 수 없습니다.' })
    }

    // 파일 삭제
    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath)
    }

    await video.remove()
    res.json({ message: '동영상이 삭제되었습니다.' })
  } catch (error) {
    console.error('동영상 삭제 실패:', error)
    res.status(500).json({ message: '동영상 삭제에 실패했습니다.' })
  }
})

module.exports = router
