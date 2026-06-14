import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  primary: "#00E5FF",
  secondary: "#7C4DFF",
  bg: "#0A0A0A",
  surface: "#111111",
  surface2: "#161616",
  border: "rgba(255,255,255,0.07)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.6)",
  textMuted: "rgba(255,255,255,0.35)",
};

// ─── Utility ───────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCounter(target, active, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

// ─── Particles Background ───────────────────────────────────────────────────

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? COLORS.primary : COLORS.secondary,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.06 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Scroll Progress ────────────────────────────────────────────────────────

function ScrollProgress() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProg(total ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: "rgba(255,255,255,0.05)" }}>
      <div style={{ height: "100%", width: `${prog}%`, background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`, transition: "width 0.1s" }} />
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ["About", "Skills", "Projects", "Timeline", "Services", "Contact"];
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const scrollTo = (id) => { document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  return (
    <nav style={{
      position: "fixed", top: 3, left: 0, right: 0, zIndex: 1000,
      padding: "0 2rem", height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,10,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
      transition: "all 0.3s",
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 1 }}>
        <span style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Elite</span>
        <span style={{ color: "#fff" }}>Headshoter</span>
      </div>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {links.map(l => (
          <button key={l} onClick={() => scrollTo(l)}
            style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "color 0.2s", padding: "4px 0" }}
            onMouseEnter={e => e.target.style.color = COLORS.primary}
            onMouseLeave={e => e.target.style.color = COLORS.textSecondary}>
            {l}
          </button>
        ))}
        <button onClick={() => scrollTo("Contact")} style={{
          background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`,
          border: `1px solid ${COLORS.primary}44`, color: COLORS.primary,
          padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primary}33, ${COLORS.secondary}33)`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`; }}>
          Hire Me
        </button>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function GradientText({ children, style = {} }) {
  return <span style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>{children}</span>;
}

function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", background: COLORS.bg }}>
      <Particles />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,229,255,0.07) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 50% at 80% 80%, rgba(124,77,255,0.08) 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 2rem", width: "100%", display: "flex", alignItems: "center", gap: "4rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${COLORS.primary}15`, border: `1px solid ${COLORS.primary}30`, borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, animation: "pulse 2s infinite" }} />
            <span style={{ color: COLORS.primary, fontSize: 13, fontWeight: 600 }}>Available for projects</span>
          </div>
          <div style={{ fontSize: 16, color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 4, textTransform: "uppercase" }}>Hello, I'm</div>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 12px 0", color: "#fff", letterSpacing: -2 }}>
            Kriti
          </h1>
          <div style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700, marginBottom: 20 }}>
            <GradientText>Kritika Agarwal</GradientText>
          </div>
          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: COLORS.textSecondary, lineHeight: 1.7, maxWidth: 540, marginBottom: 40 }}>
            Electrical Engineering Student · Developer · Hacker · Automation Enthusiast
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "View Projects", action: () => scrollTo("projects"), primary: true },
              { label: "Contact Me", action: () => scrollTo("contact"), primary: false },
              { label: "Download Resume", action: () => {}, primary: false },
            ].map(({ label, action, primary }) => (
              <button key={label} onClick={action} style={{
                padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "all 0.25s",
                background: primary ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` : "transparent",
                border: primary ? "none" : `1px solid ${COLORS.border}`,
                color: primary ? "#000" : "#fff",
                boxShadow: primary ? `0 0 30px ${COLORS.primary}33` : "none",
              }}
                onMouseEnter={e => { if (!primary) { e.currentTarget.style.borderColor = COLORS.primary; e.currentTarget.style.color = COLORS.primary; } else { e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { if (!primary) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = "#fff"; } else { e.currentTarget.style.transform = "translateY(0)"; } }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 48 }}>
            {[
              { icon: "⌨", label: "Developer" },
              { icon: "⚡", label: "EE Student" },
              { icon: "🤖", label: "Automation" },
              { icon: "🕵️‍♂️", label: "Hacker" },
            ].map(({ icon, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "0 0 340px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s ease 0.3s" }}>
          <div style={{
            width: 340, height: 340, borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%",
            background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`,
            border: `2px solid ${COLORS.primary}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            boxShadow: `0 0 80px ${COLORS.primary}20, 0 0 40px ${COLORS.secondary}15`,
            animation: "float 6s ease-in-out infinite",
          }}>
            <div style={{ fontSize: 120, filter: "drop-shadow(0 0 20px rgba(0,229,255,0.3))" }}>👨‍💻</div>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(0,229,255,0.08), transparent 60%)" }} />
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.2)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
    </section>
  );
}

