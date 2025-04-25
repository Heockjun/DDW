require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')

async function restoreUsers() {
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

    // 백업 파일 읽기
    const backupData = JSON.parse(fs.readFileSync('user_backup.json', 'utf8'))
    console.log(`총 ${backupData.length}명의 사용자 데이터 발견`)

    // 각 사용자 데이터 복원
    for (const userData of backupData) {
      console.log(`사용자 ${userData.email} 복원 중...`)

      const user = new User({
        email: userData.email,
        password: userData.password,
        subscription: userData.subscription,
        subscriptionExpiresAt: userData.subscriptionExpiresAt,
      })

      await user.save()
      console.log(`사용자 ${userData.email} 복원 완료`)
    }

    console.log('✅ 모든 사용자 데이터 복원 완료')

    // 연결 종료
    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

restoreUsers()
