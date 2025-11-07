import { VOICE_LIST } from './constants';

// Create a union type of all valid voice names from the constant
type VoiceName = typeof VOICE_LIST[number]['name'];


export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
}

export interface DialogueSegment {
  startTime: number;
  endTime: number;
  transcription: string;
  speakerId: string;
}

// SpeakerAnalysis now includes the chosen voiceName directly from the model
export interface SpeakerAnalysis {
  gender: string;
  age: string;
  emotion: string;
  voiceName: VoiceName;
}

// SpeakerProfile is now a SpeakerAnalysis with a speaker ID
export interface SpeakerProfile extends SpeakerAnalysis {
  id: string;
}

export interface TranslatedSegment {
    speakerId: string;
    text: string;
    startTime: number;
    endTime: number;
}