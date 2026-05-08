import { useRef, useState } from "react";

function AudioReferenceCard({ data }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="audioReferenceCard">
      <div className="audioReferenceCard_top">
        <img
          src={data.image}
          alt={data.title}
          className="audioReferenceCard_image"
        />

        <button
          type="button"
          className="audioReferenceCard_play"
          onClick={handleToggleAudio}
        >
          {isPlaying ? "Pause" : "Lecture"}
        </button>
      </div>

      <div className="audioReferenceCard_content">
        <h3>{data.title}</h3>

        <p>{data.imgTexte}</p>

        <span>{data.sousTexte}</span>
      </div>

      <audio
        ref={audioRef}
        src={data.audio}
        onEnded={() => {
          setIsPlaying(false);
        }}
      />
    </div>
  );
}

export default AudioReferenceCard;
