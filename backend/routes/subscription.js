const express = require('express')
const router = express.Router()
const User = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

// 구독 상태 확인
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    res.json({ subscription: user.subscription })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 구독 업그레이드
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    // 이미 프리미엄 구독자인 경우
    if (user.subscription === 'premium') {
      return res.status(400).json({ message: 'Already a premium subscriber' })
    }

    // 결제 처리 로직 (실제 구현 필요)
    // const paymentResult = await processPayment(req.body.paymentInfo)

    // 결제 성공 시 구독 업그레이드
    user.subscription = 'premium'
    await user.save()

    res.json({
      message: 'Subscription upgraded to premium',
      subscription: user.subscription,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 구독 취소
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    // 이미 무료 구독자인 경우
    if (user.subscription === 'free') {
      return res.status(400).json({ message: 'Already a free subscriber' })
    }

    user.subscription = 'free'
    await user.save()

    res.json({
      message: 'Subscription cancelled',
      subscription: user.subscription,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 구독 처리
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body
    console.log('구독 요청 받음:', { userId: req.user.userId, plan })

    // 유효한 플랜인지 확인
    const validPlans = ['tier-starter', 'tier-pro', 'tier-enterprise']
    if (!validPlans.includes(plan)) {
      console.log('잘못된 플랜:', plan)
      return res.status(400).json({ message: '잘못된 플랜입니다.' })
    }

    // 사용자 정보 업데이트
    const user = await User.findById(req.user.userId)
    if (!user) {
      console.log('사용자를 찾을 수 없음:', req.user.userId)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    console.log('현재 사용자 구독 상태:', user.subscription)

    // 구독 정보 업데이트
    user.subscription = plan
    user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후 만료

    try {
      await user.save()
      console.log('구독 정보 업데이트 성공:', {
        subscription: user.subscription,
        expiresAt: user.subscriptionExpiresAt,
      })
    } catch (saveError) {
      console.error('구독 정보 저장 실패:', saveError)
      throw saveError
    }

    res.json({
      message: '구독이 성공적으로 처리되었습니다.',
      subscription: {
        plan: user.subscription,
        expiresAt: user.subscriptionExpiresAt,
      },
    })
  } catch (error) {
    console.error('구독 처리 실패:', error)
    res.status(500).json({ message: '구독 처리 중 오류가 발생했습니다.' })
  }
})

// 구독 정보 조회
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'subscription subscriptionExpiresAt'
    )
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    console.log('구독 정보 조회:', {
      userId: req.user.userId,
      subscription: user.subscription,
      expiresAt: user.subscriptionExpiresAt,
    })

    res.json({
      subscription: user.subscription,
      expiresAt: user.subscriptionExpiresAt,
    })
  } catch (error) {
    console.error('구독 정보 조회 실패:', error)
    res.status(500).json({ message: '구독 정보를 불러오는데 실패했습니다.' })
  }
})

module.exports = router
