function InstrumentZone({
  zone,
  instrument,
  isPlaced,
  showInfo,
  onSelect,
  volume = 70,
  isMuted = false,
  onToggleMute,
  onChangeVolume,
  onOpenInstrument,
}) {
  const imageSrc = isPlaced ? zone.placedImage || zone.image : zone.image;

  const handleClick = () => {
    if (!isPlaced) return;

    if (showInfo) {
      onSelect(null);
      return;
    }

    onSelect(zone.instrumentId);
  };

  return (
    <div
      className={`instrumentZone ${isPlaced ? "instrumentZone--placed" : ""}`}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}px`,
        height: `${zone.height}px`,
      }}
      data-instrument-id={zone.instrumentId}
      data-label={zone.label || instrument?.name}
      onClick={handleClick}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={instrument?.name}
          className="instrumentZone_image"
        />
      )}

      {showInfo && (
        <div
          className="instrumentInfoCard"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="instrumentInfoCard_title">{zone.label}</div>
          <div className="instrumentInfoCard_line"></div>

          <div className="instrumentInfoCard_actions">
            <button
              type="button"
              className="instrumentInfoCard_iconButton"
              onClick={(event) => {
                event.stopPropagation();
                onOpenInstrument?.();
              }}
            >
              <img
                src="/assets/images/ui/game/btn-info.png"
                alt="Informations"
              />
            </button>

            <button
              type="button"
              className={`instrumentInfoCard_iconButton ${
                isMuted ? "is-muted" : ""
              }`}
              onClick={onToggleMute}
            >
              <img
                src={
                  isMuted
                    ? "/assets/images/ui/game/volume-muted.png"
                    : "/assets/images/ui/game/volume-high.png"
                }
                alt={isMuted ? "Son désactivé" : "Son activé"}
              />
            </button>

            <input
              className="instrumentInfoCard_range"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              style={{
                "--volume-percent": `${isMuted ? 0 : volume}%`,
              }}
              onChange={(event) => onChangeVolume(event.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default InstrumentZone;
