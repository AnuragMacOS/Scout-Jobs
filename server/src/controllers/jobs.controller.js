const { z } = require('zod');
const prisma = require('../config/db');

const jobSchema = z.object({
  title: z.string().trim().min(2, 'Job title is required'),
  companyName: z.string().trim().min(2, 'Company name is required'),
  companyLogoUrl: z.string().optional().nullable(),
  location: z.string().trim().min(2, 'Location is required'),
  jobType: z.enum(['FTE', 'INTERN', 'SIX_MONTH_INTERN_FTE', 'PPO'], {
    errorMap: () => ({ message: 'Please select a valid job type' }),
  }),
  batchYear: z.coerce.number().int().min(2020).max(2035),
  minBtechCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  minMtechCgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  minTenthPct: z.coerce.number().min(0).max(100).optional().nullable(),
  minTwelfthPct: z.coerce.number().min(0).max(100).optional().nullable(),
  internStipendMonthly: z.coerce.number().min(0).optional().nullable(),
  fteCtcLpa: z.coerce.number().min(0).optional().nullable(),
  description: z.string().trim().min(10, 'Job description must be at least 10 characters long'),
});

async function getJobs(req, res) {
  try {
    const { search, jobType, batchYear, status, page, limit } = req.query;

    const where = {};

    // Only administrators can query closed jobs. Public browsing is strictly constrained to open jobs.
    if (status && req.user?.role === 'admin') {
      where.status = status;
    } else {
      where.status = 'open';
    }

    if (jobType && jobType !== 'ALL') {
      where.jobType = jobType;
    }

    if (batchYear) {
      const parsedYear = parseInt(batchYear, 10);
      if (!Number.isNaN(parsedYear)) {
        where.batchYear = parsedYear;
      }
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { companyName: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const takeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * takeLimit;

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        take: takeLimit,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          companyName: true,
          companyLogoUrl: true,
          location: true,
          jobType: true,
          batchYear: true,
          minBtechCgpa: true,
          minMtechCgpa: true,
          minTenthPct: true,
          minTwelfthPct: true,
          internStipendMonthly: true,
          fteCtcLpa: true,
          description: true,
          status: true,
          createdAt: true,
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: takeLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / takeLimit),
      },
    });
  } catch (err) {
    console.error('[getJobs error]', err);
    res.status(500).json({ error: 'Failed to retrieve jobs.' });
  }
}

async function getJobById(req, res) {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    if (job.status !== 'open' && req.user?.role !== 'admin') {
      return res.status(404).json({ error: 'Job listing is no longer active.' });
    }

    res.json({ job });
  } catch (err) {
    console.error('[getJobById error]', err);
    res.status(500).json({ error: 'Failed to retrieve job details.' });
  }
}

// Admin: Create new campus recruitment job
async function createJob(req, res) {
  try {
    const validated = jobSchema.parse(req.body);
    const adminId = req.user.id;

    const job = await prisma.job.create({
      data: {
        ...validated,
        postedBy: adminId,
        status: 'open',
      },
    });

    res.status(201).json({
      message: 'Job posting published successfully!',
      job,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('[createJob error]', err);
    res.status(500).json({ error: 'Failed to create job posting.' });
  }
}

// Admin: Update job details or toggle open/closed status
async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const { status, ...rest } = req.body;

    const data = { ...rest };
    if (status) {
      if (!['open', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be open or closed' });
      }
      data.status = status;
    }

    const job = await prisma.job.update({
      where: { id },
      data,
    });

    res.json({
      message: 'Job posting updated successfully',
      job,
    });
  } catch (err) {
    console.error('[updateJob error]', err);
    res.status(500).json({ error: 'Failed to update job posting.' });
  }
}

// Admin: Delete a job posting
async function deleteJob(req, res) {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id },
    });

    res.json({ message: 'Job posting removed successfully' });
  } catch (err) {
    console.error('[deleteJob error]', err);
    res.status(500).json({ error: 'Failed to remove job posting.' });
  }
}

// Admin: View all postings with applicant counts
async function getAdminPostings(req, res) {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    res.json({ jobs });
  } catch (err) {
    console.error('[getAdminPostings error]', err);
    res.status(500).json({ error: 'Failed to retrieve employer postings.' });
  }
}

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getAdminPostings,
};
