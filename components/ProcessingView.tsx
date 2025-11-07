import React, { useState } from 'react';

interface ProcessingViewProps {
  progressMessage: string;
  progressPercent: number;
  ttsLogs?: string[];
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ progressMessage, progressPercent, ttsLogs = [] }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Logs');

  const handleCopyLogs = () => {
    if (!navigator.clipboard) {
      setCopyButtonText('Cannot Copy');
      setTimeout(() => setCopyButtonText('Copy Logs'), 2000);
      return;
    }
    const logText = ttsLogs.join('\n\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Logs'), 2000);
    }).catch(err => {
      console.error('Failed to copy logs: ', err);
      setCopyButtonText('Failed!');
      setTimeout(() => setCopyButtonText('Copy Logs'), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-700"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className="text-blue-500"
            strokeWidth="10"
            strokeDasharray="283"
            strokeDashoffset={283 - (progressPercent / 100) * 283}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
            {Math.round(progressPercent)}%
        </span>
      </div>

      <h2 className="text-xl font-semibold text-center animate-pulse">{progressMessage}...</h2>
      <p className="text-sm text-gray-400 text-center">
        This may take a few moments. Please don't close this window.
      </p>

      {/* Diagnostic Log Section with Copy button */}
      {ttsLogs.length > 0 && (
        <div className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 mt-8 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800/50 backdrop-blur-sm -mx-4 -mt-4 px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-cyan-400">TTS API Diagnostic Logs</h3>
            <button
              onClick={handleCopyLogs}
              className="bg-cyan-500 text-gray-900 font-bold py-1 px-3 rounded-md text-sm hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-colors"
            >
              {copyButtonText}
            </button>
          </div>
          <div className="font-mono text-xs text-gray-300">
            {ttsLogs.map((log, idx) => (
              <pre key={idx} className="mb-2 whitespace-pre-wrap break-words">
                {log}
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
