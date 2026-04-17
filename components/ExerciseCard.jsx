export default function ExerciseCard({ exercise: ex, index: i }) {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtubeSearch)}`;
  return (
    <div className="exercise-card">
      <div className="exercise-top">
        <div className="exercise-gif">🏋️</div>
        <div className="exercise-info">
          <div className="exercise-name">{i + 1}. {ex.name}</div>
          <div className="exercise-meta">
            <span className="meta-tag">{ex.sets}</span>
            <span className="meta-tag">{ex.muscle}</span>
          </div>
          <div className="exercise-desc">{ex.description}</div>
          <a className="yt-link" href={ytUrl} target="_blank" rel="noopener noreferrer">
            ▶ Watch tutorial
          </a>
        </div>
      </div>
    </div>
  );
}
