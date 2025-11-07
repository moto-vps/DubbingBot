# AudioMixer.ts

```typescript
/**
 * AudioMixer: Handles intelligent audio blending for overlapping dialogue
 * 
 * When multiple speakers overlap, this mixer:
 * 1. Normalizes individual audio tracks to prevent clipping
 * 2. Applies gentle compression to maintain clarity
 * 3. Mixes multiple speaker audio at the correct time positions
 * 4. Prevents distortion through careful gain staging
 */

export class AudioMixer {
  private audioContext: AudioContext;
  private targetSampleRate: number = 24000;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Mixes multiple audio buffers into a single output buffer
   * Handles overlap scenarios where multiple speakers speak simultaneously
   * 
   * @param buffers - Array of audio buffers with timing information
   * @param totalDuration - Total duration in seconds for output buffer
   * @returns Mixed audio buffer ready for playback/export
   */
  async mixAudioBuffers(
    buffers: Array<{
      buffer: AudioBuffer;
      startTime: number;
      speakerId: string;
      volume?: number;
    }>,
    totalDuration: number
  ): Promise<AudioBuffer> {
    const outputBuffer = this.audioContext.createBuffer(
      1,
      Math.ceil(totalDuration * this.targetSampleRate),
      this.targetSampleRate
    );
    const outputData = outputBuffer.getChannelData(0);

    // Initialize with silence
    outputData.fill(0);

    // Track active channels for dynamic gain adjustment
    const timelineChannels: Array<{
      start: number;
      end: number;
      speakerId: string;
    }> = [];

    for (const { buffer, startTime, speakerId, volume = 1 } of buffers) {
      const startSample = Math.floor(startTime * this.targetSampleRate);
      const sourceData = buffer.getChannelData(0);
      const normalizedGain = this.calculateNormalizedGain(buffers.length, volume);

      timelineChannels.push({
        start: startSample,
        end: startSample + sourceData.length,
        speakerId,
      });

      // Mix audio with gain staging
      for (let i = 0; i < sourceData.length; i++) {
        const outputIndex = startSample + i;
        if (outputIndex < outputData.length) {
          outputData[outputIndex] += sourceData[i] * normalizedGain;
        }
      }
    }

    // Apply soft limiting to prevent clipping
    this.applySoftLimiter(outputData);

    // Optional: Apply gentle compression to overlap regions
    this.compressOverlapRegions(outputData, timelineChannels);

    return outputBuffer;
  }

  /**
   * Calculates normalized gain to prevent clipping when mixing multiple sources
   * More sources = lower individual gain to maintain headroom
   */
  private calculateNormalizedGain(sourceCount: number, userVolume: number = 1): number {
    // Base gain reduced by source count to maintain headroom
    const baseGain = 1 / Math.sqrt(sourceCount);
    return baseGain * userVolume;
  }

  /**
   * Applies soft limiting to prevent digital clipping
   * Uses soft-knee limiting for transparent, natural sound
   */
  private applySoftLimiter(audioData: Float32Array): void {
    const threshold = 0.8; // Start limiting below 1.0
    const knee = 0.1; // Soft knee width
    const ratio = 12; // 12:1 compression ratio

    for (let i = 0; i < audioData.length; i++) {
      const sample = audioData[i];
      const absSample = Math.abs(sample);

      if (absSample > threshold - knee / 2) {
        let gain = 1;

        if (absSample < threshold) {
          // Within knee region - gradual transition
          const kneeAmount =
            (absSample - (threshold - knee / 2)) / knee;
          const hardKneeGain = 1 + (ratio - 1) * kneeAmount;
          gain = 1 + (hardKneeGain - 1) * kneeAmount;
        } else {
          // Above threshold - hard limiting
          gain = threshold + (absSample - threshold) / ratio;
          gain = gain / absSample;
        }

        audioData[i] = sample * gain;
      }
    }
  }

  /**
   * Applies gentle compression to overlapping dialogue regions
   * Reduces dynamic range in overlap zones for better clarity
   */
  private compressOverlapRegions(
    audioData: Float32Array,
    timelineChannels: Array<{
      start: number;
      end: number;
      speakerId: string;
    }>
  ): void {
    const threshold = 0.5;
    const ratio = 4; // 4:1 compression
    const attackMs = 5;
    const releaseMs = 50;

    const attackSamples = Math.ceil(
      (attackMs / 1000) * this.targetSampleRate
    );
    const releaseSamples = Math.ceil(
      (releaseMs / 1000) * this.targetSampleRate
    );

    // Identify overlap regions
    for (let i = 0; i < audioData.length; i++) {
      const overlappingChannels = timelineChannels.filter(
        (ch) => i >= ch.start && i < ch.end
      ).length;

      if (overlappingChannels > 1) {
        const sample = audioData[i];
        const absSample = Math.abs(sample);

        if (absSample > threshold) {
          const gain = threshold + (absSample - threshold) / ratio;
          audioData[i] = (sample / absSample) * gain;
        }
      }
    }
  }

  /**
   * Analyzes audio for optimal peak detection and normalization targets
   */
  analyzeAudioPeaks(
    buffers: Array<{
      buffer: AudioBuffer;
      speakerId: string;
    }>
  ): Map<
    string,
    {
      peak: number;
      rms: number;
      recommendedGain: number;
    }
  > {
    const analysis = new Map();

    for (const { buffer, speakerId } of buffers) {
      const data = buffer.getChannelData(0);
      let peak = 0;
      let sum = 0;

      for (const sample of data) {
        const absSample = Math.abs(sample);
        peak = Math.max(peak, absSample);
        sum += absSample * absSample;
      }

      const rms = Math.sqrt(sum / data.length);
      const recommendedGain = 0.95 / Math.max(peak, rms);

      analysis.set(speakerId, {
        peak,
        rms,
        recommendedGain: Math.min(recommendedGain, 1.5), // Cap gain at 1.5x
      });
    }

    return analysis;
  }
}
```
