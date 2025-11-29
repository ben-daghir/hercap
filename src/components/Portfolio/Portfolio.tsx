import { useState } from "react";
import { motion } from "framer-motion";
import { type Company } from "@/data/portfolio";
import { NameView, StageView, GeographyView, SectorView } from "./views";
import "./Portfolio.css";

type ViewType = "name" | "stage" | "geography" | "sector";

export function Portfolio() {
  const [view, setView] = useState<ViewType>("name");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedStartup, setSelectedStartup] = useState<Company | null>(null);

  return (
    <section id="portfolio" className="portfolio">
      <div className="portfolio__bg">
        <div className="portfolio__blob portfolio__blob--1" />
        <div className="portfolio__blob portfolio__blob--2" />
      </div>
      <div className="portfolio__container">
        <div className="portfolio__header">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="portfolio__title"
          >
            Portfolio
          </motion.h2>
          <div className="portfolio__tabs">
            {(["name", "stage", "geography", "sector"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`portfolio__tab ${
                  view === v ? "portfolio__tab--active" : ""
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {view === "name" && <NameView />}
        {view === "stage" && (
          <StageView
            stageFilter={stageFilter}
            setStageFilter={setStageFilter}
          />
        )}
        {view === "geography" && (
          <GeographyView
            selectedStartup={selectedStartup}
            setSelectedStartup={setSelectedStartup}
          />
        )}
        {view === "sector" && <SectorView />}
      </div>
    </section>
  );
}
