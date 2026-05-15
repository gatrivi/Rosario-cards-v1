import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const GRAVITY_STRENGTH = 0.01;
export const TENSION_STRENGTH = 0.8;
export const REPULSION_STRENGTH = -5;

const playTick = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

export const useD3Rosary = (containerRef, graph, onNodeClick, onLinkClick) => {
  const onNodeClickRef = useRef(onNodeClick);
  const onLinkClickRef = useRef(onLinkClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
    onLinkClickRef.current = onLinkClick;
  }, [onNodeClick, onLinkClick]);

  useEffect(() => {
    if (!containerRef.current || !graph) return;
    const { nodes, links } = graph;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const simulation = d3
      .forceSimulation(nodes)
      .velocityDecay(0.2)
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => d.distance).strength(TENSION_STRENGTH))
      .force("collide", d3.forceCollide().radius((d) => d.radius + 2).iterations(4))
      .force("charge", d3.forceManyBody().strength(REPULSION_STRENGTH))
      .force("x", d3.forceX(width / 2).strength(GRAVITY_STRENGTH))
      .force("y", d3.forceY((d) => {
        if (d.type === "cross" || d.id.startsWith("tail") || d.type === "centerpiece") {
          return height * 0.8;
        }
        return height * 0.35;
      }).strength(0.015));

    d3.select(containerRef.current).selectAll("*").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("pointer-events", "auto")
      .style("opacity", "0.85")
      .style("transition", "opacity 0.2s ease");

    const rootGroup = svg.append("g");
    
    // Chains
    const linkGroup = rootGroup.append("g").attr("class", "links");
    const linkWrappers = linkGroup.selectAll("g")
      .data(links).enter().append("g")
      .style("cursor", "pointer").style("pointer-events", "all")
      .on("click", (event, d) => {
        playTick();
        if (onLinkClickRef.current) onLinkClickRef.current(d);
      });

    const lines = linkWrappers.append("line")
      .attr("stroke", "coral")
      .attr("stroke-width", (d) => (d.type === "long" ? 6 : 3));

    const linkLabels = linkWrappers.append("text")
      .text((d) => d.type === "long" ? "L-Chain" : "")
      .attr("fill", "white").attr("font-size", "10px")
      .attr("text-anchor", "middle").attr("dy", -5);

    // Nodes
    const nodeGroup = rootGroup.append("g").attr("class", "nodes");
    const nodeWrappers = nodeGroup.selectAll("g")
      .data(nodes).enter().append("g")
      .style("cursor", "grab").style("pointer-events", "all")
      .on("click", (event, d) => {
        playTick();
        if (onNodeClickRef.current) onNodeClickRef.current(d);
      });

    nodeWrappers.each(function(d) {
      const el = d3.select(this);
      if (d.type === "cross") {
        el.append("path")
          .attr("d", "M -8 -25 L 8 -25 L 8 -5 L 25 -5 L 25 5 L 8 5 L 8 35 L -8 35 L -8 5 L -25 5 L -25 -5 L -8 -5 Z")
          .attr("fill", "chocolate").attr("stroke", "rgba(0,0,0,0.5)").attr("stroke-width", 2);
      } else {
        el.append("circle")
          .attr("r", (d) => d.radius)
          .attr("fill", "chocolate")
          .attr("stroke", "rgba(0,0,0,0.5)").attr("stroke-width", 2);
      }
    });

    nodeWrappers.append("text")
      .text((d) => d.id)
      .attr("fill", "white").attr("font-size", "8px")
      .attr("text-anchor", "middle").attr("dy", 3).style("pointer-events", "none");

    const dragStarted = (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      svg.style("opacity", "0.35");
      d.offsetX = d.x - event.x;
      d.offsetY = d.y - event.y;
      d.fx = d.x; d.fy = d.y;
      d3.select(event.sourceEvent.target.parentNode).style("cursor", "grabbing");
    };

    const dragged = (event, d) => {
      d.fx = event.x + d.offsetX;
      d.fy = event.y + d.offsetY;
    };

    const dragEnded = (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      svg.style("opacity", "0.85");
      d.fx = null; d.fy = null;
      d3.select(event.sourceEvent.target.parentNode).style("cursor", "grab");
    };

    nodeWrappers.call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));

    simulation.on("tick", () => {
      nodes.forEach((d) => {
        d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
        d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
      });

      lines.each(function(d) {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;
        
        const cos = dx / dist;
        const sin = dy / dist;
        
        d3.select(this)
          .attr("x1", d.source.x + cos * d.source.radius)
          .attr("y1", d.source.y + sin * d.source.radius)
          .attr("x2", d.target.x - cos * d.target.radius)
          .attr("y2", d.target.y - sin * d.target.radius);
      });

      linkLabels.attr("x", (d) => (d.source.x + d.target.x) / 2).attr("y", (d) => (d.source.y + d.target.y) / 2);
      nodeWrappers.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    return () => simulation.stop();
  }, [containerRef, graph]);
};
