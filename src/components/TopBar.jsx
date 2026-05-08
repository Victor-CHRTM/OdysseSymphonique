import { Link, useLocation, useNavigate } from "react-router";

function TopBar({ composition, compositeur, onOpenTutorial }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const isHome = path === "/";
  const isSelection = path === "/selection";
  const isGame = path.startsWith("/game/");

  return (
    <div className="top-bar">
      {/* LEFT */}
      {isHome ? (
        <Link to="" className="top-bar_button profile">
          <img src="/assets/images/ui/home/profil.png" alt="Profil" />
        </Link>
      ) : (
        <a onClick={() => navigate(-1)} className="back">
          {"<"}
        </a>
      )}

      {/* CENTER (search uniquement sur selection) */}
      {isSelection && (
        <div className="search-bar">
          <input type="text" placeholder="Rechercher une musique..." />
        </div>
      )}
      {/* CENTER (affichage du compositeur et de sa composition pour le jeu) */}
      {isGame && composition && compositeur && (
        <button type="button" className="game-info-bar">
          <span>
            {compositeur.name}, {composition.title}
          </span>

          <img
            src="/assets/images/ui/game/flecheBas.png"
            alt="Flèche afficher plus"
            className="game-info-bar_arrow-bas"
          />
        </button>
      )}

      {/* RIGHT */}
      <div className="top-bar_right">
        {isHome && (
          <>
            <Link to="" className="top-bar_button language"></Link>
            <Link to="" className="top-bar_button informations">
              ?
            </Link>
          </>
        )}

        {isSelection && (
          <img
            src="/assets/images/ui/logos/Noir.png"
            alt="Logo"
            className="logo"
          />
        )}

        {isGame && (
          <Link
            to=""
            className="top-bar_button informations"
            onClick={onOpenTutorial}
            aria-label="Revoir le tutoriel"
          >
            ?
          </Link>
        )}
      </div>
    </div>
  );
}

export default TopBar;
