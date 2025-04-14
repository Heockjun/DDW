const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: decoded.userId }
    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' })
  }
}

module.exports = authMiddleware
