function ThemeButton({ theme, onClick, isActive }) {
  const imageSrc = isActive
    ? `/assets/images/themes/${theme.id}-selected.png`
    : `/assets/images/themes/${theme.id}.png`;

  return (
    <div
      onClick={onClick}
      className={`themeCard ${isActive ? "themeCard--active" : ""}`}
    >
      <img src={imageSrc} alt={theme.name} />

      <p>{theme.name}</p>
    </div>
  );
}

export default ThemeButton;
