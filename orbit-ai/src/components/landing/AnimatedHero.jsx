import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const BG_IMAGES = [
  '/assets/hero-bg-1.jpg',
  '/assets/hero-bg-2.jpg',
  '/assets/hero-bg-3.jpg',
  '/assets/hero-bg-4.jpg'
]

const INTERVAL_MS = 5000   // 5s per image — cinematic pacing
const FADE_MS     = 2000   // 2s crossfade

export default function AnimatedHero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const intervalRef = useRef(null)

  // Preload every image before starting the carousel
  useEffect(() => {
    let loaded = 0
    BG_IMAGES.forEach((src) => {
      const img = new window.Image()
      img.src = src
      img.onload = img.onerror = () => {
        loaded++
        if (loaded === BG_IMAGES.length) setImagesLoaded(true)
      }
    })
  }, [])

  // Start cycling only after all images are ready
  useEffect(() => {
    if (!imagesLoaded) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % BG_IMAGES.length)
    }, INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [imagesLoaded])

  return (
    <section
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f'   /* near-black fallback while images load */
      }}
    >
      {/* ── Background images with Ken Burns zoom ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {BG_IMAGES.map((src, idx) => {
          const isActive = activeIndex === idx
          return (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
                transition: `opacity ${FADE_MS}ms ease-in-out, transform ${INTERVAL_MS + FADE_MS}ms ease-out`,
                willChange: 'opacity, transform'
              }}
            />
          )
        })}
      </div>

      {/* ── Multi-layer overlay system ── */}
      {/* 1. Base dark wash */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ backgroundColor: 'rgba(10, 10, 15, 0.55)' }}
      />
      {/* 2. Radial vignette — darkens edges, keeps centre slightly brighter */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,15,0.45) 70%, rgba(10,10,15,0.8) 100%)'
        }}
      />
      {/* 3. Bottom fade into the next section's background */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{
          height: '30%',
          background: 'linear-gradient(to top, var(--bg-primary, #ffffff) 0%, transparent 100%)'
        }}
      />

      {/* ── Accent glow blobs (on top of overlays, behind text) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <div
          className="absolute rounded-full blur-[140px]"
          style={{
            width: '60%', height: '60%',
            top: '-30%', right: '-5%',
            background: 'var(--gold)',
            opacity: 0.12
          }}
        />
        <div
          className="absolute rounded-full blur-[120px]"
          style={{
            width: '45%', height: '45%',
            bottom: '-15%', left: '-5%',
            background: 'var(--gold)',
            opacity: 0.08
          }}
        />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center" style={{ paddingTop: '140px', paddingBottom: '100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          <Sparkles size={16} color="var(--gold)" />
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>Welcome to the Future of Learning</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{
            color: '#ffffff',
            lineHeight: 1.08,
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800,
            marginBottom: '24px',
            textShadow: '0 2px 30px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.15)',
            letterSpacing: '-0.02em'
          }}
        >
          Rewire Your Brain.<br />
          <span style={{ color: 'var(--gold)' }}>Master Anything.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
            maxWidth: '700px',
            marginBottom: '48px',
            lineHeight: 1.7,
            textShadow: '0 1px 12px rgba(0,0,0,0.4)'
          }}
        >
          AETHER OS is the world's most advanced neuro-sync learning protocol. Stop scrolling. Start building your legacy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '56px' }}
        >
          <Link
            to="/onboarding"
            className="l-pill l-pill-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Initialize Protocol <ArrowRight size={20} />
          </Link>
          <a
            href="#features"
            className="l-pill l-pill-ghost"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderColor: 'rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.9)'
            }}
          >
            Explore Systems
          </a>
        </motion.div>

        {/* ── Carousel indicator dots ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}
        >
          {BG_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx)
                clearInterval(intervalRef.current)
                intervalRef.current = setInterval(() => {
                  setActiveIndex((prev) => (prev + 1) % BG_IMAGES.length)
                }, INTERVAL_MS)
              }}
              aria-label={`Show image ${idx + 1}`}
              style={{
                width: activeIndex === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                background: activeIndex === idx ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: activeIndex === idx ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
              }}
            />
          ))}
        </motion.div>

        {/* ── Scroll-down indicator ── */}
        <motion.a
          href="#features"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          style={{
            color: 'rgba(255,255,255,0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 500
          }}
        >
          Scroll
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.a>
      </div>
    </section>
  )
}
