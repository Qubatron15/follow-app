import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { actionPointsService } from "./action-points.service";

/**
 * AI Service for generating action points from transcripts using OpenAI.
 * Provides intelligent analysis of meeting transcripts to extract actionable items.
 */

/**
 * Generates action points from transcript content using OpenAI API.
 * Throws an error if AI generation or parsing fails.
 *
 * @param supabase - Supabase client instance
 * @param userId - ID of the user who owns the thread
 * @param threadId - ID of the thread to create action points for
 * @param transcriptContent - Content of the transcript to analyze
 * @returns Promise that resolves when action points are created
 * @throws Error if OpenAI API fails or response parsing fails
 *
 * @example
 * await aiService.generateActionPointsFromTranscript(
 *   supabase,
 *   userId,
 *   threadId,
 *   "Transcript of the meeting..."
 * );
 */
export async function generateActionPointsFromTranscript(
  supabase: SupabaseClient<Database>,
  userId: string,
  threadId: string,
  transcriptContent: string
): Promise<void> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY,
  });

  // Create prompt for action points generation
  const prompt = `Przeanalizuj poniższy transkrypt spotkania i wygeneruj listę 3-5 najważniejszych action points (punktów do wykonania).
      
Transkrypt:
${transcriptContent}

Zwróć tylko listę action points w formacie JSON array, gdzie każdy element to obiekt z polem "title" (string, max 255 znaków).
Przykład: [{"title": "Przygotować raport kwartalny"}, {"title": "Skontaktować się z klientem"}]

Odpowiedź (tylko JSON):`;

  // Call OpenAI Responses API
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  // Parse the AI response
  const outputText = response.output_text;

  // Extract action points from the response
  const jsonMatch = outputText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from OpenAI response");
  }

  const generatedActionPoints: { title: string }[] = JSON.parse(jsonMatch[0]);

  // Create action points in the database
  await Promise.all(
    generatedActionPoints.map((ap) => actionPointsService.create(supabase, userId, threadId, ap.title, false))
  );
}

export const aiService = {
  generateActionPointsFromTranscript,
};
