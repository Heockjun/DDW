require('dotenv').config()
const mongoose = require('mongoose')

async function backupUsers() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB 연결 성공')

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

    // 모든 사용자 데이터 조회
    const users = await User.find({})
    console.log(`총 ${users.length}명의 사용자 데이터 발견`)

    // 백업 데이터 준비
    const backupData = users.map((user) => ({
      email: user.email,
      password: user.password,
      subscription: user.subscription,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    }))

    // 백업 파일 저장
    const fs = require('fs')
    fs.writeFileSync('user_backup.json', JSON.stringify(backupData, null, 2))
    console.log('✅ 사용자 데이터 백업 완료')

    // 연결 종료
    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

backupUsers()
