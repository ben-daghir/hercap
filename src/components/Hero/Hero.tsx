import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import './Hero.css'

export function Hero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
  const scrollProgress = Math.min(scrollY / heroHeight, 1)
  const rocketProgress = Math.min(scrollProgress / 0.5, 1)
  const rocketVisible = scrollProgress > 0 && scrollProgress < 0.55
  const rocketX = -10 + rocketProgress * 120
  const rocketY = 110 - rocketProgress * 120

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" className="hero">
      {/* Gradient blob */}
      <div className="hero__blob-container" aria-hidden>
        <motion.div
          initial={{ opacity: 0.3, scale: 1 }}
          animate={{ opacity: 0.5, scale: 1.08 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="hero__blob"
        />
      </div>

      {/* Stars */}
      <div className="hero__stars">
        {Array.from({ length: 80 }).map((_, i) => {
          const size = Math.random() * 2 + 1
          const left = Math.random() * 100
          const top = Math.random() * 100
          const delay = Math.random() * 2
          const brightness = 0.4 + Math.random() * 0.6
          const parallaxY = scrollProgress * brightness * 0.05 * 30

          return (
            <motion.div
              key={i}
              className="hero__star"
              style={{ left: `${left}%`, top: `${top}%`, transform: `translateY(${parallaxY}px)` }}
              animate={{ opacity: [brightness * 0.4, brightness, brightness * 0.4], scale: [1, 1.3, 1] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay, ease: 'easeInOut' }}
            >
              <div className="hero__star-shape" style={{ width: `${size * 2}px`, height: `${size * 2}px` }} />
            </motion.div>
          )
        })}
      </div>

      {/* Rocket */}
      {rocketVisible && (
        <div
          className="hero__rocket"
          style={{ left: `${rocketX}%`, top: `${rocketY}%`, transform: 'rotate(45deg)' }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            {/* Flames */}
            <g style={{ opacity: 0.7 }}>
              <path d="M20 48 L16 54 L18 52 L14 58" stroke="rgb(239, 68, 68)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
              <path d="M26 42 L22 50 L24 48 L20 54" stroke="rgb(248, 113, 113)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
              <path d="M32 36 L28 46 L30 44 L26 52" stroke="rgb(252, 165, 165)" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
            </g>
            {/* Body */}
            <path d="M32 4 L42 20 L42 32 L38 32 L38 22 L32 14 L26 22 L26 32 L22 32 L22 20 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="24" y="28" width="16" height="14" fill="white" stroke="white" strokeWidth="1.5" />
            <circle cx="32" cy="24" r="4" fill="none" stroke="rgb(220, 38, 38)" strokeWidth="2" />
            <circle cx="32" cy="24" r="2.5" fill="rgb(239, 68, 68)" fillOpacity="0.3" />
            <line x1="28" y1="32" x2="28" y2="40" stroke="rgb(148, 163, 184)" strokeWidth="1" />
            <line x1="36" y1="32" x2="36" y2="40" stroke="rgb(148, 163, 184)" strokeWidth="1" />
            <line x1="24" y1="35" x2="40" y2="35" stroke="rgb(220, 38, 38)" strokeWidth="2" />
            {/* Fins */}
            <path d="M22 38 L16 46 L18 44 L22 42 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M42 38 L48 46 L46 44 L42 42 Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="26" y="42" width="4" height="4" fill="rgb(148, 163, 184)" stroke="white" strokeWidth="1" />
            <rect x="34" y="42" width="4" height="4" fill="rgb(148, 163, 184)" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="hero__content">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hero__title"
        >
          SOUNDING THE CALL FOR BOLD FOUNDERS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="hero__subtitle"
        >
          Early-stage venture support from first raise to exit.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="hero__actions"
        >
          <button className="hero__cta" onClick={scrollToContact}>
            Pitch Us <ArrowRight size={16} />
          </button>
          <a href="#about" className="hero__link">Learn more</a>
        </motion.div>
      </div>
    </section>
  )
}

