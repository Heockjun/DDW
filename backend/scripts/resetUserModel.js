require('dotenv').config()
const mongoose = require('mongoose')

async function resetUserModel() {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB 연결 성공')

    // 기존 User 컬렉션 삭제
    await mongoose.connection.dropCollection('users')
    console.log('✅ users 컬렉션 삭제 완료')

    // 기존 User 모델 삭제
    delete mongoose.connection.models['User']
    console.log('✅ 기존 User 모델 삭제 완료')

    // 새로운 User 모델 생성
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

    // 모델 생성
    mongoose.model('User', UserSchema)
    console.log('✅ 새로운 User 모델 생성 완료')

    // 연결 종료
    await mongoose.disconnect()
    console.log('✅ MongoDB 연결 종료')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  }
}

resetUserModel()
