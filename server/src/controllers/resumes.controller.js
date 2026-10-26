const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a valid PDF resume file to upload.' });
    }

    const userId = req.user.id;
    const slotNumber = parseInt(req.body.slotNumber || '1', 10);

    if (![1, 2].includes(slotNumber)) {
      // Clean up uploaded temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Slot number must be either 1 or 2.' });
    }

    // Check if a resume already exists in this slot
    const existing = await prisma.resume.findUnique({
      where: {
        userId_slotNumber: {
          userId,
          slotNumber,
        },
      },
    });

    if (existing && existing.fileUrl) {
      const oldFilePath = path.join(__dirname, '../../uploads', path.basename(existing.fileUrl));
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.warn('Could not delete old resume file:', e.message);
        }
      }
    }

    const fileUrl = `/api/resumes/file/${path.basename(req.file.path)}`;

    const resume = await prisma.resume.upsert({
      where: {
        userId_slotNumber: {
          userId,
          slotNumber,
        },
      },
      update: {
        fileUrl,
        originalFilename: req.file.originalname,
        uploadedAt: new Date(),
      },
      create: {
        userId,
        slotNumber,
        fileUrl,
        originalFilename: req.file.originalname,
      },
    });

    res.status(201).json({
      message: `Resume ${slotNumber} uploaded successfully!`,
      resume,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[uploadResume error]', err);
    res.status(500).json({ error: 'Failed to upload resume document.' });
  }
}

async function getResumes(req, res) {
  try {
    const userId = req.user.id;

    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { slotNumber: 'asc' },
    });

    res.json({ resumes });
  } catch (err) {
    console.error('[getResumes error]', err);
    res.status(500).json({ error: 'Failed to retrieve resumes.' });
  }
}

async function deleteResume(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // IDOR check
    if (resume.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You do not own this resume.' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', path.basename(resume.fileUrl));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove file on disk:', e.message);
      }
    }

    await prisma.resume.delete({
      where: { id },
    });

    res.json({ message: `Resume slot ${resume.slotNumber} deleted successfully.` });
  } catch (err) {
    console.error('[deleteResume error]', err);
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
}

async function downloadResume(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume document not found.' });
    }

    // IDOR check: allow if owner or admin
    if (resume.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const filePath = path.join(__dirname, '../../uploads', path.basename(resume.fileUrl));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical PDF file is missing on server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(resume.originalFilename)}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('[downloadResume error]', err);
    res.status(500).json({ error: 'Failed to stream resume.' });
  }
}

module.exports = {
  uploadResume,
  getResumes,
  deleteResume,
  downloadResume,
};
