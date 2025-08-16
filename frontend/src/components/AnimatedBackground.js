import React, { useState, useEffect } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const AnimatedBackground = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <>
      {/* Nền đen + ánh sáng vàng kim mờ */}
      <div
  className="absolute inset-0"
  style={{
    backgroundColor: "#21211ff3", // thử màu đen tuyệt đối trước
    zIndex: -1000,              // chắc chắn nằm dưới hết
  }}
></div>

      {/* Hạt sáng vàng kim lấp lánh */}
      <Particles
        id="luxury-background"
        className="absolute inset-0 -z-10"
        options={{
          fullScreen: false,
          background: {
            color: "transparent",
          },
          fpsLimit: 60,
          detectRetina: true,
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false },
            },
          },
          particles: {
            number: {
              value: 35,
              density: { enable: true, area: 1500 },
            },
            color: {
              value: "#FFD700", // vàng kim
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 2,
              random: { enable: true, minimumValue: 1 },
            },
            opacity: {
              value: 0.8,
              random: { enable: true, minimumValue: 0.4 },
              anim: {
                enable: true,
                speed: 1.2,
                opacity_min: 0.2,
                sync: false,
              },
            },
            move: {
              enable: true,
              speed: 0.1,
              direction: "none",
              random: true,
              straight: false,
              outModes: {
                default: "bounce",
              },
            },
            shadow: {
              enable: true,
              color: "#FFD700",
              blur: 6,
            },
          },
        }}
      />

      <style>
        {`
          @keyframes bgShift {
            0%, 100% {
              background-position: 25% 30%, 75% 70%, 50% 50%;
            }
            50% {
              background-position: 30% 35%, 70% 65%, 50% 52%;
            }
          }
        `}
      </style>
    </>
  );
};

export default AnimatedBackground;
