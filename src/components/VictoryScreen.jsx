import { Link } from "react-router";
import GameOverlayPanel from "./GameOverlayPanel";

function VictoryScreen({ rewards = [], recommendations = [], onReplay }) {
  return (
    <GameOverlayPanel>
      <div className="victoryScreen">
        <h2>FÉLICITATIONS</h2>

        <div className="victoryScreen_actions">
          <button type="button" onClick={onReplay}>
            <img
              src="/assets/images/ui/game/btn-replay.png"
              alt="Rejouer la Composition"
            />
          </button>

          <Link to="/selection">
            <img
              src="/assets/images/ui/game/btn-home.png"
              alt="Retour Selection Composition"
            />
          </Link>

          <button type="button">
            <img src="/assets/images/ui/game/btn-share.png" alt="Partager" />
          </button>
        </div>

        <div className="victoryScreen_sectionTitle">
          <img src="/assets/images/ui/game/final-arrow-left.png" alt="" />
          <span>Récompenses</span>
          <img src="/assets/images/ui/game/final-arrow-right.png" alt="" />
        </div>

        <div className="victoryScreen_rewards">
          {rewards.map((reward) => (
            <div key={reward.id} className="victoryScreen_reward">
              <div className="victoryScreen_rewardCard">
                <span className="victoryScreen_newBadge">NOUVEAU</span>

                <img
                  src={reward.image}
                  alt={reward.name}
                  className="victoryScreen_rewardImage"
                />

                <div className="victoryScreen_rewardName">{reward.name}</div>
              </div>

              <button type="button" className="victoryScreen_equipButton">
                Équiper
              </button>
            </div>
          ))}
        </div>

        <div className="victoryScreen_sectionTitle">
          <img src="/assets/images/ui/game/final-arrow-left.png" alt="" />
          <span>Recommandations</span>
          <img src="/assets/images/ui/game/final-arrow-right.png" alt="" />
        </div>

        <div className="victoryScreen_recommendations">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="victoryScreen_recommendation"
            >
              <p>{recommendation.title}</p>

              <div className="victoryScreen_recommendationActions">
                <button type="button">
                  <img
                    src="/assets/images/ui/game/btn-info.png"
                    alt="Informations"
                  />
                </button>

                <button type="button">
                  <img src="/assets/images/ui/game/play2.png" alt="Lire" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameOverlayPanel>
  );
}

export default VictoryScreen;
