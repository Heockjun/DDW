require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

// ✅ 1. 미들웨어 먼저 등록
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// ✅ 2. 라우터 등록
app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/user'))
app.use('/api', require('./routes/dashboard'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/videos', require('./routes/video'))
app.use('/watermarked', express.static('watermarked'))

// ✅ 3. 루트 라우트
app.get('/', (req, res) => {
  res.send('백엔드 서버 정상 실행')
})

// ✅ 4. MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch((err) => console.error('❌ MongoDB 연결 실패:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`))
