const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// 사용자 스키마 정의
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

// 비밀번호 해싱 (저장 전에 암호화)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// 비밀번호 비교 메서드 (로그인 시 사용)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// 모델 생성
const User = mongoose.models.User || mongoose.model('User', UserSchema)

module.exports = User
