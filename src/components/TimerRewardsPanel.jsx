import { useEffect, useState } from "react";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function TimerRewardsPanel({
  duration,
  compositionId,
  currentTime,
  isPlaying,
  onTogglePlay,
}) {
  const [unlockedChests, setUnlockedChests] = useState([]);
  const [openedChests, setOpenedChests] = useState([]);

  const checkpoints = [{ percent: 15 }, { percent: 48 }, { percent: 83 }];

  const checkpointsWithTime = checkpoints.map((checkpoint) => ({
    ...checkpoint,
    time: Math.floor((duration * checkpoint.percent) / 100),
  }));

  useEffect(() => {
    checkpointsWithTime.forEach((checkpoint, chestIndex) => {
      if (currentTime >= checkpoint.time) {
        setUnlockedChests((prev) => {
          if (prev.includes(chestIndex)) return prev;
          return [...prev, chestIndex];
        });
      }
    });
  }, [currentTime, checkpointsWithTime]);

  const progressPercent = Math.min((currentTime / duration) * 100, 100);

  const handleOpenChest = (chestIndex) => {
    if (!unlockedChests.includes(chestIndex)) return;

    setOpenedChests((prev) => {
      if (prev.includes(chestIndex)) return prev;
      return [...prev, chestIndex];
    });
  };

  return (
    <div className="timerRewardsPanel">
      <button
        type="button"
        className={`timerRewardsPanel_pause ${
          isPlaying ? "is-playing" : "is-paused"
        }`}
        onClick={onTogglePlay}
      >
        <img
          src={
            isPlaying
              ? "/assets/images/ui/game/pause.png"
              : "/assets/images/ui/game/play2.png"
          }
          alt={isPlaying ? "Pause" : "Lecture"}
        />
      </button>

      <div className="timerRewardsPanel_infos">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(Math.max(duration - currentTime, 0))}</span>
      </div>

      <div className="timerRewardsPanel_bar">
        <div
          className="timerRewardsPanel_progress"
          style={{ width: `${progressPercent}%` }}
        />

        {checkpointsWithTime.map((checkpoint, index) => {
          const isPassed = unlockedChests.includes(index);

          return (
            <span
              key={index}
              className={`timerRewardsPanel_checkpoint ${
                isPassed ? "is-passed" : ""
              }`}
              style={{ left: `${checkpoint.percent}%` }}
            />
          );
        })}
      </div>

      <div className="timerRewardsPanel_rewards">
        {checkpointsWithTime.map((checkpoint, chestIndex) => {
          const isUnlocked = unlockedChests.includes(chestIndex);
          const isOpened = openedChests.includes(chestIndex);
          const chestNumber = chestIndex + 1;

          return (
            <button
              key={chestIndex}
              type="button"
              className={`timerRewardsPanel_chest ${
                isUnlocked ? "is-unlocked" : ""
              } ${isOpened ? "is-opened" : ""}`}
              onClick={() => handleOpenChest(chestIndex)}
              disabled={!isUnlocked}
            >
              <img
                src={
                  isOpened
                    ? `/assets/images/compositions/${compositionId}/coffres/coffre${chestNumber}.png`
                    : "/assets/images/ui/game/lockedChest.png"
                }
                alt={`Récompense ${chestNumber}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TimerRewardsPanel;
