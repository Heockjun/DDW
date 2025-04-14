const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Video = require('../models/Video')
const authMiddleware = require('../middleware/authMiddleware') // ✅ 명칭 통일

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '서버 오류' })
  }
})

router.get('/videos', authMiddleware, async (req, res) => {
  try {
    const videos = await Video.find({ user: req.user.userId }).sort({
      uploadDate: -1,
    })
    res.json(videos)
  } catch (err) {
    console.error('내 영상 조회 실패:', err)
    res.status(500).json({ message: '영상 불러오기 실패' })
  }
})

module.exports = router
