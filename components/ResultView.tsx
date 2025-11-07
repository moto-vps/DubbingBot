
import React, { useEffect, useRef } from 'react';

interface ResultViewProps {
  originalVideoUrl: string;
  dubbedVideoUrl: string;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ originalVideoUrl, dubbedVideoUrl, onReset }) => {
    const originalVideoRef = useRef<HTMLVideoElement>(null);
    const dubbedVideoRef = useRef<HTMLVideoElement>(null);

    const handlePlay = (player: 'original' | 'dubbed') => {
        const originalPlayer = originalVideoRef.current;
        const dubbedPlayer = dubbedVideoRef.current;
        if (!originalPlayer || !dubbedPlayer) return;

        if (player === 'original') {
            dubbedPlayer.currentTime = originalPlayer.currentTime;
            dubbedPlayer.play();
        } else {
            originalPlayer.currentTime = dubbedPlayer.currentTime;
            originalPlayer.play();
        }
    };

    const handlePause = () => {
        originalVideoRef.current?.pause();
        dubbedVideoRef.current?.pause();
    };


    useEffect(() => {
        const originalPlayer = originalVideoRef.current;
        const dubbedPlayer = dubbedVideoRef.current;
        if(originalPlayer && dubbedPlayer) {
            originalPlayer.muted = true;
        }
    }, [])

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold text-center">Dubbing Complete!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">Original Video (Muted)</h3>
          <video 
            ref={originalVideoRef}
            src={originalVideoUrl} 
            controls 
            className="w-full rounded-lg"
            onPlay={() => handlePlay('original')}
            onPause={handlePause}
             />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">Dubbed Video</h3>
          <video 
            ref={dubbedVideoRef}
            src={dubbedVideoUrl} 
            controls 
            className="w-full rounded-lg"
            onPlay={() => handlePlay('dubbed')}
            onPause={handlePause}
            />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md">
        <a
          href={dubbedVideoUrl}
          download="dubbed_video.webm"
          className="w-full text-center text-white bg-gradient-to-r from-green-400 to-blue-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-300"
        >
          Download Dubbed Video
        </a>
        <button
          onClick={onReset}
          className="w-full text-white bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-800 font-medium rounded-lg text-sm px-5 py-3 transition-colors"
        >
          Process Another Video
        </button>
      </div>
    </div>
  );
};
