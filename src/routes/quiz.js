const express = require('express');
const axios = require('axios');

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
    const prompt = `Generate 20 English quiz questions for level ${level}. Each question should be multiple choice with 4 options A, B, C, D, and only one correct answer. Return as JSON array of objects with fields: question, Choice (object with A,B,C,D), Correct (the letter A, B, C, or D). Ensure the response is valid JSON.`;

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

module.exports = router;