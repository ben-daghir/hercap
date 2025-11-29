import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { usePortfolio, type Company } from "@/data/portfolio";
import { Badge } from "@/components/ui/Badge/Badge";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: "category" | "company";
  name: string;
  data?: Company;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: "primary" | "secondary" | "tertiary";
}

const LINK_DISTANCES = {
  primary: 80,
  secondary: 140,
  tertiary: 200,
};

export function SectorView() {
  const { portfolioData, loading, error } = usePortfolio();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Company | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

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

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || loading || portfolioData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Build nodes and links
    const categories = new Set<string>();
    portfolioData.forEach((c) => {
      categories.add(c.primary);
      if (c.secondary) categories.add(c.secondary);
      if (c.tertiary) categories.add(c.tertiary);
    });

    const nodes: GraphNode[] = [
      ...Array.from(categories).map((cat) => ({
        id: `cat-${cat}`,
        type: "category" as const,
        name: cat,
      })),
      ...portfolioData.map((c) => ({
        id: `company-${c.id}`,
        type: "company" as const,
        name: c.name,
        data: c,
      })),
    ];

    const links: GraphLink[] = [];
    portfolioData.forEach((c) => {
      links.push({
        source: `company-${c.id}`,
        target: `cat-${c.primary}`,
        strength: "primary",
      });
      if (c.secondary) {
        links.push({
          source: `company-${c.id}`,
          target: `cat-${c.secondary}`,
          strength: "secondary",
        });
      }
      if (c.tertiary) {
        links.push({
          source: `company-${c.id}`,
          target: `cat-${c.tertiary}`,
          strength: "tertiary",
        });
      }
    });

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => LINK_DISTANCES[d.strength])
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide<GraphNode>()
          .radius((d) => (d.type === "category" ? 50 : 28))
      )
      .alphaDecay(0.02);

    // Container group for zoom/pan
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    // Links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => {
        switch (d.strength) {
          case "primary":
            return "rgba(59, 130, 246, 0.6)";
          case "secondary":
            return "rgba(148, 163, 184, 0.4)";
          case "tertiary":
            return "rgba(71, 85, 105, 0.25)";
        }
      })
      .attr("stroke-width", (d) => (d.strength === "primary" ? 2 : 1));

    // Nodes group
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Category nodes (larger, labeled)
    node
      .filter((d) => d.type === "category")
      .append("circle")
      .attr("r", 40)
      .attr("fill", "rgba(30, 41, 59, 0.9)")
      .attr("stroke", "rgb(59, 130, 246)")
      .attr("stroke-width", 2);

    node
      .filter((d) => d.type === "category")
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .each(function () {
        // Wrap text if too long
        const text = d3.select(this);
        const words = text.text().split(/\s+/);
        if (words.length > 1 && text.text().length > 12) {
          text.text("");
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
        }
      });

    // Company nodes (smaller, initials)
    node
      .filter((d) => d.type === "company")
      .append("circle")
      .attr("r", 22)
      .attr("fill", "rgb(30, 41, 59)")
      .attr("stroke", "rgb(148, 163, 184)")
      .attr("stroke-width", 1.5)
      .on("mouseenter", function (_, d) {
        d3.select(this)
          .attr("stroke", "rgb(59, 130, 246)")
          .attr("stroke-width", 2);
        if (d.data) setHoveredNode(d.data);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .attr("stroke", "rgb(148, 163, 184)")
          .attr("stroke-width", 1.5);
        setHoveredNode(null);
      });

    node
      .filter((d) => d.type === "company")
      .append("text")
      .text((d) => d.name.substring(0, 2).toUpperCase())
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .style("pointer-events", "none");

    // Tick handler
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [portfolioData, loading, dimensions]);

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
