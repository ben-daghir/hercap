import { motion } from "framer-motion";
import { usePortfolio } from "@/data/portfolio";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";

interface StageViewProps {
  stageFilter: string;
  setStageFilter: (filter: string) => void;
}

export function StageView({ stageFilter, setStageFilter }: StageViewProps) {
  const { portfolioData, loading, error } = usePortfolio();
  const stages = ["all", "Angel", "Early", "Growth", "Public"];
  const filteredData =
    stageFilter === "all"
      ? portfolioData
      : portfolioData.filter((c) => c.stage === stageFilter);

  if (loading) {
    return (
      <div className="portfolio__loading">
        <div className="portfolio__loading-spinner" />
        Loading portfolio...
      </div>
    );
  }

  if (error) {
    return <div className="portfolio__error">{error}</div>;
  }

  return (
    <div>
      <div className="portfolio__filters">
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setStageFilter(stage)}
            className={`portfolio__filter ${
              stageFilter === stage ? "portfolio__filter--active" : ""
            }`}
          >
            {stage}{" "}
            {stage !== "all" &&
              `(${portfolioData.filter((c) => c.stage === stage).length})`}
          </button>
        ))}
      </div>
      <div className="portfolio__list">
        {filteredData.map((company, idx) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className="portfolio__list-card">
              <div className="portfolio__list-item">
                <div className="portfolio__list-avatar">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="portfolio__list-info">
                  <h3 className="portfolio__list-name">{company.name}</h3>
                  <p className="portfolio__list-desc">{company.description}</p>
                  <div className="portfolio__list-badges">
                    <Badge variant="secondary">{company.primary}</Badge>
                    {company.secondary && (
                      <Badge variant="secondary">{company.secondary}</Badge>
                    )}
                    {company.tertiary && (
                      <Badge variant="secondary">{company.tertiary}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
