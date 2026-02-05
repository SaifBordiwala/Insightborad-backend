// Env is loaded in server.ts (.env)

export type MeetingTaskPriority = "low" | "medium" | "high";

export interface MeetingTask {
  id: string;
  description: string;
  priority: MeetingTaskPriority;
  dependencies: string[];
}

// Generic LLM configuration (provider-agnostic)
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_API_URL =
  process.env.LLM_API_URL ?? "https://api.openai.com/v1/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL ?? "gpt-4.1-mini";

const SYSTEM_PROMPT = `
You are an assistant that extracts actionable tasks from a meeting transcript.

CRITICAL OUTPUT RULES:
- You MUST respond with **JSON ONLY**.
- The JSON MUST be a plain array of task objects.
- Do NOT wrap the JSON in markdown (no backticks).
- Do NOT include any explanations, comments, or additional text.
- Do NOT include trailing commas.
- If there are no tasks, return an empty array: [].

OUTPUT SCHEMA (array of objects):
[
  {
    "id": "string",                      // short deterministic identifier (e.g. "task-1", "task-2")
    "description": "string",             // concise task description in imperative form
    "priority": "low" | "medium" | "high",
    "dependencies": ["string", ...]      // optional textual descriptions of dependencies by id or description
  }
]

TASK EXTRACTION GUIDELINES:
- Extract only concrete, actionable items that someone can complete.
- Ignore vague ideas, brainstorming, or non-actionable discussion.
- Infer reasonable priorities:
  - "high": urgent, blockers, or deadlines mentioned.
  - "medium": important but not immediately urgent.
  - "low": nice-to-have or long-term.
- Dependencies should reference other tasks by id or description when one task must happen after another.
`.trim();

interface LlmChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LlmChatCompletionChoice {
  message: {
    role: "assistant";
    content: string;
  };
}

interface LlmChatCompletionResponse {
  choices: LlmChatCompletionChoice[];
}

/**
 * Calls the configured LLM to extract tasks from a meeting transcript.
 * This function assumes the model will follow the strict system prompt
 * and return ONLY a JSON array matching the MeetingTask[] shape.
 *
 * NOTE: This function does not perform schema or business validation.
 */
export async function extractTasksFromTranscript(
  transcript: string
): Promise<MeetingTask[]> {
  if (!LLM_API_KEY) {
    throw new Error("LLM_API_KEY is not set in environment variables.");
  }

  const messages: LlmChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        "Extract all actionable tasks from the following meeting transcript.",
        "",
        "Return ONLY a JSON array of task objects that strictly follow the required schema.",
        "",
        "Meeting transcript:",
        transcript,
      ].join("\n"),
    },
  ];

  const response = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Failed to call LLM. Status: ${response.status}. Body: ${errorText}`
    );
  }

  const data = (await response.json()) as LlmChatCompletionResponse;
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("LLM response did not contain any content.");
  }

  // We assume the model returned valid JSON, but we still need to parse it.
  // No further validation is performed here.
  const tasks = JSON.parse(content) as MeetingTask[];

  return tasks;
}
