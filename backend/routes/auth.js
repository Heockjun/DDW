const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()

// User 스키마 정의
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    default: function () {
      return this.email.split('@')[0]
    },
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  subscription: {
    type: String,
    enum: ['tier-starter', 'tier-pro', 'tier-enterprise', null],
    default: null,
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null,
  },
})

// User 모델 등록
const User = mongoose.model('User', UserSchema)

const router = express.Router()

// 회원가입 API
router.post('/register', async (req, res) => {
  try {
    console.log('회원가입 요청 받음:', req.body)
    const { email, password } = req.body
    if (!email || !password) {
      console.log('필수 필드 누락:', { email, password })
      return res.status(400).json({ message: '모든 필드를 입력하세요.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('이미 존재하는 사용자:', email)
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('비밀번호 해싱 완료')

    const newUser = new User({
      email,
      password: hashedPassword,
      username: email.split('@')[0], // username 자동 생성
    })
    console.log('새 사용자 객체 생성:', newUser)

    await newUser.save()
    console.log('사용자 저장 완료:', newUser._id)

    res.status(201).json({ message: '회원가입 성공!' })
  } catch (error) {
    console.error('회원가입 오류:', error)
    res.status(500).json({ message: '서버 오류', error: error.message })
  }
})

// 로그인 API
router.post('/login', async (req, res) => {
  try {
    console.log('로그인 요청 받음:', req.body)
    const { email, password } = req.body
    if (!email || !password) {
      console.log('필수 필드 누락:', { email, password })
      return res.status(400).json({ message: '모든 필드를 입력하세요.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      console.log('사용자를 찾을 수 없음:', email)
      return res
        .status(400)
        .json({ message: '잘못된 이메일 또는 비밀번호입니다.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log('비밀번호 불일치:', email)
      return res
        .status(400)
        .json({ message: '잘못된 이메일 또는 비밀번호입니다.' })
    }

    // 토큰 만료 시간을 7일로 설정
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    console.log('로그인 성공, 토큰 발급:', {
      userId: user._id,
      email: user.email,
      subscription: user.subscription,
    })

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      },
    })
  } catch (error) {
    console.error('로그인 오류:', error)
    res.status(500).json({ message: '서버 오류', error: error.message })
  }
})

module.exports = router
