import { Link } from "react-router";

import Menu from "../components/TopBar";

function Home() {
  return (
    <div className="home">
      {/* Top bar */}
      <Menu />

      {/* Logo */}
      <div className="logo">
        <img
          src="/assets/images/ui/logos/Blanc.png"
          alt="Odyssée Symphonique"
        />
      </div>

      {/* Bouton - Commencer l'expérience */}
      <div className="btn-start-experience">
        <Link to="/selection" className="Link">
          <img
            src="/assets/images/ui/home/btn-start.png"
            alt="Bouton commencer l'expérience"
          />
          <span>Commencer l'expérience</span>
        </Link>
      </div>

      {/* Fond d'opacité */}
      <div className="opacity-home"></div>
    </div>
  );
}

export default Home;
