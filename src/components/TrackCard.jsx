import { useRef } from "react";

function getWaveHeight(trackId, index) {
  const seed = [...trackId].reduce(
    (sum, char, charIndex) => sum + char.charCodeAt(0) * (charIndex + 1),
    0,
  );

  const value =
    Math.sin(seed * (index + 1) * 12.9898) *
    Math.cos((seed + index) * 78.233) *
    10000;

  const normalized = Math.abs(value % 1);

  return Math.floor(normalized * 28) + 6;
}

function TrackCard({
  track,
  isActive,
  onPlayPreview,
  onDragStart,
  onDragMove,
  onDragEnd,
  isGhost = false,
  isDraggedOriginal = false,
  isTutorialDragHighlighted = false,
}) {
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    hasStarted: false,
  });

  if (track.type === "label") {
    return <div className="trackCard trackCard--label">{track.name}</div>;
  }

  const canDrag = !track.locked && track.type === "audio" && !isGhost;

  const handlePointerDown = (event) => {
    if (!canDrag) return;

    event.preventDefault();

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      hasStarted: false,
    };

    const handleWindowMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaY = moveEvent.clientY - dragRef.current.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (!dragRef.current.hasStarted && distance > 8) {
        dragRef.current.hasStarted = true;

        onDragStart(track, {
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });

        return;
      }

      if (dragRef.current.hasStarted) {
        onDragMove({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });
      }
    };

    const handleWindowUp = (upEvent) => {
      if (dragRef.current.hasStarted) {
        onDragEnd({
          x: upEvent.clientX,
          y: upEvent.clientY,
          track,
        });
      }

      dragRef.current.hasStarted = false;

      window.removeEventListener("pointermove", handleWindowMove);
      window.removeEventListener("pointerup", handleWindowUp);
      window.removeEventListener("pointercancel", handleWindowCancel);
    };

    const handleWindowCancel = () => {
      if (dragRef.current.hasStarted) {
        onDragEnd(null);
      }

      dragRef.current.hasStarted = false;

      window.removeEventListener("pointermove", handleWindowMove);
      window.removeEventListener("pointerup", handleWindowUp);
      window.removeEventListener("pointercancel", handleWindowCancel);
    };

    window.addEventListener("pointermove", handleWindowMove);
    window.addEventListener("pointerup", handleWindowUp);
    window.addEventListener("pointercancel", handleWindowCancel);
  };

  return (
    <div
      className={`trackCard ${track.locked ? "trackCard--locked" : ""} ${
        isActive ? "is-active" : ""
      } ${isGhost ? "trackCard--ghost" : ""} ${
        isDraggedOriginal ? "trackCard--draggedOriginal" : ""
      }`}
    >
      {!isDraggedOriginal && (
        <>
          <span
            className={`trackCard_drag ${
              isTutorialDragHighlighted ? "trackCard_drag--tutorial" : ""
            }`}
            onPointerDown={handlePointerDown}
          >
            ⋮⋮
          </span>

          <button
            type="button"
            className="trackCard_play"
            disabled={track.locked || isGhost}
            onClick={(event) => {
              event.stopPropagation();
              if (!isGhost) onPlayPreview(track.id);
            }}
          >
            <img
              src={
                isActive
                  ? "/assets/images/ui/game/pause.png"
                  : "/assets/images/ui/game/play.png"
              }
              alt={isActive ? "Pause" : `Écouter ${track.name}`}
            />
          </button>

          <div className="trackCard_wave">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                style={{
                  height: `${getWaveHeight(track.id, index)}px`,
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>

          {track.locked && (
            <div className="trackCard_lock">
              <img src="/assets/images/ui/game/lock.png" alt="Verrouillé" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TrackCard;
