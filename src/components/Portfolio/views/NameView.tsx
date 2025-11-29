import { useState } from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/data/portfolio";
import { Card, CardContent } from "@/components/ui/Card/Card";

export function NameView() {
  const { portfolioData, loading, error } = usePortfolio();
  const [visibleCount, setVisibleCount] = useState(20);
  const sortedData = [...portfolioData].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const visibleData = sortedData.slice(0, visibleCount);
  const hasMore = visibleCount < sortedData.length;

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
      <div className="portfolio__grid">
        {visibleData.map((company, idx) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (idx % 20) * 0.03 }}
          >
            <Card className="portfolio__card">
              <CardContent className="portfolio__card-content">
                <div className="portfolio__card-avatar">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio__card-name"
                  >
                    {company.name}
                  </a>
                ) : (
                  <div className="portfolio__card-name">{company.name}</div>
                )}
                <div className="portfolio__card-sector">{company.primary}</div>
                <p className="portfolio__card-desc">{company.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <div className="portfolio__load-more">
          <button
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + 20, sortedData.length))
            }
            className="portfolio__load-btn"
          >
            Load More ({sortedData.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
