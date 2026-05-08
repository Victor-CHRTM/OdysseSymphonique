import { Link } from "react-router";
import compositeurs from "../data/compositeurs.json";

function CompositionCard({ composition }) {
  const compositeur = compositeurs.find((c) => c.id === composition.composerId);
  const imageStyle = composition.selectionImageStyle || {};

  return (
    <div className="compositionCard">
      <div className="compositionCard_left">
        <h3 className="title">{composition.title}</h3>

        <div className="infos">
          <p className="infoItem name">
            <img src="/assets/images/ui/selection/icon-composer.png" alt="" />
            <span>{compositeur?.name}</span>
          </p>

          <p className="infoItem year">
            <img src="/assets/images/ui/selection/icon-calendar.png" alt="" />
            <span>{composition.year}</span>
          </p>

          <p className="infoItem duration">
            <img src="/assets/images/ui/selection/icon-time.png" alt="" />
            <span>{composition.duration}s</span>
          </p>
        </div>

        <div className="actions">
          <Link
            to=""
            className="info"
            aria-label={`Informations sur ${composition.title}`}
          >
            <img src="/assets/images/ui/game/btn-info.png" alt="" />
          </Link>
          <Link to={`/game/${composition.id}`} className="play">
            Jouer {">"}
          </Link>
        </div>
      </div>
      <div className="compositionCard_right">
        <img
          src={composition.selectionImage}
          alt={composition.title}
          className="selectionImage"
          style={{
            width: `${imageStyle.width || 280}px`,
            top: `${imageStyle.top || -20}px`,
            left: `${imageStyle.left || -50}px`,
          }}
        />
      </div>
    </div>
  );
}

export default CompositionCard;
