
import React, { useRef, useState, useEffect } from 'react';
import { LANGUAGES } from '../constants';

interface FileUploadProps {
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  onStart: () => void;
  isProcessing: boolean;
}

const UploadIcon: React.FC = () => (
    <svg className="w-12 h-12 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({
  videoFile,
  setVideoFile,
  targetLang,
  setTargetLang,
  onStart,
  isProcessing,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      setVideoFile(null);
      alert('Please select a valid video file.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
     if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      setVideoFile(null);
      alert('Please select a valid video file.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {!videoPreviewUrl ? (
        <label
          htmlFor="dropzone-file"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700/80 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon />
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">MP4, MOV, WEBM, or other video formats</p>
          </div>
          <input ref={inputRef} id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="video/*" />
        </label>
      ) : (
        <div className="w-full">
            <video src={videoPreviewUrl} controls className="w-full rounded-lg max-h-80" />
            <div className="text-center mt-4">
                <p className="font-semibold">{videoFile?.name}</p>
                <button onClick={() => setVideoFile(null)} className="text-sm text-blue-400 hover:underline">Choose a different video</button>
            </div>
        </div>
      )}

      <div className="w-full max-w-sm">
        <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-300">
          Translate to:
        </label>
        <select
          id="language"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          disabled={!videoFile}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onStart}
        disabled={!videoFile || isProcessing}
        className="w-full max-w-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isProcessing ? 'Processing...' : 'Start Dubbing'}
      </button>
    </div>
  );
};
