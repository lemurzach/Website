import Anthropic from "@anthropic-ai/sdk";

// Server-side Claude client. Reads ANTHROPIC_API_KEY from the environment.
export const anthropic = new Anthropic();

export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";
