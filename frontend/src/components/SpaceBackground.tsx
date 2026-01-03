import { useEffect, useState } from "react";

export default function SpaceBackground() {
  // We use state to store our stars so React renders them once
  const [stars, setStars] = useState<any[]>([]);
  const [shootingStars, setShootingStars] = useState<any[]>([]);

  useEffect(() => {
    // 1. Generate Static Stars (The background field)
    const starArray = [];
    for (let i = 0; i < 200; i++) {
      const size = Math.random() * 2 + 1; // Random size between 1px and 3px
      starArray.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${size}px`,
        duration: `${Math.random() * 50 + 50}s`, // Random speed for parallax depth
        delay: `${Math.random() * -100}s` // Start at random positions in animation
      });
    }
    setStars(starArray);

    // 2. Generate Shooting Stars (The "Light Travel" effect)
    const shooterArray = [];
    for (let i = 0; i < 10; i++) {
      shooterArray.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 50}%`, // Only appear in top half
        width: `${Math.random() * 100 + 100}px`, // Length of the tail
        delay: `${Math.random() * 10}s`,
        duration: `${Math.random() * 3 + 2}s`
      });
    }
    setShootingStars(shooterArray);

  }, []);

  return (
    <div className="space-container">
      {/* Render Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDuration: star.duration,
            animationDelay: star.delay
          }}
        />
      ))}

      {/* Render Shooting Stars (Light Travel) */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="shooting-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.width,
            animationDelay: star.delay,
            animationDuration: star.duration
          }}
        />
      ))}
      
      {/* Optional: A colorful nebula overlay for atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 via-purple-900/10 to-transparent pointer-events-none" />
    </div>
  );
}