// src/components/SmartVideo.jsx
import React from "react";
import { useInView } from "react-intersection-observer";

const SmartVideo = ({ src }) => {
  const { ref, inView } = useInView({ threshold: 0.5 });

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      controls={inView}
      autoPlay={inView}
      className="w-full h-full object-cover rounded-lg transition-all duration-300"
    />
  );
};

export default SmartVideo;