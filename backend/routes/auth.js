const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()

// MongoDB 사용자 모델
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})
const User = mongoose.model('User', userSchema)

const router = express.Router()

// 회원가입 API
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: '회원가입 성공!' })
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error })
  }
})

// 로그인 API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: '모든 필드를 입력하세요.' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(400)
        .json({ message: '잘못된 이메일 또는 비밀번호입니다.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: '잘못된 이메일 또는 비밀번호입니다.' })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.json({ token })
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error })
  }
})

module.exports = router
