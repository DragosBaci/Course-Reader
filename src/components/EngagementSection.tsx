import { IconAlarm, IconFlame } from './Icons'
import './EngagementSection.css'

function StreakRing() {
  const size = 92
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const coursePct = 0
  const visitPct = 100
  const innerR = r - stroke * 1.4
  const innerC = 2 * Math.PI * innerR

  return (
    <div className="streak-ring" aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="streak-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="streak-ring__progress streak-ring__progress--course"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - coursePct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle
          className="streak-ring__track streak-ring__track--inner"
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="streak-ring__progress streak-ring__progress--visit"
          cx={size / 2}
          cy={size / 2}
          r={innerR}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={innerC}
          strokeDashoffset={innerC * (1 - visitPct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="streak-ring__labels">
        <span className="streak-ring__line">0/30 course min</span>
        <span className="streak-ring__line">1/1 visit</span>
        <span className="streak-ring__dates">Mar 22 - 28</span>
      </div>
    </div>
  )
}

export function EngagementSection() {
  return (
    <section className="ud-engage" aria-label="Learning engagement">
      <div className="ud-engage__inner">
        <div className="ud-card ud-card--streak">
          <div className="ud-card__streak-copy">
            <h2 className="ud-card__title">Start a new streak</h2>
            <p className="ud-card__sub">
              Visit ring complete! Now, close out your watch ring.
            </p>
          </div>
          <div className="ud-card__streak-mid">
            <IconFlame className="ud-flame" />
            <div>
              <div className="ud-streak-weeks">0 weeks</div>
              <div className="ud-streak-label">Current streak</div>
            </div>
          </div>
          <StreakRing />
        </div>

        <div className="ud-card ud-card--schedule">
          <div className="ud-card__schedule-icon">
            <IconAlarm />
          </div>
          <div className="ud-card__schedule-body">
            <h2 className="ud-card__title">Schedule learning time</h2>
            <p className="ud-card__desc">
              Learning a little each day adds up. Research shows that students
              who make learning a habit are more likely to reach their goals.
              Set time aside to learn and get reminders using your scheduler.
            </p>
            <div className="ud-card__actions">
              <button type="button" className="ud-btn ud-btn--outline">
                Get started
              </button>
              <button type="button" className="ud-btn ud-btn--text">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
