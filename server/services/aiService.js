const Groq = require("groq-sdk");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateQuestions(topic, difficulty, count = 20) {
  const prompt = `Generate exactly ${count} ${difficulty} difficulty multiple-choice quiz questions about "${topic}" for school students.

Return ONLY a valid JSON array with this exact format (no markdown, no explanation):
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
- Each question MUST have exactly 4 options labeled A), B), C), D)
- correctAnswer MUST match one of the options EXACTLY
- Keep explanations short (1-2 sentences)
- Make questions engaging and educational
- Return ONLY the JSON array, nothing else`;

  try {
    console.log(`🤖 Generating ${count} questions about ${topic} (${difficulty})...`);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a quiz question generator. Always respond with valid JSON only, no markdown or extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Fast and high quality
      temperature: 0.7,
      max_tokens: 4000
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    console.log('✅ Groq API response received');
    
    // Clean response
    const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const questions = JSON.parse(cleaned);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }
    
    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      q.correctAnswer &&
      q.options.includes(q.correctAnswer)
    );
    
    if (validQuestions.length === 0) {
      throw new Error('No valid questions found');
    }
    
    console.log(`✅ Generated ${validQuestions.length} valid questions`);
    return validQuestions.slice(0, count);
    
  } catch (err) {
    console.error('❌ Groq API error:', err.message);
    console.error('Using fallback questions');
    return generateFallbackQuestions(topic, count);
  }
}

function generateFallbackQuestions(topic, count) {
  return Array.from({ length: count }, (_, i) => ({
    question: `Sample question ${i + 1} about ${topic}?`,
    options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
    correctAnswer: 'A) Option 1',
    explanation: 'This is a fallback question.'
  }));
}

module.exports = { generateQuestions };