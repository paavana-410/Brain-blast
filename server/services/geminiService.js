const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateQuestions(topic, difficulty, count = 20) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Generate exactly ${count} ${difficulty} difficulty quiz questions about "${topic}" for school students.
  
  Return ONLY valid JSON array with this exact format (no markdown, no code blocks):
  [
    {
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Brief explanation"
    }
  ]
  
  Rules:
  - ${difficulty === 'simple' ? 'Keep questions easy and fun for elementary students' : 'Make questions challenging for middle/high school students'}
  - Each question must have exactly 4 options
  - correctAnswer must match one option exactly
  - Keep explanations short (1-2 sentences)
  - Make questions engaging and educational`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean response - remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const questions = JSON.parse(cleaned);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }
    
    return questions.slice(0, count);
  } catch (err) {
    console.error('Gemini API error:', err);
    // Return fallback questions
    return generateFallbackQuestions(topic, count);
  }
}

function generateFallbackQuestions(topic, count) {
  return Array