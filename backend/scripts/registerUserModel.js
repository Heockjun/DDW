require('dotenv').config()
const mongoose = require('mongoose')

async function registerUserModel() {
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

    // 모델 등록
    mongoose.model('User', UserSchema)
    console.log('✅ User 모델 등록 완료')

    // 연결 종료
    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

registerUserModel()
