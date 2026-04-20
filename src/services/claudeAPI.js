// Study plan generator using Google Gemini (free tier via AI Studio)
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function generateStudyPlan({ syllabusTopics, resources, deadline, hoursPerDay }) {
  const today = new Date().toISOString().split("T")[0];
  const daysAvailable = Math.floor(
    (new Date(deadline) - new Date(today)) / (1000 * 60 * 60 * 24)
  );

  const prompt = `
You are an expert study planner. A student needs to complete a syllabus before a deadline.

SYLLABUS TOPICS:
${syllabusTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

AVAILABLE RESOURCES (title + URL):
${resources.map((r) => `- ${r.title}: ${r.url}`).join("\n")}

CONSTRAINTS:
- Today: ${today}
- Deadline: ${deadline}
- Days available: ${daysAvailable}
- Hours per day: ${hoursPerDay}

YOUR TASK:
1. Check if the resources cover all syllabus topics.
2. Identify any GAPS (topics with no matching resource).
3. For each gap, suggest a free resource (YouTube search query or website).
4. Create a day-by-day schedule that fits within the deadline and daily hours.

Respond ONLY with a valid JSON object in this exact shape:
{
  "coverage": [
    { "topic": "string", "coveredBy": "resource title or null", "covered": true }
  ],
  "gaps": [
    { "topic": "string", "suggestedResource": "string", "suggestedUrl": "string" }
  ],
  "schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "tasks": [
        { "title": "string", "resourceUrl": "string", "type": "video|reading|practice", "estimatedMinutes": 30, "topic": "string" }
      ]
    }
  ]
}
`;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `${GEMINI_API}?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    const errorDetails = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errorDetails}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) throw new Error("Gemini returned an empty response.");

  return JSON.parse(text);
}
