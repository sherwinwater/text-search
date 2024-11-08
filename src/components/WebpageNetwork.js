import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

const WebpageNetwork = ({ data }) => {
  const networkContainer = useRef(null);
  const networkInstance = useRef(null);
  const [isStabilized, setIsStabilized] = useState(false);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);
  const [physicsOptions, setPhysicsOptions] = useState({
    gravitationalConstant: -2000,
    centralGravity: 0.3,
    springLength: 200,
    springConstant: 0.04,
    damping: 0.09,
  });

  // Function to update physics settings
  const updatePhysics = (newOptions) => {
    if (networkInstance.current) {
      networkInstance.current.setOptions({
        physics: {
          barnesHut: {
            ...physicsOptions,
            ...newOptions,
          },
        },
      });
      setPhysicsOptions((prev) => ({ ...prev, ...newOptions }));
    }
  };

  // Function to apply preset configurations
  const applyPreset = (preset) => {
    switch (preset) {
      case "spread":
        updatePhysics({
          gravitationalConstant: -3000,
          centralGravity: 0.1,
          springLength: 300,
          springConstant: 0.02,
        });
        break;
      case "compact":
        updatePhysics({
          gravitationalConstant: -1000,
          centralGravity: 0.8,
          springLength: 100,
          springConstant: 0.08,
        });
        break;
      case "default":
        updatePhysics({
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
        });
        break;
      default:
        updatePhysics({
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 200,
          springConstant: 0.04,
        });
        break;
    }
};

  useEffect(() => {
    if (!data?.nodes || !data?.links || !networkContainer.current) return;

    try {
      // Clean up existing network
      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      // Deduplicate nodes using a Map
      const uniqueNodesMap = new Map();
      data.nodes.forEach((node) => {
        if (!uniqueNodesMap.has(node.id)) {
          uniqueNodesMap.set(node.id, {
            id: node.id,
            label: node.label,
            title: `<div>
              <strong>${node.title}</strong><br/>
              <a href="${node.url}" target="_blank">${node.url}</a>
            </div>`,
            url: node.url,
          });
        }
      });

      // Deduplicate edges using a Set
      const seenEdges = new Set();
      const uniqueEdges = data.links
        .filter((link) => {
          const edgeKey = `${link.source}-${link.target}`;
          if (seenEdges.has(edgeKey)) {
            return false;
          }
          seenEdges.add(edgeKey);
          return true;
        })
        .map((link) => ({
          from: link.source,
          to: link.target,
          arrows: "to",
        }));

      // Create DataSets with deduplicated data
      const nodes = new DataSet(Array.from(uniqueNodesMap.values()));
      const edges = new DataSet(uniqueEdges);

      // Improved network configuration
      const options = {
        nodes: {
          shape: "dot",
          size: 8,
          font: {
            size: 9,
            face: "Arial",
            color: "#333333",
          },
          borderWidth: 1,
          shadow: false,
          color: {
            border: "#2B7CE9",
            background: "#97C2FC",
            highlight: {
              border: "#2B7CE9",
              background: "#D2E5FF",
            },
          },
        },
        edges: {
          width: 1,
          color: {
            color: "#848484",
            opacity: 0.3,
            highlight: "#848484",
          },
          smooth: {
            type: "continuous",
            roundness: 0.5,
          },
          length: 200,
        },
        physics: {
          enabled: true,
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
            onlyDynamicEdges: false,
            fit: true,
          },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.1,
          },
          minVelocity: 0.75,
          maxVelocity: 30,
        },
        interaction: {
          hover: true,
          tooltipDelay: 300,
          hideEdgesOnDrag: true,
          hideEdgesOnZoom: true,
          zoomView: true,
          dragView: true,
          multiselect: true,
        },
        layout: {
          improvedLayout: true,
          hierarchical: false,
        },
      };

      // Create network
      networkInstance.current = new Network(
        networkContainer.current,
        { nodes, edges },
        options
      );

      // Event handlers
      networkInstance.current.on("stabilizationProgress", function (params) {
        const progress = Math.round((params.iterations / params.total) * 100);
        setStabilizationProgress(progress);
      });

      networkInstance.current.on("stabilizationIterationsDone", function () {
        setIsStabilized(true);
        setStabilizationProgress(100);
        // Disable physics after stabilization
        networkInstance.current.setOptions({ physics: { enabled: false } });
      });

      networkInstance.current.on("click", function (params) {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          if (node) {
            console.log("Clicked node:", node);
          }
        }
      });

      // Add methods to the network instance
      networkInstance.current.stabilize = () => {
        setIsStabilized(false);
        networkInstance.current.setOptions({ physics: { enabled: true } });
      };

      networkInstance.current.stopPhysics = () => {
        networkInstance.current.setOptions({ physics: { enabled: false } });
      };
    } catch (error) {
      console.error("Error creating network:", error);
      console.error("Data received:", data);
    }

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [data]);

  const controls = (
    <div className="absolute top-4 left-4 right-4 z-10 bg-white p-3 rounded-lg shadow-lg">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Left section - Basic Controls */}
        <div className="flex gap-2">
          <button
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={() => networkInstance.current?.fit()}
          >
            Fit
          </button>
          <button
            className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            onClick={() => {
              setIsStabilized(false);
              networkInstance.current?.stabilize();
            }}
            disabled={!isStabilized}
          >
            Stabilize
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            onClick={() =>
              networkInstance.current?.setOptions({
                physics: { enabled: false },
              })
            }
          >
            Stop
          </button>

          <button
            className="px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            onClick={() => applyPreset("spread")}
          >
            Spread
          </button>
          <button
            className="px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            onClick={() => applyPreset("compact")}
          >
            Compact
          </button>
          <button
            className="px-2 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
            onClick={() => applyPreset("default")}
          >
            Default
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <div className="relative">
      {controls}
      <div
        ref={networkContainer}
        className="w-full border border-gray-200 rounded-lg bg-white"
        style={{ height: "700px" }}
      />
      {!isStabilized && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${stabilizationProgress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 mt-1">
            Stabilizing: {stabilizationProgress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default WebpageNetwork;
