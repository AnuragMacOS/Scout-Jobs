const bcrypt = require('bcrypt');
const { z } = require('zod');
const prisma = require('../config/db');

const personalSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  rollNo: z.string().trim().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  abcId: z.string().trim().optional().nullable(),
  mobile: z.string().trim().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  graduationYear: z.coerce.number().int().min(2020).max(2035).optional().nullable(),
});

const academicSchema = z.object({
  universityName: z.string().trim().optional().nullable(),
  yearOfGraduation: z.coerce.number().int().min(2020).max(2035).optional().nullable(),
  course: z.string().trim().optional().nullable(),
  branch: z.string().trim().optional().nullable(),
  aggregateCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  tenthPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  twelfthPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
          orderBy: { slotNumber: 'asc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ profile: user });
  } catch (err) {
    console.error('[getProfile error]', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

async function updatePersonal(req, res) {
  try {
    const validated = personalSchema.parse(req.body);
    const userId = req.user.id;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        rollNo: validated.rollNo || null,
        gender: validated.gender || null,
        abcId: validated.abcId || null,
        mobile: validated.mobile || null,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        graduationYear: validated.graduationYear || null,
      },
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
      },
    });

    res.json({
      message: 'Personal details updated successfully!',
      user: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[updatePersonal error]', err);
    res.status(500).json({ error: 'Failed to update personal details.' });
  }
}

async function updateAcademic(req, res) {
  try {
    const validated = academicSchema.parse(req.body);
    const userId = req.user.id;

    const academic = await prisma.academicInfo.upsert({
      where: { userId },
      update: {
        universityName: validated.universityName || null,
        yearOfGraduation: validated.yearOfGraduation || null,
        course: validated.course || null,
        branch: validated.branch || null,
        aggregateCgpa: validated.aggregateCgpa,
        tenthPercentage: validated.tenthPercentage,
        twelfthPercentage: validated.twelfthPercentage,
      },
      create: {
        userId,
        universityName: validated.universityName || null,
        yearOfGraduation: validated.yearOfGraduation || null,
        course: validated.course || null,
        branch: validated.branch || null,
        aggregateCgpa: validated.aggregateCgpa,
        tenthPercentage: validated.tenthPercentage,
        twelfthPercentage: validated.twelfthPercentage,
      },
    });

    res.json({
      message: 'Academic details updated successfully!',
      academicInfo: academic,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[updateAcademic error]', err);
    res.status(500).json({ error: 'Failed to update academic details.' });
  }
}

async function changePassword(req, res) {
  try {
    const validated = passwordSchema.parse(req.body);
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const passwordHash = await bcrypt.hash(validated.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[changePassword error]', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
}

module.exports = {
  getProfile,
  updatePersonal,
  updateAcademic,
  changePassword,
};
