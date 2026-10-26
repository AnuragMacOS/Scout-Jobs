const { z } = require('zod');
const prisma = require('../config/db');

const applySchema = z.object({
  jobId: z.string().uuid('Invalid job ID format'),
  resumeId: z.string().uuid('Invalid resume ID format').optional().nullable(),
});

async function applyToJob(req, res) {
  try {
    const validated = applySchema.parse(req.body);
    const userId = req.user.id;

    // 1. Verify job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: validated.jobId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ error: 'This job opening is no longer accepting applications.' });
    }

    // 2. Check for duplicate application
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: validated.jobId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an application for this role.' });
    }

    // 3. IDOR validation: If resumeId is provided, verify it belongs to the requesting student
    if (validated.resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: validated.resumeId },
      });

      if (!resume || resume.userId !== userId) {
        return res.status(403).json({ error: 'Selected resume is invalid or not owned by you.' });
      }
    }

    // 4. Create application
    const application = await prisma.application.create({
      data: {
        userId,
        jobId: validated.jobId,
        resumeId: validated.resumeId || null,
        status: 'applied',
      },
      include: {
        job: true,
        resume: true,
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'You have already submitted an application for this role.' });
    }
    console.error('[applyToJob error]', err);
    res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
}

async function getMyApplications(req, res) {
  try {
    const userId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: true,
        resume: {
          select: {
            id: true,
            slotNumber: true,
            originalFilename: true,
            fileUrl: true,
          },
        },
      },
    });

    res.json({ applications });
  } catch (err) {
    console.error('[getMyApplications error]', err);
    res.status(500).json({ error: 'Failed to retrieve applications.' });
  }
}

async function getJobApplicants(req, res) {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, companyName: true },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const applicants = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            rollNo: true,
            mobile: true,
            graduationYear: true,
            academicInfo: true,
          },
        },
        resume: true,
      },
    });

    res.json({ job, applicants });
  } catch (err) {
    console.error('[getJobApplicants error]', err);
    res.status(500).json({ error: 'Failed to retrieve job applicants.' });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'shortlisted', 'rejected', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({
      message: `Applicant status updated to ${status}`,
      application,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Application record not found.' });
    }
    console.error('[updateApplicationStatus error]', err);
    res.status(500).json({ error: 'Failed to update applicant status.' });
  }
}

async function withdrawApplication(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to withdraw this application.' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'withdrawn' },
      include: { job: true },
    });

    res.json({
      message: 'Application withdrawn successfully.',
      application: updated,
    });
  } catch (err) {
    console.error('[withdrawApplication error]', err);
    res.status(500).json({ error: 'Failed to withdraw application.' });
  }
}

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
};
