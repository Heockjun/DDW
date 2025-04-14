const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware') // 미들웨어 가져오기

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `드디어 됐다,  ${req.user.id}` })
})

module.exports = router
