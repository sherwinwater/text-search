import React, {useEffect, useState, useRef} from "react";
import {io} from "socket.io-client";
import {
    Paper,
    Box,
    Typography,
    LinearProgress
} from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {styled} from '@mui/material/styles';
import {config} from '../config/config';
import {useLocation} from "react-router-dom";

// Styled components
const LogContainer = styled(Paper)(({theme}) => ({
    width: '100%',
    maxWidth: '100%',
    height: '20%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
}));

const HeaderBox = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%',
}));

const HeaderContent = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    width: '100%',
});

const StatusBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
});

const LogsBox = styled(Box)(({theme}) => ({
    height: 'calc(100% - 90px)',
    overflow: 'auto',
    backgroundColor: '#f9fafb',
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    fontSize: '10px',
    textAlign: 'left',
    width: 'auto',
    flex: 1,
}));

const LogEntry = styled(Box)(({theme}) => ({
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
}));

const TimeStamp = styled(Typography)({
    color: '#6b7280',
    display: 'inline',
    fontSize: '10px',
});

const LogLevel = styled(Typography)(({color}) => ({
    marginLeft: '8px',
    color: color,
    display: 'inline',
    fontSize: '10px',
}));

const LogMessage = styled(Typography)({
    marginLeft: '8px',
    display: 'inline',
    fontSize: '10px',
});

const StyledLinearProgress = styled(LinearProgress)({
    height: 4,
    borderRadius: 2,
});

const LogViewer = ({taskId, clearLogs}) => {
    const [displayedLogs, setDisplayedLogs] = useState([]);
    const [queuedLogs, setQueuedLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [hasReceivedLogs, setHasReceivedLogs] = useState(false);
    const socketRef = useRef(null);
    const logsEndRef = useRef(null);
    const location = useLocation();

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

    useEffect(() => {
        if (clearLogs) {
            setDisplayedLogs([]);
            setQueuedLogs([]);
            // Don't reset hasReceivedLogs here to keep UI visible
        }
    }, [clearLogs]);

    useEffect(() => {
        if (queuedLogs.length > 0) {
            const timer = setTimeout(() => {
                const nextLog = queuedLogs[0];
                setDisplayedLogs(prev => [...prev, nextLog]);
                setQueuedLogs(prev => prev.slice(1));
            }, 5);

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
            const excludedPhrases = ["connected", "joined room", "health check"];
            const lowercaseMessage = logEntry.message.toLowerCase();

            if (excludedPhrases.some(phrase => lowercaseMessage.includes(phrase))) {
                return;
            }

            setHasReceivedLogs(true);
            setQueuedLogs(prev => [...prev, logEntry]);
        });

        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [taskId]);

    useEffect(() => {
        if (location.pathname !== '/build' && socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, [location.pathname]);


    useEffect(() => {
        logsEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [displayedLogs]);

    // Only show UI if we've received logs at least once
    if (!hasReceivedLogs) {
        return null;
    }

    return (
        <Box sx={{width: '100%', display: 'flex', flexDirection: 'column'}}>
            <LogContainer elevation={2}>
                <HeaderBox>
                    <HeaderContent>
                        <Typography variant="body1" component="h2">
                            Live Logs
                        </Typography>
                        <StatusBox>
                            <Typography variant="body2" color="text.secondary">
                                Logs: {displayedLogs.length} {queuedLogs.length > 0 && `(${queuedLogs.length} pending)`}
                            </Typography>
                            <FiberManualRecordIcon
                                sx={{
                                    fontSize: 12,
                                    color: isConnected ? "#22c55e" : "#ef4444",
                                }}
                            />
                        </StatusBox>
                    </HeaderContent>
                    <StyledLinearProgress
                        sx={{ height: 2 }}
                        variant="determinate"
                        value={queuedLogs.length > 0 ?
                            (displayedLogs.length / (displayedLogs.length + queuedLogs.length)) * 100 :
                            100
                        }
                    />
                </HeaderBox>

                <LogsBox>
                    {displayedLogs.map((log, index) => (
                        <LogEntry key={index}>
                            <TimeStamp>
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </TimeStamp>
                            <LogLevel color={getLogLevelColor(log.level)}>
                                [{log.level}]
                            </LogLevel>
                            <LogMessage>
                                {log.message}
                            </LogMessage>
                        </LogEntry>
                    ))}
                    <div ref={logsEndRef}/>
                </LogsBox>
            </LogContainer>
        </Box>
    );
};

export default LogViewer;