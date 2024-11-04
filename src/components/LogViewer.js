import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Paper, Box, Typography, LinearProgress } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { config } from '../config/config';

const LogViewer = ({ taskId }) => {
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [queuedLogs, setQueuedLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (queuedLogs.length > 0) {
      const timer = setTimeout(() => {
        const nextLog = queuedLogs[0];
        setDisplayedLogs(prev => [...prev, nextLog]);
        setQueuedLogs(prev => prev.slice(1));
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [queuedLogs, displayedLogs]);

  useEffect(() => {
    const socket = io(config.SEARCH_ENGINE_API_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true,
      secure: false,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      withCredentials: false
    });

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join", taskId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("log_message", (logEntry) => {
      setQueuedLogs(prev => [...prev, logEntry]);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [taskId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedLogs]);

  const getLogLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "error":
        return "#ef4444";
      case "warning":
        return "#eab308";
      case "info":
        return "#3b82f6";
      case "debug":
        return "#6b7280";
      default:
        return "#374151";
    }
  };

  const progress = queuedLogs.length > 0 ? 
    (displayedLogs.length / (displayedLogs.length + queuedLogs.length)) * 100 : 
    100;

  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",
        maxWidth: "100rem",
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1
          }}
        >
          <Typography variant="h6" component="h2">
            Live Logs
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Logs: {displayedLogs.length} {queuedLogs.length > 0 && `(${queuedLogs.length} pending)`}
            </Typography>
            <FiberManualRecordIcon
              sx={{
                fontSize: 12,
                color: isConnected ? "#22c55e" : "#ef4444",
              }}
            />
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>

      <Box
        sx={{
          height: "24rem",
          overflow: "auto",
          bgcolor: "#f9fafb",
          p: 2,
          m: 2,
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.875rem",
          textAlign: 'left'
        }}
      >
        {displayedLogs.map((log, index) => (
          <Box key={index} sx={{ py: 0.5 }}>
            <Typography component="span" sx={{ color: "#6b7280" }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </Typography>
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: getLogLevelColor(log.level),
              }}
            >
              [{log.level}]
            </Typography>
            <Typography component="span" sx={{ ml: 1 }}>
              {log.message}
            </Typography>
          </Box>
        ))}
        <div ref={logsEndRef} />
      </Box>
    </Paper>
  );
};

export default LogViewer;