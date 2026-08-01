export default function CommunityGallery() {
  const ROW1 = [
    { name: 'Sarah Chen', city: 'San Francisco', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', initials: 'SC', width: 250 },
    { name: 'Marcus Johnson', city: 'New York', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', initials: 'MJ', width: 160 },
    { name: 'Priya Sharma', city: 'Mumbai', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', initials: 'PS', width: 250 },
    { name: 'James Wilson', city: 'London', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', initials: 'JW', width: 250 },
    { name: 'Amara Obi', city: 'Lagos', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', initials: 'AO', width: 160 },
    { name: 'Lin Wei', city: 'Shanghai', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', initials: 'LW', width: 250 },
    { name: 'Elena Rodriguez', city: 'Madrid', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)', initials: 'ER', width: 250 },
    { name: 'David Park', city: 'Seoul', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)', initials: 'DP', width: 160 },
  ];
  
  const ROW2 = [
    { name: 'Fatima Al-Rashid', city: 'Dubai', gradient: 'linear-gradient(135deg, #96fbc4, #f9f586)', initials: 'FA', width: 250 },
    { name: 'Thomas Berg', city: 'Stockholm', gradient: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)', initials: 'TB', width: 160 },
    { name: 'Yuki Tanaka', city: 'Tokyo', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', initials: 'YT', width: 250 },
    { name: 'Grace Mwangi', city: 'Nairobi', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', initials: 'GM', width: 250 },
    { name: 'Roberto Silva', city: 'São Paulo', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', initials: 'RS', width: 160 },
    { name: 'Annika Larsen', city: 'Copenhagen', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', initials: 'AL', width: 250 },
    { name: 'Omar Hassan', city: 'Cairo', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', initials: 'OH', width: 250 },
    { name: 'Maria Costa', city: 'Lisbon', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)', initials: 'MC', width: 160 },
  ];

  return (
    <section className="l-community">
      <h2 className="l-community-title" style={{ textAlign: 'center' }}>People growing with AETHER</h2>
      <div className="l-community-row scroll-left">
        {[...ROW1, ...ROW1].map((p, i) => (
          <div key={i} className="l-community-card" style={{ background: p.gradient, width: `${p.width}px` }}>
            <div className="l-community-card-initials" style={{ fontSize: '60px', color: 'rgba(255, 255, 255, 0.3)' }}>{p.initials}</div>
            <div className="l-community-card-overlay">
              <div className="l-community-card-info">
                <div className="l-community-card-name">{p.name}</div>
                <div className="l-community-card-city">{p.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="l-community-row scroll-right">
        {[...ROW2, ...ROW2].map((p, i) => (
          <div key={i} className="l-community-card" style={{ background: p.gradient, width: `${p.width}px` }}>
            <div className="l-community-card-initials" style={{ fontSize: '60px', color: 'rgba(255, 255, 255, 0.3)' }}>{p.initials}</div>
            <div className="l-community-card-overlay">
              <div className="l-community-card-info">
                <div className="l-community-card-name">{p.name}</div>
                <div className="l-community-card-city">{p.city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
