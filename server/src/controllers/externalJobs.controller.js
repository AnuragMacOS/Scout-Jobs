const axios = require('axios');
const env = require('../config/env');

// In-memory cache to preserve RapidAPI free quota and deliver sub-millisecond responses
const searchCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Curated high-fidelity listings across India when API quota is exhausted or rate-limited
const SAMPLE_EXTERNAL_JOBS = [
  {
    job_id: 'ext-google-sde-1',
    job_title: 'Software Development Engineer II (SDE 2 - Backend & Distributed Systems)',
    employer_name: 'Google',
    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.google.com/jobs/results/',
    job_description:
      'Build large-scale search infrastructure, storage layers, and cloud distributed services. Experience in C++, Java, or Go with strong algorithms and distributed systems fundamentals.',
  },
  {
    job_id: 'ext-amazon-sde-2',
    job_title: 'Software Development Engineer I (SDE 1 - Core Services)',
    employer_name: 'Amazon',
    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    job_city: 'Hyderabad',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.amazon.jobs/',
    job_description:
      'Design, build, and deploy high-throughput microservices powering Amazon e-commerce and AWS services. Proficient in Java, C++, OOP principles, data structures, and algorithms.',
  },
  {
    job_id: 'ext-microsoft-sde-3',
    job_title: 'Software Development Engineer - Azure Cloud Core (SDE)',
    employer_name: 'Microsoft',
    employer_logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.microsoft.com/',
    job_description:
      'Join Azure Core compute and networking team. Design resilient hyper-scale virtualization, container orchestration, and multi-tenant security architecture.',
  },
  {
    job_id: 'ext-flipkart-fe-4',
    job_title: 'Frontend Engineer (UI / React Platform)',
    employer_name: 'Flipkart',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.flipkartcareers.com/',
    job_description:
      'Architect performant web experiences for millions of daily active e-commerce shoppers. Mastery of React, JavaScript, TypeScript, modern web performance, and responsive interfaces.',
  },
  {
    job_id: 'ext-atlassian-intern-5',
    job_title: 'Graduate Software Developer Intern (SDE Intern 2026-2027)',
    employer_name: 'Atlassian',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'INTERN',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.atlassian.com/company/careers',
    job_description:
      'Work on Jira, Confluence, and cloud collaboration tooling. Looking for students with strong computer science foundations, clean coding practices, and proactive ownership.',
  },
  {
    job_id: 'ext-uber-backend-6',
    job_title: 'Backend Engineer (SDE 2 - Marketplace & Pricing Engine)',
    employer_name: 'Uber',
    employer_logo: null,
    job_city: 'Hyderabad',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.uber.com/careers/',
    job_description:
      'Build real-time pricing and matching microservices processing hundreds of thousands of concurrent trip dispatches globally with sub-100ms latency SLAs using Go and Java.',
  },
  {
    job_id: 'ext-swiggy-sde-7',
    job_title: 'Software Development Engineer I (Instamart & Logistics SDE)',
    employer_name: 'Swiggy',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.swiggy.com/',
    job_description:
      'Deliver ultra-fast quick-commerce logistics routing and inventory tracking algorithms. Experience with Java, Spring Boot, Kafka, and Redis in production.',
  },
  {
    job_id: 'ext-cred-sde-8',
    job_title: 'Backend Engineer (SDE 1 / SDE 2 - Financial Systems)',
    employer_name: 'CRED',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://careers.cred.club/',
    job_description:
      'Build mission-critical transactional pipelines and payment gateways with zero-loss consistency. Strong focus on Go, PostgreSQL, event-driven design, and low-latency microservices.',
  },
  {
    job_id: 'ext-zomato-fullstack-9',
    job_title: 'Full Stack Engineer (Node.js & React)',
    employer_name: 'Zomato',
    employer_logo: null,
    job_city: 'Gurugram',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.zomato.com/careers',
    job_description:
      'Build food delivery and restaurant partner tooling. Strong background in React, Node.js, Express, state management, and high-concurrency systems.',
  },
  {
    job_id: 'ext-razorpay-intern-10',
    job_title: 'Software Development Intern (SDE Intern)',
    employer_name: 'Razorpay',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'INTERN',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://razorpay.com/jobs/',
    job_description:
      'Join India’s leading fintech infrastructure team. Work directly on payment APIs, merchant dashboard tools, and fraud prevention pipelines alongside senior engineers.',
  },
  {
    job_id: 'ext-zepto-sde-11',
    job_title: 'SDE 1 - Supply Chain & Fast Delivery Tech',
    employer_name: 'Zepto',
    employer_logo: null,
    job_city: 'Mumbai',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: false,
    job_posted_at_datetime_utc: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.zeptonow.com/careers',
    job_description:
      'Scale dark-store inventory allocation, automated picking algorithms, and rider dispatch systems. Tech stack includes Go, Python, Kafka, and AWS.',
  },
  {
    job_id: 'ext-meesho-ai-12',
    job_title: 'AI / Machine Learning Engineer (Product Recommendations)',
    employer_name: 'Meesho',
    employer_logo: null,
    job_city: 'Bengaluru',
    job_country: 'India',
    job_employment_type: 'FULLTIME',
    job_is_remote: true,
    job_posted_at_datetime_utc: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    job_apply_link: 'https://www.meesho.io/careers',
    job_description:
      'Train and deploy personalized recommendation models, search ranking algorithms, and large language model assistants for e-commerce discovery across India.',
  },
];

