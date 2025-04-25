const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    outputPath: {
      type: String,
    },
    watermark: {
      text: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        enum: [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
          'center',
        ],
        default: 'bottom-right',
      },
      opacity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.models.Video || mongoose.model('Video', VideoSchema)
