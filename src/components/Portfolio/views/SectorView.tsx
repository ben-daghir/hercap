import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { usePortfolio, type Company } from "@/data/portfolio";
import { Badge } from "@/components/ui/Badge/Badge";

// Weights for weighted superposition calculation
const WEIGHTS = {
  primary: 0.5,
  secondary: 0.4,
  tertiary: 0.1,
};

// Inner circle radius - companies within this will be scaled outward
const INNER_RADIUS = 0.4;

// Highlight colors for connection strengths
const HIGHLIGHT_COLORS = {
  primary: "#22c55e", // Green - strongest connection
  secondary: "#f59e0b", // Amber - medium connection
  tertiary: "#8b5cf6", // Purple - weakest connection
};

interface CategoryPosition {
  name: string;
  x: number; // Unit circle x (-1 to 1)
  y: number; // Unit circle y (-1 to 1)
}

interface CompanyNode {
  id: number;
  name: string;
  data: Company;
  x: number; // Calculated superposition x
  y: number; // Calculated superposition y
}

interface SelectedCategory {
  name: string;
  connections: Map<number, "primary" | "secondary" | "tertiary">;
}

export function SectorView() {
  const { portfolioData, loading, error } = usePortfolio();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Company | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);

  // Handle resize
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // D3 Visualization with weighted superposition
  useEffect(() => {
    if (!svgRef.current || loading || portfolioData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // 1. Collect all categories and calculate weighted scores
    const categoryScores: Map<string, number> = new Map();

    // Initialize scores for all categories
    portfolioData.forEach((c) => {
      if (!categoryScores.has(c.primary)) categoryScores.set(c.primary, 0);
      if (c.secondary && !categoryScores.has(c.secondary))
        categoryScores.set(c.secondary, 0);
      if (c.tertiary && !categoryScores.has(c.tertiary))
        categoryScores.set(c.tertiary, 0);
    });

    // Calculate weighted scores:
    // For each company with category as Primary: add PRIMARY_WEIGHT
    // For each company with category as Secondary: add SECONDARY_WEIGHT
    // For each company with category as Tertiary: add TERTIARY_WEIGHT
    portfolioData.forEach((c) => {
      categoryScores.set(
        c.primary,
        categoryScores.get(c.primary)! + WEIGHTS.primary
      );
      if (c.secondary) {
        categoryScores.set(
          c.secondary,
          categoryScores.get(c.secondary)! + WEIGHTS.secondary
        );
      }
      if (c.tertiary) {
        categoryScores.set(
          c.tertiary,
          categoryScores.get(c.tertiary)! + WEIGHTS.tertiary
        );
      }
    });

    // Sort categories by total score (highest first)
    const sortedCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1]) // Sort descending by score
      .map(([name]) => name);
    const categoryCount = sortedCategories.length;

    // 2. Create unit circle positions for categories (sorted by weighted score)
    // Using a PERFECT CIRCLE (same radius for x and y)
    const categoryPositions: Map<string, CategoryPosition> = new Map();
    sortedCategories.forEach((cat, i) => {
      // Start from top (-π/2) and go clockwise
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / categoryCount;
      categoryPositions.set(cat, {
        name: cat,
        x: Math.cos(angle), // Unit circle: -1 to 1
        y: Math.sin(angle), // Unit circle: -1 to 1
      });
    });

    // 3. Calculate weighted superposition for each company
    const companyNodes: CompanyNode[] = portfolioData.map((company) => {
      const primaryPos = categoryPositions.get(company.primary)!;
      const secondaryPos = company.secondary
        ? categoryPositions.get(company.secondary)
        : null;
      const tertiaryPos = company.tertiary
        ? categoryPositions.get(company.tertiary)
        : null;

      // Weighted superposition: sum of (weight * position) for each level
      let x = WEIGHTS.primary * primaryPos.x;
      let y = WEIGHTS.primary * primaryPos.y;

      if (secondaryPos) {
        x += WEIGHTS.secondary * secondaryPos.x;
        y += WEIGHTS.secondary * secondaryPos.y;
      }

      if (tertiaryPos) {
        x += WEIGHTS.tertiary * tertiaryPos.x;
        y += WEIGHTS.tertiary * tertiaryPos.y;
      }

      // Scale outward if within inner circle (minimum scaling along principal components)
      const distance = Math.sqrt(x * x + y * y);
      if (distance > 0 && distance < INNER_RADIUS) {
        const scaleFactor = INNER_RADIUS / distance;
        x *= scaleFactor;
        y *= scaleFactor;
      }

      return {
        id: company.id,
        name: company.name,
        data: company,
        x,
        y,
      };
    });

    // Scale factors to map unit coordinates to screen
    // Use a PERFECT CIRCLE - same radius for both x and y
    const centerX = width / 2;
    const centerY = height / 2;
    const minDimension = Math.min(width, height);
    const scale = Math.min(minDimension * 0.38, 260); // Same scale for x and y

    // Category circle radius (slightly larger than company spread) - PERFECT CIRCLE
    const categoryRadius = scale * 1.2;

    // Container group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    // Build connection map for a category
    const buildConnectionMap = (categoryName: string) => {
      const connections = new Map<
        number,
        "primary" | "secondary" | "tertiary"
      >();
      portfolioData.forEach((c) => {
        if (c.primary === categoryName) {
          connections.set(c.id, "primary");
        } else if (c.secondary === categoryName) {
          connections.set(c.id, "secondary");
        } else if (c.tertiary === categoryName) {
          connections.set(c.id, "tertiary");
        }
      });
      return connections;
    };

    // Helper to get screen coordinates (using same scale for perfect circle)
    const toScreen = (unitX: number, unitY: number, radius = scale) => ({
      x: centerX + unitX * radius,
      y: centerY + unitY * radius,
    });

    // Draw links from companies to their categories
    const linksGroup = g.append("g").attr("class", "links");

    companyNodes.forEach((company) => {
      const companyScreen = toScreen(company.x, company.y);

      const drawLink = (
        categoryName: string,
        strength: "primary" | "secondary" | "tertiary"
      ) => {
        const catPos = categoryPositions.get(categoryName)!;
        const catScreen = toScreen(catPos.x, catPos.y, categoryRadius);

        let strokeColor: string;
        let strokeWidth: number;
        let opacity: number;

        if (selectedCategory) {
          if (selectedCategory.name === categoryName) {
            strokeColor = HIGHLIGHT_COLORS[strength];
            strokeWidth = strength === "primary" ? 2.5 : 1.5;
            opacity = 0.8;
          } else {
            strokeColor = "rgba(51, 65, 85, 0.15)";
            strokeWidth = 0.5;
            opacity = 0.3;
          }
        } else {
          switch (strength) {
            case "primary":
              strokeColor = "rgba(59, 130, 246, 0.5)";
              strokeWidth = 1.5;
              opacity = 0.6;
              break;
            case "secondary":
              strokeColor = "rgba(148, 163, 184, 0.3)";
              strokeWidth = 1;
              opacity = 0.4;
              break;
            case "tertiary":
              strokeColor = "rgba(71, 85, 105, 0.2)";
              strokeWidth = 0.5;
              opacity = 0.3;
              break;
          }
        }

        linksGroup
          .append("line")
          .attr("x1", companyScreen.x)
          .attr("y1", companyScreen.y)
          .attr("x2", catScreen.x)
          .attr("y2", catScreen.y)
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth)
          .attr("opacity", opacity);
      };

      drawLink(company.data.primary, "primary");
      if (company.data.secondary) {
        drawLink(company.data.secondary, "secondary");
      }
      if (company.data.tertiary) {
        drawLink(company.data.tertiary, "tertiary");
      }
    });

    // Draw category nodes on the outer circle (PERFECT CIRCLE)
    const categoryGroup = g.append("g").attr("class", "categories");

    sortedCategories.forEach((cat) => {
      const pos = categoryPositions.get(cat)!;
      const screen = toScreen(pos.x, pos.y, categoryRadius);
      const isSelected = selectedCategory?.name === cat;

      const catNode = categoryGroup
        .append("g")
        .attr("transform", `translate(${screen.x}, ${screen.y})`)
        .style("cursor", "pointer")
        .on("click", (event) => {
          event.stopPropagation();
          if (selectedCategory?.name === cat) {
            setSelectedCategory(null);
          } else {
            setSelectedCategory({
              name: cat,
              connections: buildConnectionMap(cat),
            });
          }
        });

      catNode
        .append("circle")
        .attr("r", 40)
        .attr(
          "fill",
          isSelected ? "rgba(59, 130, 246, 0.3)" : "rgba(30, 41, 59, 0.95)"
        )
        .attr("stroke", isSelected ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)")
        .attr("stroke-width", isSelected ? 3 : 2);

      // Category label with text wrapping
      const text = catNode
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .style("pointer-events", "none");

      const words = cat.split(/\s+/);
      if (words.length > 1 && cat.length > 10) {
        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "-0.35em")
          .text(words.slice(0, Math.ceil(words.length / 2)).join(" "));
        text
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.1em")
          .text(words.slice(Math.ceil(words.length / 2)).join(" "));
      } else {
        text.text(cat);
      }
    });

    // Draw company nodes at their weighted superposition positions
    const companyGroup = g.append("g").attr("class", "companies");

    companyNodes.forEach((company) => {
      const screen = toScreen(company.x, company.y);

      const getColors = () => {
        if (!selectedCategory) {
          return {
            fill: "rgb(30, 41, 59)",
            stroke: "rgb(148, 163, 184)",
            strokeWidth: 1.5,
          };
        }
        const connectionType = selectedCategory.connections.get(company.id);
        if (connectionType) {
          return {
            fill:
              connectionType === "primary"
                ? "rgba(34, 197, 94, 0.25)"
                : connectionType === "secondary"
                ? "rgba(245, 158, 11, 0.25)"
                : "rgba(139, 92, 246, 0.25)",
            stroke: HIGHLIGHT_COLORS[connectionType],
            strokeWidth: 2.5,
          };
        }
        return {
          fill: "rgb(20, 28, 40)",
          stroke: "rgb(71, 85, 105)",
          strokeWidth: 1,
        };
      };

      const colors = getColors();

      const compNode = companyGroup
        .append("g")
        .attr("transform", `translate(${screen.x}, ${screen.y})`)
        .style("cursor", "pointer");

      compNode
        .append("circle")
        .attr("r", 20)
        .attr("fill", colors.fill)
        .attr("stroke", colors.stroke)
        .attr("stroke-width", colors.strokeWidth)
        .on("mouseenter", function () {
          const hoverStroke = selectedCategory?.connections.has(company.id)
            ? colors.stroke
            : "rgb(59, 130, 246)";
          d3.select(this).attr("stroke", hoverStroke).attr("stroke-width", 2.5);
          setHoveredNode(company.data);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .attr("stroke", colors.stroke)
            .attr("stroke-width", colors.strokeWidth);
          setHoveredNode(null);
        });

      compNode
        .append("text")
        .text(company.name.substring(0, 2).toUpperCase())
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", () => {
          if (!selectedCategory) return "white";
          return selectedCategory.connections.has(company.id)
            ? "white"
            : "rgb(100, 116, 139)";
        })
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .style("pointer-events", "none");
    });

    // Draw central HerCap node (portfolio owner) - disjoint from all connections
    const hercapGroup = g.append("g").attr("class", "hercap-center");
    const hercapNode = hercapGroup
      .append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    hercapNode
      .append("circle")
      .attr("r", 48)
      .attr("fill", "rgba(15, 23, 42, 0.98)")
      .attr("stroke", "rgb(234, 179, 8)")
      .attr("stroke-width", 3);

    hercapNode
      .append("text")
      .text("HerCap")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgb(250, 204, 21)")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.5px")
      .style("pointer-events", "none");

    // Click on background to deselect
    svg.on("click", () => {
      setSelectedCategory(null);
    });
  }, [portfolioData, loading, dimensions, selectedCategory]);

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
    <div className="portfolio__sector">
      <svg ref={svgRef} className="portfolio__sector-svg" />

      {/* Legend */}
      <div className="portfolio__sector-legend">
        <div className="portfolio__sector-legend-title">
          {selectedCategory
            ? `"${selectedCategory.name}" connections`
            : "Click a sector to highlight"}
        </div>
        <div className="portfolio__sector-legend-items">
          <div className="portfolio__sector-legend-item">
            <span
              className="portfolio__sector-legend-dot"
              style={{ backgroundColor: HIGHLIGHT_COLORS.primary }}
            />
            <span>Primary</span>
          </div>
          <div className="portfolio__sector-legend-item">
            <span
              className="portfolio__sector-legend-dot"
              style={{ backgroundColor: HIGHLIGHT_COLORS.secondary }}
            />
            <span>Secondary</span>
          </div>
          <div className="portfolio__sector-legend-item">
            <span
              className="portfolio__sector-legend-dot"
              style={{ backgroundColor: HIGHLIGHT_COLORS.tertiary }}
            />
            <span>Tertiary</span>
          </div>
        </div>
        {selectedCategory && (
          <button
            className="portfolio__sector-legend-clear"
            onClick={() => setSelectedCategory(null)}
          >
            Clear selection
          </button>
        )}
      </div>

      {hoveredNode && (
        <div className="portfolio__sector-tooltip">
          <h3 className="portfolio__sector-tooltip-name">{hoveredNode.name}</h3>
          <p className="portfolio__sector-tooltip-desc">
            {hoveredNode.description}
          </p>
          <div className="portfolio__list-badges">
            <Badge variant="secondary">{hoveredNode.primary}</Badge>
            {hoveredNode.secondary && (
              <Badge variant="secondary">{hoveredNode.secondary}</Badge>
            )}
            {hoveredNode.tertiary && (
              <Badge variant="secondary">{hoveredNode.tertiary}</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
