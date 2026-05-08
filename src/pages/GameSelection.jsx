import { useState } from "react";

import ThemeButton from "../components/ThemeButton";
import CompositionCard from "../components/CompositionCard";
import Menu from "../components/TopBar";

import Themes from "../data/themes.json";
import Compositions from "../data/compositions.json";

function GameSelection() {
  const [selectedTheme, setSelectedTheme] = useState("jeux_video");

  const filteredCompositions = Compositions.filter(
    (comp) => comp.themeId === selectedTheme,
  );

  return (
    <div className="gameSelection">
      {/* TopBar */}
      <Menu />

      <div className="gameSelection_content">
        {/* THEMES */}
        <div className="themes_cards">
          {Themes.map((theme) => (
            <ThemeButton
              key={theme.id}
              theme={theme}
              isActive={theme.id === selectedTheme}
              onClick={() => setSelectedTheme(theme.id)}
            />
          ))}
        </div>

        {/* COMPOSITIONS */}
        <div className="compositions_cards">
          {filteredCompositions.map((composition) => (
            <CompositionCard key={composition.id} composition={composition} />
          ))}
        </div>
      </div>

      {/* Fond d'opacité (blur) */}
      <div className="opacity-selection"></div>
    </div>
  );
}

export default GameSelection;
