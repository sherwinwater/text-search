import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import {
    Box,
    Button,
    Paper,
    Typography,
    Link,
    LinearProgress,
    Stack,
    Container
} from '@mui/material';

const WebpageNetwork = ({ data }) => {
    const networkContainer = useRef(null);
    const networkInstance = useRef(null);
    const [isStabilized, setIsStabilized] = useState(false);
    const [stabilizationProgress, setStabilizationProgress] = useState(0);
    const [selectedNode, setSelectedNode] = useState(null);
    const [networkStats, setNetworkStats] = useState({
        nodeCount: 0,
        edgeCount: 0,
        avgConnections: 0,
    });
    const [physicsOptions, setPhysicsOptions] = useState({
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 200,
        springConstant: 0.04,
        damping: 0.09,
    });

    // Memoized physics presets
    const presets = useMemo(() => ({
        spread: {
            gravitationalConstant: -3000,
            centralGravity: 0.1,
            springLength: 300,
            springConstant: 0.02,
        },
        compact: {
            gravitationalConstant: -1000,
            centralGravity: 0.8,
            springLength: 100,
            springConstant: 0.08,
        },
        default: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 200,
            springConstant: 0.04,
        }
    }), []);

    // Memoized network options with optimized physics settings
    const networkOptions = useMemo(() => ({
        nodes: {
            shape: "dot",
            font: {
                size: 10,
                face: "Arial",
                color: "#333333",
            },
            borderWidth: 1,
            shadow: true,
            scaling: {
                label: {
                    enabled: true,
                    min: 8,
                    max: 20
                }
            }
        },
        edges: {
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
            },
            barnesHut: {
                ...physicsOptions,
                theta: 0.5, // Optimize performance with slight accuracy trade-off
                gravitationalConstant: physicsOptions.gravitationalConstant,
                centralGravity: physicsOptions.centralGravity,
                springLength: physicsOptions.springLength,
                springConstant: physicsOptions.springConstant,
                damping: physicsOptions.damping,
            },
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            hideEdgesOnDrag: true,
            hideEdgesOnZoom: true,
            zoomView: true,
            dragView: true,
            multiselect: true,
            hoverConnectedEdges: true,
        }
    }), [physicsOptions]);

    // Memoized node color calculation
    const calculateNodeColors = useCallback((nodes, edges) => {
        return nodes.map(node => {
            const normalizedRank = node.final_rank || 0;
            const baseSize = 4;
            const sizeMultiplier = Math.log(
                (node.metadata?.content_length || 0) / 1000 +
                (node.metadata?.outbound_links || 0) + 1
            );
            const nodeSize = baseSize * (0.1 + sizeMultiplier);
            const blueComponent = Math.min(255, Math.round(200 * (1 - normalizedRank)));
            const nodeColor = `rgb(${blueComponent}, ${blueComponent}, 255)`;

            return {
                ...node,
                size: nodeSize,
                color: {
                    background: nodeColor,
                    border: '#2B7CE9',
                    highlight: {
                        background: '#FFA500',
                        border: '#FF8C00'
                    }
                }
            };
        });
    }, []);

    // Memoized edge processing
    const processEdges = useCallback((links) => {
        const seenEdges = new Set();
        return links
            .filter((link) => {
                const edgeKey = `${link.source}-${link.target}`;
                if (seenEdges.has(edgeKey)) return false;
                seenEdges.add(edgeKey);
                return true;
            })
            .map((link) => ({
                from: link.source,
                to: link.target,
                arrows: "to",
                width: Math.max(0.5, link.weight * 1.5),
                color: {
                    color: '#848484',
                    opacity: 0.3 + (link.weight * 0.3),
                    highlight: '#FFA500'
                }
            }));
    }, []);

    // Optimized update physics function
    const updatePhysics = useCallback((newOptions) => {
        if (networkInstance.current) {
            networkInstance.current.setOptions({
                physics: {
                    barnesHut: {
                        ...physicsOptions,
                        ...newOptions,
                    },
                },
            });
            setPhysicsOptions(prev => ({ ...prev, ...newOptions }));
        }
    }, [physicsOptions]);

    // Optimized preset application
    const applyPreset = useCallback((preset) => {
        updatePhysics(presets[preset] || presets.default);
    }, [presets, updatePhysics]);

    useEffect(() => {
        if (!data?.nodes || !data?.links || !networkContainer.current) return;

        const cleanup = () => {
            if (networkInstance.current) {
                networkInstance.current.destroy();
                networkInstance.current = null;
            }
        };

        try {
            cleanup();

            const uniqueNodesMap = new Map(
                data.nodes.map(node => [node.id, node])
            );

            const nodesWithColors = calculateNodeColors(
                Array.from(uniqueNodesMap.values()),
                data.links
            );
            const uniqueEdges = processEdges(data.links);

            setNetworkStats({
                nodeCount: nodesWithColors.length,
                edgeCount: uniqueEdges.length,
                avgConnections: (uniqueEdges.length / nodesWithColors.length).toFixed(2)
            });

            const nodes = new DataSet(nodesWithColors);
            const edges = new DataSet(uniqueEdges);

            networkInstance.current = new Network(
                networkContainer.current,
                { nodes, edges },
                networkOptions
            );

            // Add event listeners with passive option
            const addPassiveEventListener = (element, eventName) => {
                element.addEventListener(eventName, (e) => {
                    // Optional: Add any specific handling if needed
                }, { passive: true });
            };

            // Add passive event listeners for touch and wheel events
            const eventNames = ['wheel', 'touchstart', 'touchmove', 'touchend'];
            eventNames.forEach(eventName => {
                addPassiveEventListener(networkContainer.current, eventName);
            });

            // Optimized event handlers with debouncing
            let stabilizationTimeout;
            const handleStabilizationProgress = (params) => {
                cancelAnimationFrame(stabilizationTimeout);
                stabilizationTimeout = requestAnimationFrame(() => {
                    const progress = Math.round((params.iterations / params.total) * 100);
                    setStabilizationProgress(progress);
                });
            };

            let stabilizationDoneTimeout;
            const handleStabilizationDone = () => {
                cancelAnimationFrame(stabilizationDoneTimeout);
                stabilizationDoneTimeout = requestAnimationFrame(() => {
                    setIsStabilized(true);
                    setStabilizationProgress(100);
                    networkInstance.current?.setOptions({ physics: { enabled: false }});
                });
            };

            let nodeClickTimeout;
            const handleNodeClick = (params) => {
                cancelAnimationFrame(nodeClickTimeout);
                nodeClickTimeout = requestAnimationFrame(() => {
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        const node = nodes.get(nodeId);
                        setSelectedNode(node);
                    } else {
                        setSelectedNode(null);
                    }
                });
            };

            networkInstance.current.on("stabilizationProgress", handleStabilizationProgress);
            networkInstance.current.on("stabilizationIterationsDone", handleStabilizationDone);
            networkInstance.current.on("click", handleNodeClick);

            return () => {
                cancelAnimationFrame(stabilizationTimeout);
                cancelAnimationFrame(stabilizationDoneTimeout);
                cancelAnimationFrame(nodeClickTimeout);
                cleanup();
            };
        } catch (error) {
            console.error("Error creating network:", error);
            cleanup();
        }
    }, [data, networkOptions, calculateNodeColors, processEdges]);

    return (
        <Container maxWidth={false} sx={{ position: 'relative', height: '85vh', pt: 2, pb: 2, pl: 0, pr: 0 }} disableGutters>
            {/* Rest of the JSX remains the same */}
            {/* Control Panel */}
            <Paper elevation={3} sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100,
                p: 2,
                backgroundColor: 'background.paper'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => networkInstance.current?.fit()}
                            disabled={!isStabilized}
                        >
                            Fit View
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                setIsStabilized(false);
                                networkInstance.current?.stabilize();
                            }}
                            disabled={!isStabilized}
                        >
                            Stabilize
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => applyPreset("spread")}
                        >
                            Spread
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => applyPreset("compact")}
                        >
                            Compact
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => applyPreset("default")}
                        >
                            Default
                        </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Nodes: {networkStats.nodeCount},{' '}
                        Edges: {networkStats.edgeCount},{' '}
                        Avg. Connections: {networkStats.avgConnections}
                    </Typography>
                </Stack>
            </Paper>

            {/* Network Container */}
            <Box
                ref={networkContainer}
                sx={{
                    width: '100vw',
                    height: '80vh',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.paper',
                    overflow: 'hidden',
                    padding: 0,
                    margin: 0
                }}
            />

            {/* Progress Bar */}
            {!isStabilized && (
                <Paper elevation={3} sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    p: 2,
                    zIndex: 1100
                }}>
                    <LinearProgress variant="determinate" value={stabilizationProgress} sx={{mb: 1}} />
                    <Typography variant="body2" color="text.secondary" align="center">
                        Stabilizing: {stabilizationProgress}%
                    </Typography>
                </Paper>
            )}

            {/* Node Info Panel */}
            {selectedNode && (
                <Paper elevation={3} sx={{
                    position: 'absolute',
                    bottom: 50,
                    left: 10,
                    zIndex: 1100,
                    p: 2,
                    maxWidth: 600,
                    textAlign: 'left'
                }}>
                    <Typography variant="body2" gutterBottom>
                        Title: {selectedNode.title}
                    </Typography>
                    <Stack spacing={1}>
                        <Typography variant="body2">
                            Page Rank: {selectedNode.final_rank?.toFixed(4) || 0}
                        </Typography>
                        <Typography variant="body2">
                            Outbound Links: {selectedNode.metadata?.outbound_links || 0}
                        </Typography>
                        <Typography variant="body2">
                            Content Length: {selectedNode.metadata?.content_length?.toLocaleString() || 0} bytes
                        </Typography>
                    </Stack>
                    <Link
                        href={selectedNode.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{display: 'block', mb: 0, fontSize: "10px"}}
                    >
                        {selectedNode.url}
                    </Link>
                </Paper>
            )}
        </Container>
    );
};

export default WebpageNetwork;