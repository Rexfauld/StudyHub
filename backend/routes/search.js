const express = require('express');
const router  = express.Router();
const Upload  = require('../models/Upload');

// Maps plain-English level words to slug prefixes
const LEVEL_ALIASES = {
  jhs: 'jhs', 'junior high': 'jhs', 'junior': 'jhs',
  shs: 'shs', 'senior high': 'shs', 'senior': 'shs',
  university: 'uni', uni: 'uni', 'tertiary': 'uni', 'degree': 'uni',
};

const TYPE_ALIASES = {
  book: 'book', books: 'book', textbook: 'book',
  topic: 'topic', topics: 'topic', notes: 'topic', simplified: 'topic',
  questions: 'questions', question: 'questions', 'past questions': 'questions',
  'past q': 'questions', exam: 'questions', exams: 'questions',
};

// GET /api/search?q=...&level=...&type=...&sort=...
router.get('/', async (req, res) => {
  const { q, level, type, sort } = req.query;
  if (!q || !q.trim()) return res.json({ results: [] });

  const words = q.trim().toLowerCase().split(/\s+/);
  const filter = { status: 'approved' };

  // --- Detect level from query words ---
  let detectedLevel = level || null;
  if (!detectedLevel) {
    for (const word of words) {
      if (LEVEL_ALIASES[word]) { detectedLevel = LEVEL_ALIASES[word]; break; }
    }
    // Also check 2-word combos
    for (let i = 0; i < words.length - 1; i++) {
      const pair = words[i] + ' ' + words[i + 1];
      if (LEVEL_ALIASES[pair]) { detectedLevel = LEVEL_ALIASES[pair]; break; }
    }
  }

  // --- Detect type from query words ---
  let detectedType = type || null;
  if (!detectedType) {
    for (const word of words) {
      if (TYPE_ALIASES[word]) { detectedType = TYPE_ALIASES[word]; break; }
    }
    for (let i = 0; i < words.length - 1; i++) {
      const pair = words[i] + ' ' + words[i + 1];
      if (TYPE_ALIASES[pair]) { detectedType = TYPE_ALIASES[pair]; break; }
    }
  }

  if (detectedLevel) filter.subjectSlug = { $regex: `^${detectedLevel}-`, $options: 'i' };
  if (detectedType)  filter.type = detectedType;

  // Strip level/type keywords from search term so "jhs maths" searches "maths" not "jhs maths"
  const stopWords = new Set([
    ...Object.keys(LEVEL_ALIASES), ...Object.keys(TYPE_ALIASES)
  ]);
  const cleanWords = words.filter(w => !stopWords.has(w));
  const cleanQ = cleanWords.join(' ').trim() || q.trim();

  const textFilter = {
    $or: [
      { title:       { $regex: cleanQ, $options: 'i' } },
      { description: { $regex: cleanQ, $options: 'i' } },
      { subjectSlug: { $regex: cleanQ.replace(/\s+/g, '-'), $options: 'i' } },
      { type:        { $regex: cleanQ, $options: 'i' } },
    ]
  };

  // If after stripping there's still a search term, combine with level/type filter
  const fullFilter = cleanWords.length > 0
    ? { ...filter, ...textFilter }
    : Object.keys(filter).length > 1
      ? filter  // level or type filter is enough
      : textFilter; // no level/type detected, pure text search

  try {
    const sortOrder = sort === 'downloads' ? { downloads: -1 }
                    : sort === 'likes'     ? { likes: -1 }
                    : { createdAt: -1 };

    const results = await Upload.find(fullFilter)
      .populate('uploader', 'name')
      .sort(sortOrder)
      .limit(40);

    res.json({ results, detectedLevel, detectedType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