async function searchExternalJobs(req, res) {
  const { q = 'Software Engineer in India', page = 1, type, remote, datePosted } = req.query;

  const rawQuery = (q || 'Software Engineer').trim();
  const cacheKey = `${rawQuery.toLowerCase()}:${remote || 'false'}:${type || 'all'}:${datePosted || 'all'}:${page}`;

  // 1. Check in-memory cache first to save RapidAPI quota and speed up duplicate queries
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.json({
      source: 'jsearch-live',
      cached: true,
      data: cached.data,
    });
  }

  // 2. Query RapidAPI JSearch if key is present
  if (env.RAPIDAPI_KEY && env.RAPIDAPI_KEY.trim() !== '') {
    let queryStr = rawQuery;
    const lower = queryStr.toLowerCase();

    // Ensure query targets India location if not already specified
    const hasIndiaKeyword = [
      'india', 'bengaluru', 'bangalore', 'hyderabad', 'pune',
      'mumbai', 'delhi', 'noida', 'gurgaon', 'gurugram', 'chennai', 'kolkata', 'kochi'
    ].some((loc) => lower.includes(loc));

    if (!hasIndiaKeyword) {
      queryStr += ' in India';
    }
    if (remote === 'true') {
      queryStr += ' remote';
    }

    const params = {
      query: queryStr,
      page: Number(page) || 1,
      num_pages: 1,
      employment_types: type || undefined,
      date_posted: datePosted && datePosted !== 'all' ? datePosted : 'all',
      country: 'in',
    };

    const headers = {
      'X-RapidAPI-Key': env.RAPIDAPI_KEY.trim(),
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    };

    try {
      const response = await axios.get('https://jsearch.p.rapidapi.com/search-v2', {
        params,
        headers,
        timeout: 12000,
      });

      const rawList = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.jobs)
        ? response.data.data.jobs
        : Array.isArray(response.data?.jobs)
        ? response.data.jobs
        : [];

      // Filter to keep India results (or jobs without specified country)
      const liveData = rawList.filter((job) => {
        if (!job.job_country) return true;
        const country = job.job_country.toUpperCase();
        return country === 'IN' || country === 'INDIA';
      });

      const finalJobs = liveData.length > 0 ? liveData : rawList;

      if (finalJobs.length > 0) {
        // Cache result in memory
        searchCache.set(cacheKey, {
          timestamp: Date.now(),
          data: finalJobs,
        });

        return res.json({
          source: 'jsearch-live',
          data: finalJobs,
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.warn(`[JSearch API] Failed (${err.response?.status || 'network'}):`, msg);
      // Fall through to curated fallback listings gracefully
    }
  }

  // 3. Robust Curated Fallback (Guaranteed to return relevant tech jobs across India)
  const term = rawQuery.toLowerCase();
  
  // Expand common developer acronyms
  const queryTokens = term.split(/\s+/).filter(Boolean);
  const expandedTokens = new Set(queryTokens);
  if (term.includes('sde') || term.includes('sd')) {
    expandedTokens.add('sde');
    expandedTokens.add('software');
    expandedTokens.add('developer');
    expandedTokens.add('engineer');
  }
  if (term.includes('fe') || term.includes('frontend') || term.includes('react')) {
    expandedTokens.add('frontend');
    expandedTokens.add('react');
    expandedTokens.add('ui');
  }
  if (term.includes('be') || term.includes('backend') || term.includes('node') || term.includes('java')) {
    expandedTokens.add('backend');
    expandedTokens.add('distributed');
  }
  if (term.includes('intern') || term.includes('graduate')) {
    expandedTokens.add('intern');
    expandedTokens.add('graduate');
  }

  let results = [...SAMPLE_EXTERNAL_JOBS];

  // Apply employment type filter
  if (type) {
    results = results.filter((job) => job.job_employment_type?.toUpperCase() === type.toUpperCase());
  }

  // Apply remote filter
  if (remote === 'true') {
    results = results.filter((job) => job.job_is_remote);
  }

  // Apply keyword relevance matching
  if (term && term !== 'software engineer in india') {
    const matched = results.filter((job) => {
      const haystack = `${job.job_title} ${job.employer_name} ${job.job_city} ${job.job_description}`.toLowerCase();
      return Array.from(expandedTokens).some((token) => token.length > 1 && haystack.includes(token));
    });

    if (matched.length > 0) {
      results = matched;
    }
  }

  res.json({
    source: 'curated-preview',
    data: results,
  });
}

module.exports = {
  searchExternalJobs,
};
