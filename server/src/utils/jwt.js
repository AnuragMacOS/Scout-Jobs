const jwt = require('jsonwebtoken');
const env = require('../config/env');

const COOKIE_NAME = 'scout_token';

function generateToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function setTokenCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function clearTokenCookie(res) {
  const isProduction = env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
}

function generateResetToken(userId, email, passwordHash) {
  return jwt.sign(
    { userId, email, purpose: 'pwd_reset' },
    env.JWT_SECRET + passwordHash,
    { expiresIn: '15m' }
  );
}

function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}

function verifyResetToken(token, passwordHash) {
  try {
    return jwt.verify(token, env.JWT_SECRET + passwordHash);
  } catch (err) {
    return null;
  }
}

module.exports = {
  COOKIE_NAME,
  generateToken,
  verifyToken,
  generateResetToken,
  decodeToken,
  verifyResetToken,
  setTokenCookie,
  clearTokenCookie,
};
