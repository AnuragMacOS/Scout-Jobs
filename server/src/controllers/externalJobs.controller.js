const axios = require('axios');
const env = require('../config/env');

// Curated fallback listings when RAPIDAPI_KEY is not configured or rate-limited
const SAMPLE_EXTERNAL_JOBS = [
  {
    job_id: 'ext-google-sde-1',
    job_title: 'Software Engineer II (Backend & Distributed Systems)',
    employer_name: 'Google',
    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.google.com/jobs/results/',
    job_description:
      'Build large-scale search infrastructure, storage layers, and cloud distributed services. Experience in C++, Java, or Go with strong algorithms and distributed systems fundamentals.',
  },
  {
    job_id: 'ext-flipkart-fe-2',
    job_title: 'Frontend Engineer (UI Platform)',
    employer_name: 'Flipkart',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.flipkartcareers.com/',
    job_description:
      'Architect performant web experiences for millions of daily active e-commerce shoppers. Mastery of React, JavaScript, modern web performance, and responsive interfaces.',
  },
  {
    job_id: 'ext-microsoft-sde-3',
    job_title: 'Software Development Engineer - Azure Core',
    employer_name: 'Microsoft',
    employer_logo: null,
    job_city: 'Hyderabad',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.microsoft.com/',
    job_description:
      'Join Azure Core compute and networking team. Design resilient hyper-scale virtualization, container orchestration, and multi-tenant security architecture.',
  },
  {
    job_id: 'ext-atlassian-intern-4',
    job_title: 'Graduate Software Developer (Campus 2026-2027)',
    employer_name: 'Atlassian',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'INTERN',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.atlassian.com/company/careers',
    job_description:
      'Work on Jira, Confluence, and team collaboration tooling. Looking for students with strong computer science foundations, clean coding practices, and proactive ownership.',
  },
  {
    job_id: 'ext-uber-backend-5',
    job_title: 'Backend Engineer - Marketplace Dynamics',
    employer_name: 'Uber',
    employer_logo: null,
    job_city: 'Hyderabad',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.uber.com/careers/',
    job_description:
      'Build real-time pricing and matching microservices processing hundreds of thousands of concurrent trip dispatches globally with sub-100ms latency SLAs.',
  },
  {
    job_id: 'ext-swiggy-sde-6',
    job_title: 'Software Development Engineer I (Instamart & Logistics)',
    employer_name: 'Swiggy',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.swiggy.com/',
    job_description:
      'Deliver ultra-fast quick-commerce logistics routing and inventory tracking algorithms. Experience with Java, Spring Boot, Kafka, and Redis in production.',
  },
];

async function searchExternalJobs(req, res) {
  const { q = 'Software Engineer in India', page = 1, type, remote, datePosted, live } = req.query;

  // Only invoke live RapidAPI JSearch if the client explicitly requests live search (i.e. user clicked Search)
  // This preserves the monthly quota (100 free requests/month).
  const isLiveRequested = live === 'true';

  if (isLiveRequested && env.RAPIDAPI_KEY && env.RAPIDAPI_KEY.trim() !== '') {
    let queryStr = (q || 'Software Engineer').trim();
    const lower = queryStr.toLowerCase();
    // Ensure search strictly targets Indian job market
    if (!lower.includes('india') && !lower.includes('bengaluru') && !lower.includes('bangalore') && !lower.includes('hyderabad') && !lower.includes('pune') && !lower.includes('mumbai') && !lower.includes('delhi') && !lower.includes('noida') && !lower.includes('gurgaon') && !lower.includes('gurugram') && !lower.includes('chennai')) {
      queryStr += ' in India';
    }
    if (remote === 'true') {
      queryStr += ' remote';
    }

    const params = {
      query: queryStr,
      page,
      num_pages: 1,
      employment_types: type || undefined,
      date_posted: datePosted || 'all',
      country: 'in',
    };
    const headers = {
      'X-RapidAPI-Key': env.RAPIDAPI_KEY.trim(),
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    };

    // JSearch v5 uses /search-v2 and returns { status: 'OK', data: { jobs: [...] } }
    const endpoints = ['/search-v2', '/search'];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://jsearch.p.rapidapi.com${endpoint}`, {
          params,
          headers,
          timeout: 15000,
        });

        // JSearch v5 puts jobs in response.data.data.jobs, while older versions put an array in response.data.data
        const rawList = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.data?.jobs)
          ? response.data.data.jobs
          : Array.isArray(response.data?.jobs)
          ? response.data.jobs
          : [];

        // Filter to keep India results only
        const liveData = rawList.filter((job) => {
          if (!job.job_country) return true;
          const country = job.job_country.toUpperCase();
          return country === 'IN' || country === 'INDIA';
        });

        return res.json({
          source: 'jsearch-live',
          data: liveData.length > 0 ? liveData : rawList,
        });
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        if (err.response?.status === 404) {
          continue;
        }
        console.warn(`[JSearch] ${endpoint} failed:`, msg);
        break;
      }
    }

    console.warn('[JSearch] All endpoints failed, falling back to curated listings');
  }

  // Preloaded / curated fallback listings (0 RapidAPI quota spent)
  const term = q ? q.toLowerCase().trim() : '';
  const words = term.split(/\s+/).filter((w) => w.length > 2 && w !== 'the' && w !== 'and' && w !== 'for');

  let results = SAMPLE_EXTERNAL_JOBS;

  // Apply type and remote filters
  results = results.filter((job) => {
    const matchesType = !type || job.job_employment_type === type;
    const matchesRemote = remote === 'true' ? job.job_is_remote : true;
    return matchesType && matchesRemote;
  });

  // If user typed a specific search, filter by keyword match (any word)
  if (words.length > 0 && term !== 'software engineer in india') {
    const filtered = results.filter((job) => {
      const haystack = `${job.job_title} ${job.employer_name} ${job.job_city} ${job.job_country} ${job.job_description}`.toLowerCase();
      return words.some((word) => haystack.includes(word));
    });
    if (filtered.length > 0) {
      results = filtered;
    }
  }

  res.json({
    source: isLiveRequested ? 'curated-preview' : 'preloaded',
    data: results,
  });
}

module.exports = {
  searchExternalJobs,
};