// ─── Glass Card ──────────────────────────────────────────────────────────────

function GlassCard({ children, style = {}, hover = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? COLORS.primary + "44" : COLORS.border}`,
        borderRadius: 20,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${COLORS.primary}15` : "none",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({ id, children, style = {} }) {
  return (
    <section id={id} style={{ padding: "100px 0", position: "relative", ...style }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        {children}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: 70, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease" }}>
      <div style={{ display: "inline-block", background: `${COLORS.primary}15`, border: `1px solid ${COLORS.primary}30`, borderRadius: 100, padding: "4px 16px", marginBottom: 16, fontSize: 12, color: COLORS.primary, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, color: "#fff", margin: "0 0 16px 0", lineHeight: 1.1 }}>
        {title}
      </h2>
      {subtitle && <p style={{ color: COLORS.textSecondary, fontSize: 17, maxWidth: 560, margin: "0 auto" }}>{subtitle}</p>}
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function About() {
  const [ref, visible] = useInView();
  const traits = [
    { icon: "⚡", title: "EE Student", desc: "Pursuing Electrical Engineering with a passion for bridging hardware and software." },
    { icon: "🐍", title: "Python Dev", desc: "Building automation tools, APIs, and bots that solve real-world problems." },
    { icon: "📱", title: "Flutter Dev", desc: "Creating cross-platform mobile apps with beautiful, responsive UI." },
    { icon: "🤖", title: "Automation", desc: "Engineering workflows and Telegram bots to automate repetitive tasks." },
    { icon: "☁️", title: "Cloud Native", desc: "Deploying on Vercel, Netlify, Render, and Firebase for scalable solutions." },
    { icon: "🎬", title: "Hacker", desc: "I have developed hacks for Free Fire and BGMI up to now." },
  ];
  return (
    <Section id="about" style={{ background: COLORS.surface }}>
      <SectionHeader eyebrow="About Me" title="Who I Am" subtitle="A driven engineering student building the future one line of code at a time." />
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        {traits.map(({ icon, title, desc }, i) => (
          <GlassCard key={title} style={{ padding: 28, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${i * 0.1}s` }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{title}</h3>
            <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────

function SkillBar({ name, level, color, visible, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { if (visible) setTimeout(() => setWidth(level), delay); }, [visible, level, delay]);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: COLORS.textSecondary, fontSize: 14, fontWeight: 600 }}>{name}</span>
        <span style={{ color, fontSize: 13, fontWeight: 700 }}>{level}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${COLORS.primary}, ${color})`, borderRadius: 100, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function Skills() {
  const [ref, visible] = useInView();
  const groups = [
    { title: "Programming", color: COLORS.primary, skills: [{ name: "Python", level: 85 }, { name: "JavaScript", level: 75 }, { name: "Dart", level: 70 }, { name: "HTML / CSS", level: 90 }] },
    { title: "Frameworks & Tools", color: COLORS.secondary, skills: [{ name: "Flutter", level: 72 }, { name: "Flask", level: 78 }, { name: "Firebase", level: 80 }, { name: "Git & GitHub", level: 85 }] },
    { title: "Cloud & Deployment", color: "#00BFA5", skills: [{ name: "Vercel / Netlify", level: 82 }, { name: "Firebase Hosting", level: 80 }, { name: "Render", level: 75 }, { name: "Android Studio", level: 68 }] },
  ];
  return (
    <Section id="skills">
      <SectionHeader eyebrow="Skills" title="Tech Stack" subtitle="Languages, frameworks, and tools I use to build production-ready applications." />
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
        {groups.map(({ title, color, skills }, gi) => (
          <GlassCard key={title} style={{ padding: 32, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${gi * 0.15}s` }}>
            <h3 style={{ color, fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>{title}</h3>
            {skills.map((s, i) => <SkillBar key={s.name} {...s} color={color} visible={visible} delay={gi * 150 + i * 100} />)}
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────

const PROJECTS = [
  { title: "Portfolio Website", desc: "Personal portfolio showcasing skills, projects, and achievements with premium UI.", tags: ["React", "Tailwind", "Framer Motion"], emoji: "🌐", cat: "Web" },
  { title: "Electrical Formula API", desc: "RESTful API providing electrical engineering formulas for calculations and educational use.", tags: ["Python", "Flask", "REST API"], emoji: "⚡", cat: "API" },
  { title: "Telegram Bots", desc: "Suite of automation bots for task management, notifications, and custom workflows.", tags: ["Python", "Telegram API", "Automation"], emoji: "🤖", cat: "Bot" },
  { title: "Birthday Website Generator", desc: "Dynamic birthday greeting website generator with customizable templates.", tags: ["HTML", "JavaScript", "Firebase"], emoji: "🎂", cat: "Web" },
  { title: "Firebase Applications", desc: "Real-time applications leveraging Firebase for auth, database, and hosting.", tags: ["Firebase", "Flutter", "Firestore"], emoji: "🔥", cat: "App" },
  { title: "Tournament Management", desc: "Full-featured system for managing esports and gaming tournaments end-to-end.", tags: ["Flutter", "Firebase", "Dart"], emoji: "🏆", cat: "App" },
  { title: "E Sports Hub", desc: "Community platform connecting esports players, teams, and event organizers.", tags: ["Flutter", "Firebase", "Dart"], emoji: "🎮", cat: "App" },
  { title: "Play Clash Arena", desc: "Competitive gaming arena platform with matchmaking and leaderboard systems.", tags: ["Flutter", "Firebase", "REST API"], emoji: "⚔️", cat: "App" },
  { title: "AI Tools Integration", desc: "Projects integrating LLM and AI APIs to build intelligent automation workflows.", tags: ["Python", "AI APIs", "Automation"], emoji: "🧠", cat: "AI" },
];

function Projects() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Web", "API", "Bot", "App", "AI"];
  const filtered = filter === "All" ? PROJECTS : PROJECTS.filter(p => p.cat === filter);

  return (
    <Section id="projects" style={{ background: COLORS.surface }}>
      <SectionHeader eyebrow="Projects" title="What I've Built" subtitle="From APIs to mobile apps — a curated selection of my best work." />
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.25s",
            background: filter === c ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` : "transparent",
            border: `1px solid ${filter === c ? "transparent" : COLORS.border}`,
            color: filter === c ? "#000" : COLORS.textSecondary,
          }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
        {filtered.map((p, i) => (
          <ProjectCard key={p.title} {...p} delay={i * 60} />
        ))}
      </div>
    </Section>
  );
}

function ProjectCard({ title, desc, tags, emoji, delay }) {
  const [ref, visible] = useInView(0.1);
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.02)", border: `1px solid ${hov ? COLORS.primary + "44" : COLORS.border}`,
        borderRadius: 20, padding: 28, transition: "all 0.3s", cursor: "default",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionProperty: "opacity, transform, border-color, box-shadow",
        transitionDuration: `0.6s, 0.6s, 0.3s, 0.3s`,
        transitionDelay: `${delay}ms`,
        boxShadow: hov ? `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${COLORS.primary}10` : "none",
      }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`, border: `1px solid ${COLORS.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 20 }}>
        {emoji}
      </div>
      <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{title}</h3>
      <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: "0 0 20px" }}>{desc}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {tags.map(t => (
          <span key={t} style={{ background: `${COLORS.secondary}20`, border: `1px solid ${COLORS.secondary}30`, color: COLORS.secondary, padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  const [ref, visible] = useInView(0.3);
  const stats = [
    { label: "Projects Completed", target: 15, suffix: "+" },
    { label: "APIs Built", target: 8, suffix: "+" },
    { label: "Apps Developed", target: 6, suffix: "+" },
    { label: "Users Served", target: 500, suffix: "+" },
  ];
  return (
    <Section id="stats">
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
        {stats.map(({ label, target, suffix }, i) => (
          <StatCard key={label} label={label} target={target} suffix={suffix} active={visible} delay={i * 150} />
        ))}
      </div>
    </Section>
  );
}

function StatCard({ label, target, suffix, active, delay }) {
  const count = useCounter(target, active, 2000);
  return (
    <GlassCard style={{ padding: 36, textAlign: "center", opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.9)", transition: `all 0.6s ease ${delay}ms` }}>
      <div style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 900, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 12, fontWeight: 600 }}>{label}</div>
    </GlassCard>
  );
}

// ─── Achievements ─────────────────────────────────────────────────────────────

function Achievements() {
  const items = [
    { icon: "🎓", title: "Engineering Student", desc: "Pursuing B.Tech in Electrical Engineering" },
    { icon: "🌐", title: "Multiple Web Projects", desc: "Designed and deployed full-stack web apps" },
    { icon: "📡", title: "API Development", desc: "Built and published REST APIs in production" },
    { icon: "⚙️", title: "Automation Projects", desc: "Automated workflows saving hours per week" },
    { icon: "🤖", title: "Telegram Bots", desc: "Developed multi-functional Telegram bots" },
    { icon: "🎬", title: "Hacker", desc: "I have developed hacks for Free Fire and BGMI up to now." },
  ];
  const [ref, visible] = useInView();
  return (
    <Section id="achievements" style={{ background: COLORS.surface }}>
      <SectionHeader eyebrow="Achievements" title="Milestones" subtitle="Key accomplishments on my journey as a developer and creator." />
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {items.map(({ icon, title, desc }, i) => (
          <GlassCard key={title} style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transition: `all 0.6s ease ${i * 0.1}s` }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
            <div>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{title}</h3>
              <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── Services ────────────────────────────────────────────────────────────────

function Services() {
  const services = [
    { icon: "🌐", title: "Website Development", desc: "Modern, responsive websites with smooth animations and premium UX." },
    { icon: "🗂️", title: "Portfolio Creation", desc: "Stunning personal portfolios that make first impressions count." },
    { icon: "📱", title: "Flutter Apps", desc: "Cross-platform mobile applications for Android and iOS." },
    { icon: "🔥", title: "Firebase Integration", desc: "Real-time databases, auth, and cloud functions with Firebase." },
    { icon: "🔌", title: "API Development", desc: "Robust REST APIs powering web, mobile, and third-party integrations." },
    { icon: "🤖", title: "Telegram Bots", desc: "Custom bots for notifications, automation, and community management." },
    { icon: "⚙️", title: "Automation Solutions", desc: "Script-driven workflows that eliminate repetitive manual tasks." },
  ];
  const [ref, visible] = useInView();
  return (
    <Section id="services">
      <SectionHeader eyebrow="Services" title="What I Offer" subtitle="From concept to deployment — end-to-end solutions tailored to your needs." />
      <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
        {services.map(({ icon, title, desc }, i) => (
          <GlassCard key={title} style={{ padding: 30, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${i * 0.08}s` }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.secondary}22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18, border: `1px solid ${COLORS.primary}25` }}>
              {icon}
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: "0 0 10px" }}>{title}</h3>
            <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function Timeline() {
  const events = [
    { year: "2024", title: "Started Engineering", desc: "Enrolled in B.Tech Electrical Engineering. Began exploring the intersection of hardware and software.", side: "left" },
    { year: "2024", title: "Web Development", desc: "Dived into HTML, CSS, and JavaScript. Built first projects and deployed them to the web.", side: "right" },
    { year: "2025", title: "APIs & Bots", desc: "Launched the Electrical Formula API. Developed Telegram bots for automation workflows.", side: "left" },
    { year: "2025", title: "Hacking", desc: "Started Hacking and making mod menus and mod of Free fire, Bgmi,(Pubg Mobile "for other servers") and Offline games ", side: "right" },
    { year: "2026", title: "Advanced Applications", desc: "Engineering AI-integrated tools, Flutter mobile apps, and scaling projects for real users.", side: "left" },
  ];
  const [ref, visible] = useInView(0.05);
  return (
    <Section id="timeline" style={{ background: COLORS.surface }}>
      <SectionHeader eyebrow="Journey" title="My Timeline" subtitle="Key moments that shaped who I am as a developer and creator." />
      <div ref={ref} style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${COLORS.primary}55, ${COLORS.secondary}55)`, transform: "translateX(-50%)" }} />
        {events.map(({ year, title, desc, side }, i) => (
          <div key={i} style={{ display: "flex", justifyContent: side === "left" ? "flex-end" : "flex-start", paddingRight: side === "left" ? "calc(50% + 30px)" : 0, paddingLeft: side === "right" ? "calc(50% + 30px)" : 0, marginBottom: 40, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${i * 0.15}s` }}>
            <GlassCard hover={false} style={{ padding: 24, maxWidth: 280, position: "relative" }}>
              <div style={{ position: "absolute", top: 24, [side === "left" ? "right" : "left"]: -38, width: 16, height: 16, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, border: "3px solid #0A0A0A", boxShadow: `0 0 15px ${COLORS.primary}66` }} />
              <div style={{ color: COLORS.primary, fontSize: 13, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>{year}</div>
              <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{title}</h3>
              <p style={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </GlassCard>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function Testimonials() {
  const [cur, setCur] = useState(0);
  const items = [
    { name: "Arjun Sharma", role: "Engineering Classmate", text: "Kriti helped me understand API architecture better than any textbook. His explanations are incredibly clear and practical." },
    { name: "Priya Mehta", role: "Project Collaborator", text: "Working with Kriti on the tournament system was effortless. He has a natural ability to translate complex requirements into clean code." },
    { name: "Dev Kumar", role: "Community Member", text: "The Telegram bot Kriti built for our group saves us hours every week. Reliable, fast, and exactly what we needed." },
  ];
  return (
    <Section id="testimonials">
      <SectionHeader eyebrow="Testimonials" title="What People Say" />
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <GlassCard style={{ padding: 48, marginBottom: 32 }}>
          <div style={{ fontSize: 40, color: COLORS.primary, marginBottom: 20, lineHeight: 1 }}>"</div>
          <p style={{ color: COLORS.textSecondary, fontSize: 17, lineHeight: 1.8, margin: "0 0 28px", fontStyle: "italic" }}>{items[cur].text}</p>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{items[cur].name}</div>
          <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>{items[cur].role}</div>
        </GlassCard>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? 28 : 10, height: 10, borderRadius: 100, border: "none", cursor: "pointer", transition: "all 0.3s", background: i === cur ? `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})` : COLORS.border }} />
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = () => { setSent(true); setTimeout(() => setSent(false), 3000); setForm({ name: "", email: "", subject: "", message: "" }); };
  const socials = [
    { label: "Instagram", icon: "📸", color: "#E1306C" url: "https://www.instagram.com/kritika15801"},
    { label: "Telegram", icon: "✈️", color: "#0088cc" url: "https://t.me/Kriti15801" },
  ];
  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "inherit" };
  return (
    <Section id="contact" style={{ background: COLORS.surface }}>
      <SectionHeader eyebrow="Contact" title="Let's Work Together" subtitle="Have a project in mind? I'd love to hear about it." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40 }}>
        <div>
          <GlassCard style={{ padding: 36 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[["name", "Your Name", "text"], ["email", "Your Email", "email"], ["subject", "Subject", "text"]].map(([k, ph, t]) => (
                <input key={k} type={t} placeholder={ph} value={form[k]} onChange={handle(k)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = COLORS.primary + "66"}
                  onBlur={e => e.target.style.borderColor = COLORS.border} />
              ))}
              <textarea placeholder="Your Message" value={form.message} onChange={handle("message")} rows={5}
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = COLORS.primary + "66"}
                onBlur={e => e.target.style.borderColor = COLORS.border} />
              <button onClick={submit} style={{
                padding: "14px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer",
                background: sent ? "#00C853" : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                border: "none", color: sent ? "#fff" : "#000", transition: "all 0.3s",
              }}>
                {sent ? "✓ Message Sent!" : "Send Message"}
              </button>
            </div>
          </GlassCard>
        </div>
        <div>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Get in touch</h3>
            <p style={{ color: COLORS.textSecondary, lineHeight: 1.8, marginBottom: 28 }}>
              Whether you have a project idea, want to collaborate, or just say hello — my inbox is always open.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${COLORS.primary}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📧</div>
              <span style={{ color: COLORS.textSecondary, fontSize: 14 }}>sanayakumari015@gmail.com</span>
            </div>
          </div>
          <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Find me on</h3>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {socials.map(({ label, icon, color }) => (
              <button key={label} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${COLORS.border}`, cursor: "pointer",
                color: COLORS.textSecondary, fontSize: 14, fontWeight: 600, transition: "all 0.25s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.color = color; e.currentTarget.style.background = color + "11"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const links = ["About", "Skills", "Projects", "Services", "Contact"];
  return (
    <footer style={{ background: "#080808", borderTop: `1px solid ${COLORS.border}`, padding: "60px 2rem 30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 14 }}>
              <GradientText>Elite</GradientText><span style={{ color: "#fff" }}>Headshoter</span>
            </div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.7, maxWidth: 240 }}>
              Engineering student turning ideas into elegant digital solutions.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>QUICK LINKS</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {links.map(l => (
                <button key={l} onClick={() => document.getElementById(l.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                  style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", fontSize: 14, textAlign: "left", padding: 0, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = COLORS.primary}
                  onMouseLeave={e => e.target.style.color = COLORS.textSecondary}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>CONTACT</h4>
            <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.7 }}>sanayakumari015@gmail.com</p>
            <p style={{ color: COLORS.textSecondary, fontSize: 14 }}>Available for freelance work</p>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ color: COLORS.textMuted, fontSize: 13 }}>© 2024 Kritika Agarwal · All rights reserved.</p>
          <button onClick={scrollTop} style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${COLORS.border}`, background: "rgba(255,255,255,0.04)", cursor: "pointer", color: COLORS.primary, fontSize: 18, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.primary + "55"; e.currentTarget.style.background = COLORS.primary + "15"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
            ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ done }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(id); return 100; } return p + 4; }), 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, background: COLORS.bg, zIndex: 99999,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: done ? 0 : 1, transition: "opacity 0.5s 0.3s", pointerEvents: done ? "none" : "all",
    }}>
      <div style={{ fontWeight: 900, fontSize: 36, marginBottom: 40 }}>
        <GradientText>Elite</GradientText><span style={{ color: "#fff" }}>Headshoter</span>
      </div>
      <div style={{ width: 200, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`, transition: "width 0.1s" }} />
      </div>
      <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 16 }}>{progress}%</div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────

export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 2800); }, []);
  return (
    <div style={{ background: COLORS.bg, color: "#fff", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh" }}>
      <LoadingScreen done={loaded} />
      <ScrollProgress />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Stats />
      <Achievements />
      <Services />
      <Timeline />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
