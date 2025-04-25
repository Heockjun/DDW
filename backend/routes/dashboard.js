const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware') // 미들웨어 가져오기
const User = require('../models/User')
const Video = require('../models/Video')

router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 사용자의 비디오 통계 계산
    const totalVideos = await Video.countDocuments({ user: req.user.userId })
    const completedVideos = await Video.countDocuments({
      user: req.user.userId,
      status: 'completed',
    })
    const processingVideos = await Video.countDocuments({
      user: req.user.userId,
      status: 'processing',
    })

    // 최근 비디오 목록 가져오기
    const recentVideos = await Video.find({ user: req.user.userId })
      .sort({ uploadDate: -1 })
      .limit(5)
      .select('title status uploadDate')

    res.json({
      name: user.username,
      email: user.email,
      subscription: user.subscription,
      totalVideos,
      stats: {
        completed: completedVideos,
        processing: processingVideos,
      },
      recentVideos: recentVideos.map((video) => ({
        id: video._id,
        title: video.title,
        status: video.status,
        date: video.uploadDate.toLocaleDateString(),
      })),
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
