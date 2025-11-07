import type { DialogueSegment, TranslatedSegment } from '../types';
import { GoogleGenAI } from "@google/genai";

interface OptimizationContext {
  originalText: string;
  context: string;
  targetLanguage: string;
  characterCount: number;
  speakerProfile?: string;
}

export class TranslationOptimizer {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Performs intelligent, context-aware translation optimized for dubbing
   * Ensures translations maintain similar phoneme length and character count
   * to the original for synchronized lip-sync audio rendering
   */
  async optimizeTranslation(
    text: string,
    targetLanguage: string,
    context: string,
    characterDescription?: string
  ): Promise<string> {
    const languageNameMap: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      it: 'Italian',
      pt: 'Portuguese',
      ko: 'Korean',
    };

    const langName = languageNameMap[targetLanguage] || targetLanguage;
    const originalLength = text.length;

    const optimizationPrompt = `You are an expert translator specializing in video dubbing and localization.

Your task is to translate the following dialogue while maintaining optimal dubbing synchronization.

**Original Dialogue:** "${text}"
**Original Length:** ${originalLength} characters
**Target Language:** ${langName}
**Dialogue Context:** "${context}"
${characterDescription ? `**Character Profile:** ${characterDescription}` : ''}

**Translation Guidelines:**
1. **Phonetic Length Matching**: The translation should have a similar character count (±15%) to enable natural TTS audio generation with matching duration
2. **Natural Flow**: Maintain the emotional tone and intent of the original speaker
3. **Contextual Accuracy**: Consider the surrounding dialogue for proper context and avoid awkward phrasing
4. **Speech Patterns**: Match the casualness or formality of the original speaker
5. **Syllable Efficiency**: Use vocabulary that fits naturally within the same time frame when spoken

**Important Constraints:**
- If direct translation is too long, rephrase with equivalent meaning using shorter words
- If direct translation is too short, expand with natural elaboration that fits the character's voice
- Avoid literal word-for-word translation; prioritize dubbing-friendly localization
- The translation should feel native to a ${langName} speaker, not mechanical

Respond with ONLY the translated text, without any explanation or formatting.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: optimizationPrompt,
    });

    return response.text.trim();
  }

  /**
   * Batch optimize translations while maintaining segment integrity
   * Groups continuous speech by the same speaker for efficient processing
   */
  async batchOptimizeTranslations(
    segments: DialogueSegment[],
    targetLanguage: string,
    speakerProfiles: Map<string, { gender: string; age: string; emotion: string }>
  ): Promise<TranslatedSegment[]> {
    const groupedSegments = this.groupSegmentsBySpeaker(segments);
    const translatedSegments: TranslatedSegment[] = [];

    for (const group of groupedSegments) {
      const speakerProfile = speakerProfiles.get(group.speakerId);
      const profileDescription = speakerProfile
        ? `${speakerProfile.gender}, ${speakerProfile.age}, ${speakerProfile.emotion} tone`
        : undefined;

      // Build context from surrounding segments
      const contextSegments = segments.filter(
        (s) =>
          Math.abs(s.startTime - group.startTime) < 30 &&
          (s.speakerId === group.speakerId || segments.indexOf(s) === segments.indexOf(group) - 1 || segments.indexOf(s) === segments.indexOf(group) + 1)
      );
      const contextText = contextSegments.map((s) => s.transcription).join(' ');

      for (const segment of group.segments) {
        const optimizedTranslation = await this.optimizeTranslation(
          segment.transcription,
          targetLanguage,
          contextText,
          profileDescription
        );

        translatedSegments.push({
          speakerId: segment.speakerId,
          text: optimizedTranslation,
          startTime: segment.startTime,
          endTime: segment.endTime,
        });
      }
    }

    return translatedSegments;
  }

  /**
   * Groups consecutive segments from the same speaker
   * Returns grouped segments with metadata for efficient processing
   */
  private groupSegmentsBySpeaker(
    segments: DialogueSegment[]
  ): Array<{
    speakerId: string;
    startTime: number;
    segments: DialogueSegment[];
  }> {
    const groups: Array<{
      speakerId: string;
      startTime: number;
      segments: DialogueSegment[];
    }> = [];

    let currentGroup: DialogueSegment[] | null = null;
    let currentSpeakerId = '';

    for (const segment of segments) {
      if (segment.speakerId !== currentSpeakerId) {
        if (currentGroup) {
          groups.push({
            speakerId: currentSpeakerId,
            startTime: currentGroup[0].startTime,
            segments: currentGroup,
          });
        }
        currentGroup = [segment];
        currentSpeakerId = segment.speakerId;
      } else {
        currentGroup?.push(segment);
      }
    }

    if (currentGroup) {
      groups.push({
        speakerId: currentSpeakerId,
        startTime: currentGroup[0].startTime,
        segments: currentGroup,
      });
    }

    return groups;
  }
}
