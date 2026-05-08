function GameOverlayPanel({ children, onClose }) {
  return (
    <div className="gameOverlay">
      <div className="gameOverlay_backdrop" onClick={onClose}></div>

      <div className="gameOverlay_panel">{children}</div>
    </div>
  );
}

export default GameOverlayPanel;
