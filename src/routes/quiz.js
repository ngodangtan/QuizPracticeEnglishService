const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const { authMiddleware } = require('./auth');

const router = express.Router();

/**
 * @swagger
 * /api/quiz/generate-quiz:
 *   post:
 *     summary: Tạo bộ câu hỏi kiểm tra tiếng Anh
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [A1, A2, B1, B2, C1, C2]
 *                 description: Trình độ tiếng Anh
 *                 example: A1
 *     responses:
 *       200:
 *         description: Bộ câu hỏi được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   Choice:
 *                     type: object
 *                     properties:
 *                       A:
 *                         type: string
 *                       B:
 *                         type: string
 *                       C:
 *                         type: string
 *                       D:
 *                         type: string
 *                   Correct:
 *                     type: string
 *                     enum: [A, B, C, D]
 *       400:
 *         description: Lỗi đầu vào
 *       500:
 *         description: Lỗi server
 */
router.post('/generate-quiz', async (req, res) => {
  const { level } = req.body;

  if (!level || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
    return res.status(400).json({ error: 'Invalid level. Must be one of A1, A2, B1, B2, C1, C2' });
  }

  try {
    const prompt = `Generate 20 high-quality English quiz questions for CEFR level ${level}. Focus on vocabulary, grammar, and tenses appropriate for this level. Each question should test specific language skills and be multiple choice with 4 options A, B, C, D, and only one correct answer.

Level guidelines:
- A1: Basic vocabulary, simple present tense, basic grammar
- A2: Common vocabulary, present/past tenses, basic grammar structures
- B1: Intermediate vocabulary, various tenses, common grammar patterns
- B2: Advanced vocabulary, complex tenses, nuanced grammar
- C1: Sophisticated vocabulary, all tenses, complex grammar
- C2: Native-like vocabulary, advanced tenses, intricate grammar

Include a mix of:
- Vocabulary questions (word meaning, synonyms, antonyms, collocations)
- Grammar questions (sentence structure, word order, agreement)
- Tense questions (present, past, future, perfect tenses, conditionals)

Each question should be clear, unambiguous, and have one definitively correct answer. Return as JSON array of objects with fields: question, Choice (object with A,B,C,D), Correct (the letter A, B, C, or D). Ensure the response is valid JSON without any additional text.`;

    const response = await axios.post('http://127.0.0.1:1234/v1/chat/completions', {
      model: 'local-model', // Adjust based on your LM Studio model
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
    });

    const generatedText = response.data.choices[0].message.content;
    let jsonString = generatedText.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const questions = JSON.parse(jsonString);

    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

/**
 * @swagger
 * /api/quiz/submit-score:
 *   post:
 *     summary: Lưu điểm recentScore khi user hoàn thành bài test
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: string
 *                 description: Score as percentage string or number (e.g., "30%" or 30)
 *                 example: "30%"
 *     responses:
 *       200:
 *         description: Score saved
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/submit-score', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    let scoreStr;

    if (typeof score === 'number') {
      scoreStr = `${Math.round(score)}%`;
    } else if (typeof score === 'string') {
      const s = score.trim();
      if (/^\d+%$/.test(s)) scoreStr = s;
      else if (/^\d+(\.\d+)?$/.test(s)) scoreStr = `${Math.round(Number(s))}%`;
      else return res.status(400).json({ error: 'Invalid score format. Use "30%" or number like 30' });
    } else {
      return res.status(400).json({ error: 'Score is required' });
    }

    if (!/^(100|[0-9]{1,2})%$/.test(scoreStr)) {
      return res.status(400).json({ error: 'Score must be between 0% and 100%' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.recentScore = scoreStr;
    await user.save();

    res.json({ success: true, recentScore: user.recentScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

module.exports = router;