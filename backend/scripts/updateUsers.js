require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

async function updateUsers() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB 연결 성공')

    // 모든 사용자 문서 확인
    const users = await User.find({})
    console.log(`총 ${users.length}명의 사용자 발견`)

    // 각 사용자 문서 업데이트
    for (const user of users) {
      console.log(`사용자 ${user._id} 업데이트 중...`)

      // username이 없는 경우 이메일에서 생성
      if (!user.username) {
        user.username = user.email.split('@')[0]
      }

      // 구독 필드가 없거나 undefined인 경우 업데이트
      if (!user.subscription || user.subscription === undefined) {
        user.subscription = null
        user.subscriptionExpiresAt = null
      }

      await user.save()
      console.log(`사용자 ${user._id} 업데이트 완료`)
    }

    console.log('✅ 모든 사용자 업데이트 완료')

    // 연결 종료
    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

updateUsers()
