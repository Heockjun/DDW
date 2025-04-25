const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Video = require('../models/Video')
const authMiddleware = require('../middleware/authMiddleware') // ✅ 명칭 통일

// Get current user information
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('사용자 정보 조회 요청:', req.user.userId)

    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      console.log('사용자를 찾을 수 없음:', req.user.userId)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    console.log('조회된 사용자 정보:', {
      _id: user._id,
      email: user.email,
      subscription: user.subscription,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    })

    res.json(user)
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    res.status(500).json({ message: '서버 오류가 발생했습니다.' })
  }
})

// Get user videos
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
