# VideoChunker.ts

```typescript
import type { DialogueSegment } from '../types';

interface VideoChunk {
  startTime: number;
  endTime: number;
  segments: DialogueSegment[];
  chunkType: 'single-speaker' | 'multi-speaker' | 'overlap';
  speakers: string[];
}

export class VideoChunker {
  /**
   * Intelligently chunks video based on speaker continuity and overlap detection
   * 
   * Strategy:
   * - Single Speaker: Groups consecutive segments from same speaker
   * - Multi-Speaker (No Overlap): Segments from different speakers in sequence
   * - Overlap: Detects when speakers overlap in time (dialogue, interruption)
   * 
   * This ensures optimal audio rendering where:
   * - Single speaker segments get continuous, smooth audio
   * - Multi-speaker segments allow proper timing for each speaker
   * - Overlapping speech is handled with layered audio mixing
   */
  chunkVideo(segments: DialogueSegment[], gapThreshold: number = 0.5): VideoChunk[] {
    if (segments.length === 0) return [];

    // Sort segments by start time
    const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);

    const chunks: VideoChunk[] = [];
    let currentChunk: DialogueSegment[] = [];
    let currentStartTime = sorted[0].startTime;
    let currentSpeakers = new Set<string>();
    let hasOverlap = false;

    for (let i = 0; i < sorted.length; i++) {
      const segment = sorted[i];
      const prevSegment = sorted[i - 1];

      // Check for overlap: current segment starts before previous ends
      const isOverlap = prevSegment && segment.startTime < prevSegment.endTime;

      // Check for gap: current segment starts significantly after previous ends
      const hasGap =
        prevSegment && segment.startTime - prevSegment.endTime > gapThreshold;

      // Check for speaker change
      const speakerChanged =
        currentChunk.length > 0 &&
        segment.speakerId !==
          currentChunk[currentChunk.length - 1].speakerId;

      // Determine if we should start a new chunk
      const shouldNewChunk =
        (speakerChanged && !isOverlap) || hasGap || (isOverlap && !hasOverlap);

      if (shouldNewChunk && currentChunk.length > 0) {
        // Finalize current chunk
        chunks.push(
          this.createChunk(
            currentChunk,
            currentStartTime,
            hasOverlap
          )
        );

        // Start new chunk
        currentChunk = [segment];
        currentStartTime = segment.startTime;
        currentSpeakers = new Set([segment.speakerId]);
        hasOverlap = false;
      } else {
        currentChunk.push(segment);
        currentSpeakers.add(segment.speakerId);
        if (isOverlap) hasOverlap = true;
      }
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push(
        this.createChunk(currentChunk, currentStartTime, hasOverlap)
      );
    }

    return chunks;
  }

  /**
   * Creates a chunk object with type classification
   */
  private createChunk(
    segments: DialogueSegment[],
    startTime: number,
    hasOverlap: boolean
  ): VideoChunk {
    const speakers = [...new Set(segments.map((s) => s.speakerId))];
    const endTime = Math.max(...segments.map((s) => s.endTime));

    let chunkType: VideoChunk['chunkType'] = 'single-speaker';
    if (hasOverlap) {
      chunkType = 'overlap';
    } else if (speakers.length > 1) {
      chunkType = 'multi-speaker';
    }

    return {
      startTime,
      endTime,
      segments,
      chunkType,
      speakers,
    };
  }

  /**
   * Validates chunk timing and segment consistency
   */
  validateChunks(chunks: VideoChunk[]): boolean {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Check all segments are within chunk bounds (with small tolerance)
      const tolerance = 0.1;
      for (const segment of chunk.segments) {
        if (
          segment.startTime < chunk.startTime - tolerance ||
          segment.endTime > chunk.endTime + tolerance
        ) {
          console.error(`Segment outside chunk bounds: ${JSON.stringify(segment)}`);
          return false;
        }
      }

      // Check no gap between consecutive chunks
      if (i < chunks.length - 1) {
        const gap = chunks[i + 1].startTime - chunk.endTime;
        if (gap > 1.0) {
          console.warn(`Large gap detected between chunks: ${gap}s`);
        }
      }
    }

    return true;
  }

  /**
   * Groups chunks by processing type for optimized TTS rendering
   * Returns organized chunks ready for parallel or sequential processing
   */
  optimizeChunkOrder(chunks: VideoChunk[]): VideoChunk[] {
    // Prioritize single-speaker chunks (most efficient for TTS)
    // Then multi-speaker, then overlaps
    return [
      ...chunks.filter((c) => c.chunkType === 'single-speaker'),
      ...chunks.filter((c) => c.chunkType === 'multi-speaker'),
      ...chunks.filter((c) => c.chunkType === 'overlap'),
    ];
  }
}
```
