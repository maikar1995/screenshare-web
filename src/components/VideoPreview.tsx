import React, { useRef, useEffect } from 'react';

interface VideoPreviewProps {
  stream: MediaStream | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  return (
    <div className="video-preview">
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
};

export default VideoPreview;