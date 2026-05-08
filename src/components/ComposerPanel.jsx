function ComposerPanel({ compositeur, mood = "neutral", onOpenBio }) {
  const style = compositeur.portraitStyle || {};
  const image = compositeur.images[mood] || compositeur.images.neutral;

  return (
    <div className="composerPanel">
      <div className="composerPanel_portrait">
        <img
          src={image}
          alt={compositeur.name}
          style={{
            transform: `translateX(0) scale(${style.scale || 1})`,
          }}
        />
      </div>

      <button type="button" className="composerPanel_book" onClick={onOpenBio}>
        <img
          src="/assets/images/ui/game/book.png"
          alt={`Voir la biographie de ${compositeur.name}`}
        />
      </button>
    </div>
  );
}

export default ComposerPanel;
