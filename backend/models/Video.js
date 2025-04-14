const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  outputPath: { type: String }, // 워터마크된 파일 경로
})

module.exports = mongoose.model('Video', videoSchema)
