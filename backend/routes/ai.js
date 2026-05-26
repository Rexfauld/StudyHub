const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { ensureAuth } = require('../middleware/auth');
const router = express.Router();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Rate limiting - max 10 requests per user per hour
const userRequests = new Map();
function rateLimit(userId) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const max = 10;
  const requests = (userRequests.get(userId) || []).filter(t => now - t < windowMs);
  if (requests.length >= max) return false;
  requests.push(now);
  userRequests.set(userId, requests);
  return true;
}

// POST /api/ai/chat
router.post('/chat', ensureAuth, async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  if (!rateLimit(req.user._id.toString())) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again in an hour.' });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a helpful study assistant for Ghanaian students (JHS, SHS, and University level). 
Your job is to explain topics clearly, solve past questions step by step, summarize notes, and generate practice questions.
Keep explanations simple and relevant to the Ghanaian education curriculum.
${context ? `Current context: ${context}` : ''}`,
      messages: [{ role: 'user', content: message }]
    });

    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;