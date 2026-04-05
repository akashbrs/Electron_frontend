import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides } from "../../data/heroSlides";
import "./HeroCarousel.css";

const SLIDE_DURATION = 8000;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
    setProgressKey((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
    setProgressKey((prev) => prev + 1);
  };

  const slide = heroSlides[current];

  return (
    <section className="hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="hero-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Background Video */}
          <video
            className="hero-video"
            src={slide.video}
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Gradient Overlay */}
          <div className="overlay" />

          {/* Content */}
          <div className="hero-content">
            <motion.span
              className="category"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {slide.category}
            </motion.span>

            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {slide.tagline}
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <button className="btn-primary">Buy Now</button>
              <button className="btn-secondary">Learn More</button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button className="arrow left" onClick={prevSlide}>
        ‹
      </button>
      <button className="arrow right" onClick={nextSlide}>
        ›
      </button>

      {/* Progress Bar */}
      <motion.div
        key={progressKey}
        className="progress-bar"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
      />
    </section>
  );
}