const bcrypt = require('bcrypt');
const { z } = require('zod');
const prisma = require('../config/db');
const env = require('../config/env');
const {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
  generateResetToken,
  decodeToken,
  verifyResetToken,
} = require('../utils/jwt');

const signupSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  rollNo: z.string().trim().min(1, 'Roll number is required'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

async function signup(req, res) {
  try {
    const validated = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        passwordHash,
        rollNo: validated.rollNo,
        role: 'student',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rollNo: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Account created successfully',
      user,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('[Signup error]', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user.id, role: user.role });
    setTokenCookie(res, token);

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      rollNo: user.rollNo,
      role: user.role,
      gender: user.gender,
      mobile: user.mobile,
      graduationYear: user.graduationYear,
    };

    res.json({
      message: 'Logged in successfully',
      user: safeUser,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Login error]', err);
    res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
}

async function logout(req, res) {
  clearTokenCookie(res);
  res.json({ message: 'Logged out successfully' });
}

async function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Fetch student's academic info and resumes if available
  const fullProfile = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      rollNo: true,
      gender: true,
      abcId: true,
      mobile: true,
      dateOfBirth: true,
      graduationYear: true,
      role: true,
      academicInfo: true,
      resumes: {
        select: {
          id: true,
          slotNumber: true,
          originalFilename: true,
          fileUrl: true,
          uploadedAt: true,
        },
        orderBy: { slotNumber: 'asc' },
      },
    },
  });

  if (!fullProfile) {
    clearTokenCookie(res);
    return res.status(401).json({ error: 'User account no longer exists' });
  }

  res.json({ user: fullProfile });
}

async function forgotPassword(req, res) {
  try {
    const validated = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'No registered student or user found with this email address.',
      });
    }

    const resetToken = generateResetToken(user.id, user.email, user.passwordHash);
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    console.log(`[Password Reset] Generated reset link for ${user.email}: ${resetUrl}`);

    res.json({
      message: 'Password reset instructions have been generated.',
      email: user.email,
      resetToken,
      resetUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Forgot password error]', err);
    res.status(500).json({ error: 'Failed to process password reset request. Please try again.' });
  }
}

async function verifyResetTokenController(req, res) {
  try {
    const token = req.query.token || req.body.token;
    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }

    const decoded = decodeToken(token);
    if (!decoded || !decoded.userId || decoded.purpose !== 'pwd_reset') {
      return res.status(400).json({ error: 'Invalid or expired password reset link' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, passwordHash: true, firstName: true },
    });

    if (!user) {
      return res.status(400).json({ error: 'User associated with this token was not found' });
    }

    const verified = verifyResetToken(token, user.passwordHash);
    if (!verified) {
      return res.status(400).json({
        error: 'This reset link has expired or has already been used. Please request a new one.',
      });
    }

    res.json({
      valid: true,
      email: user.email,
      firstName: user.firstName,
    });
  } catch (err) {
    console.error('[Verify reset token error]', err);
    res.status(400).json({ error: 'Invalid or expired password reset link' });
  }
}

async function resetPassword(req, res) {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    const decoded = decodeToken(validated.token);
    if (!decoded || !decoded.userId || decoded.purpose !== 'pwd_reset') {
      return res.status(400).json({ error: 'Invalid or expired password reset link' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'User account not found' });
    }

    const verified = verifyResetToken(validated.token, user.passwordHash);
    if (!verified) {
      return res.status(400).json({
        error: 'This password reset link has expired or has already been used. Please request a new link.',
      });
    }

    const passwordHash = await bcrypt.hash(validated.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Automatically authenticate the user after resetting their password
    const authToken = generateToken({ userId: user.id, role: user.role });
    setTokenCookie(res, authToken);

    res.json({
      message: 'Password updated successfully. You are now logged in.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[Reset password error]', err);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
}

async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required.' });
    }

    // Verify the Google ID token using google-auth-library
    const { OAuth2Client } = require('google-auth-library');
    OAuth2Client.CLOCK_SKEW_SECS_ = 86400; // Allow clock drift between local machine and Google servers
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn('[Google verifyIdToken failed, trying Google tokeninfo endpoint]:', verifyErr.message);
      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
        );
        if (!tokenInfoRes.ok) {
          console.error('[Google tokeninfo failed]', await tokenInfoRes.text());
          return res.status(401).json({ error: 'Invalid Google credential. Please try again.' });
        }
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
          console.error('[Google token audience mismatch]', tokenInfo.aud, '!=', env.GOOGLE_CLIENT_ID);
          return res.status(401).json({ error: 'Google credential audience mismatch. Please try again.' });
        }
        payload = tokenInfo;
      } catch (fallbackErr) {
        console.error('[Google token verification fallback failed]', fallbackErr);
        return res.status(401).json({ error: 'Invalid Google credential. Please try again.' });
      }
    }

    const userEmail = payload.email.toLowerCase().trim();
    const firstName = payload.given_name || payload.name?.split(' ')[0] || 'Student';
    const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'User';

    // Check if user exists in PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // Auto-provision student profile if first time signing in via Google
    if (!user) {
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          email: userEmail,
          firstName,
          lastName,
          passwordHash,
          role: 'student',
          rollNo: `G-${Date.now().toString().slice(-5)}`,
        },
      });
    }

    // Set signed JWT session cookie
    const token = generateToken({ userId: user.id, role: user.role });
    setTokenCookie(res, token);

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      rollNo: user.rollNo,
      role: user.role,
      gender: user.gender,
      mobile: user.mobile,
      graduationYear: user.graduationYear,
    };

    res.json({
      message: 'Signed in with Google successfully',
      user: safeUser,
    });
  } catch (err) {
    console.error('[Google auth error]', err);
    res.status(500).json({ error: 'Failed to authenticate with Google. Please try again.' });
  }
}

module.exports = {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  verifyResetToken: verifyResetTokenController,
  resetPassword,
  googleAuth,
};
