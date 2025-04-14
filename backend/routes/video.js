const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { spawn } = require('child_process')
const authMiddleware = require('../middleware/authMiddleware')
const Video = require('../models/Video')

const upload = multer({ dest: 'uploads/' })

router.post('/upload', authMiddleware, upload.single('video'), (req, res) => {
  const inputPath = req.file.path
  const outputPath = path.join('watermarked', req.file.filename + '_wm.mp4')

  const python = spawn('python', [
    'scripts/watermark.py',
    inputPath,
    outputPath,
  ])

  // ✅ stdout 로그 확인
  python.stdout.on('data', (data) => {
    console.log(`워터마크 로그: ${data.toString()}`)
  })

  // ✅ stderr 로그 확인
  python.stderr.on('data', (data) => {
    console.error(`워터마크 에러: ${data.toString()}`)
  })

  // ✅ 종료 시 응답 처리
  python.on('close', async (code) => {
    if (code === 0) {
      try {
        const video = new Video({
          filename: req.file.filename,
          originalName: req.file.originalname,
          user: req.user.userId,
          outputPath,
        })

        await video.save()
        res.json({ message: '업로드 및 워터마킹 완료', outputPath })
      } catch (err) {
        console.error('DB 저장 실패:', err)
        res.status(500).json({ message: 'DB 저장 중 오류 발생' })
      }
    } else {
      res.status(500).json({ message: '워터마킹 실패' })
    }
  })
})

module.exports = router
