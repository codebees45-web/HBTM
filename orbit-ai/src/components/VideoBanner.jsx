export default function VideoBanner() {
  return (
    <section className="l-banner-wrapper">
      <div className="l-banner">
        <div className="l-banner-bg">
          {/* Animated gradient background */}
          <div className="l-banner-gradient"></div>
          <div className="l-banner-overlay"></div>
        </div>
        <div className="l-banner-content">
          <h2>Your journey to becoming</h2>
          <p>Curated paths for every dreamer, creator, and seeker</p>
        </div>
      </div>
    </section>
  )
}
