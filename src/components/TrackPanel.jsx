import TrackCard from "./TrackCard";

function TrackPanel({
  composition,
  tracks,
  activePreviewId,
  onPlayPreview,
  draggedTrackId,
  onDragStart,
  onDragMove,
  onDragEnd,
  tutorialPhase = null,
}) {
  const firstRealTrackId = tracks.find(
    (track) => !track.isTrap && track.type === "audio",
  )?.id;

  return (
    <aside className="tracksPanel">
      <div className="tracksPanel_icon">
        <img src={composition.tracksPanelIcon} alt={composition.title} />
      </div>

      <h2>Pistes sonores</h2>

      <div className="tracksPanel_separator"></div>

      <div className="tracksPanel_list">
        {tracks.map((track) => {
          const isTutorialUnlocked =
            tutorialPhase >= 1 && track.id === firstRealTrackId;

          const isTutorialDragHighlighted =
            tutorialPhase >= 2 && track.id === firstRealTrackId;

          return (
            <TrackCard
              key={track.id}
              track={{
                ...track,
                locked: isTutorialUnlocked ? false : track.locked,
              }}
              isActive={activePreviewId === track.id}
              isDraggedOriginal={draggedTrackId === track.id}
              onPlayPreview={onPlayPreview}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              isTutorialDragHighlighted={isTutorialDragHighlighted}
            />
          );
        })}
      </div>
    </aside>
  );
}

export default TrackPanel;
