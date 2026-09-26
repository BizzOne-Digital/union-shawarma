const express = require('express');
const axios = require('axios');

const router = express.Router();
const UPLIFT_API_URL = 'https://api.upliftai.co/api/public/v1';

const upliftClient = axios.create({
  baseURL: UPLIFT_API_URL,
  timeout: 10000,
});

const getAuthHeaders = () => {
  if (!process.env.UPLIFTAI_API_KEY) return null;
  return { Authorization: `Bearer ${process.env.UPLIFTAI_API_KEY}` };
};

const handleUpstreamError = (error, res) => {
  const status = error.response?.status;

  if (status === 404) {
    return res.status(404).json({ success: false, error: 'Blog not found' });
  }

  console.error('UpliftAI request failed', {
    status: status || 'unavailable',
    code: error.code,
  });

  return res.status(502).json({
    success: false,
    error: 'The blog service is temporarily unavailable',
  });
};

router.get('/', async (req, res) => {
  const headers = getAuthHeaders();
  if (!headers) {
    return res.status(503).json({
      success: false,
      error: 'The blog service is not configured',
    });
  }

  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 9));

  try {
    const response = await upliftClient.get('/blogs', {
      headers,
      params: { page, limit, status: 'PUBLISH' },
    });

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.json(response.data);
  } catch (error) {
    return handleUpstreamError(error, res);
  }
});

router.get('/:slug', async (req, res) => {
  const headers = getAuthHeaders();
  if (!headers) {
    return res.status(503).json({
      success: false,
      error: 'The blog service is not configured',
    });
  }

  const { slug } = req.params;
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(slug)) {
    return res.status(400).json({ success: false, error: 'Invalid blog slug' });
  }

  try {
    const response = await upliftClient.get(`/blog/${encodeURIComponent(slug)}`, { headers });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.json(response.data);
  } catch (error) {
    return handleUpstreamError(error, res);
  }
});

module.exports = router;
