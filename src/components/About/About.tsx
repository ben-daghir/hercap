import { motion } from 'framer-motion'
import './About.css'

export function About() {
  return (
    <section id="about" className="about">
      <div className="about__container">
        <div className="about__grid">
          <div className="about__header">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="about__title"
            >
              About Us
            </motion.h2>
          </div>
          <div className="about__content">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Herald Capital is a venture investment manager with a portfolio of 100+ companies spanning from pre-seed to publicly traded.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              We are designed to support startups from first fundraise to exit, with expertise in target audience identification, product commercialization, and enterprise partnership strategy.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our portfolio is global, with a focus on CPG, health, martech, sports, and climatetech.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Herald Capital's management team has decades of experience across M&A advisory, innovation strategy, and international marketing. We are committed to leveraging this expertise in active support of the founders that we invest in.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}

