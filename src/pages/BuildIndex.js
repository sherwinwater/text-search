import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom'; // Import useNavigate here
import axios from "axios";
import {
    Paper,
    Box,
    TextField,
    Button,
    Stack,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogViewer from "../components/LogViewer";
import {config} from "../config/config";
import TaskRow from "../components/TaskRow";
import {styled} from "@mui/material/styles";

const POLLING_INTERVAL = 5000;
const MAX_RETRIES = 10;

const BorderlessPaper = styled(Paper)({
    width: "100%",
    overflow: "hidden",
    margin: "8px",
    padding: "24px",
    border: "none",
    boxShadow: "2px 0 1px -1px rgba(0,0,0,0.2), -2px 0 1px -1px rgba(0,0,0,0.2), 0 -2px 1px -1px rgba(0,0,0,0.2)"
});
const BuildIndex = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [data, setData] = useState({});
    const [retryCount, setRetryCount] = useState(0);
    const [clearLogs, setClearLogs] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        handleClearData();
        return () => handleClearData();
    }, []);

    const handleClearData = () => {
        setData({});
        setError(null);
        setTaskId(null);
        setLoading(false);
        setRetryCount(0);
        setClearLogs(true);
        setTimeout(() => setClearLogs(false), 100);
    };

    const handleBuilding = async () => {
        if (!url.trim()) return;

        // Clear all previous data first
        handleClearData();

        // Start new building process
        setLoading(true);

        try {
            const response = await axios.post(
                `${config.SEARCH_ENGINE_API_URL}/api/build_index_by_url`,
                {url: url.trim()}
            );
            setData(response.data);
            setTaskId(response.data.task_id);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        let pollInterval;
        let isPollingActive = true;

        const checkStatus = async () => {
            if (!taskId || !isPollingActive) return;

            try {
                const response = await axios.get(
                    `${config.SEARCH_ENGINE_API_URL}/api/clustering_status/${taskId}`
                );
                console.log("Response:", response.data);
                console.log("Status:", response.data.status, error, loading);

                if (response.data.status === "completed") {
                    setData(response.data);
                    setLoading(false);
                    setRetryCount(0);
                    clearInterval(pollInterval);
                } else if (response.data.status === "failed") {
                    setError("Building process failed");
                    setLoading(false);
                    clearInterval(pollInterval);
                } else if (response.data.status === "pending") {
                    setRetryCount(0);
                }
            } catch (error) {
                if (retryCount >= MAX_RETRIES) {
                    setError("Task not found after maximum retries");
                    setLoading(false);
                    clearInterval(pollInterval);
                } else {
                    setRetryCount(prev => prev + 1);
                }
            }
        };

        if (loading && taskId) {
            checkStatus();
            pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
        }

        return () => {
            isPollingActive = false;
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [taskId, loading, retryCount, error]);

    const handleView = (taskId, event) => {
        const url = `/knowledge-base/view/${taskId}`;
        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            navigate(url);
        }
    };

    const handleSearch = (index_data, event) => {
        const url = `/knowledge-base/search/${index_data.task_id}`;

        if (index_data) {
            localStorage.setItem('knowledgeBaseData', JSON.stringify({
                task_id: index_data.task_id,
                scraping_url: index_data.scraping_url,
                status: index_data.status,
                created_at: index_data.created_at,
                processed_files: index_data.processed_files
            }));
        }

        localStorage.removeItem(config.SEARCH_STORAGE_KEY);

        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            navigate(url);
        }
    };


    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleBuilding();
        }
    };


    return (
        <BorderlessPaper sx={{
            width: "100%", overflow: "hidden", margin: 1, padding: 3,
            '& .MuiPaper-root': {
                borderBottom: 'none'
            },
            '&.MuiPaper-root': {
                borderBottom: 'none'
            }
        }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{marginBottom: 3}}
                alignItems="center"
            >
                <TextField
                    fullWidth
                    label="Enter website URL to build knowledge base"
                    variant="outlined"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{maxWidth: 1100}}
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={handleBuilding}
                    disabled={loading || !url.trim()}
                    startIcon={<UploadFileIcon/>}
                >
                    {loading ? "Building..." : "Start Building"}
                </Button>
                {Object.keys(data).length > 0 && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearData}
                        size="small"
                    >
                        Clear
                    </Button>
                )}
            </Stack>

            {loading && (
                <Box sx={{padding: 2, textAlign: "center"}}>
                    {retryCount > 0
                        ? `Initializing... (Attempt ${retryCount}/${MAX_RETRIES})`
                        : `Building knowledge base from ${url} ... This may take time.`}
                </Box>
            )}

            {error && (
                <Box sx={{padding: 2, color: "error.main"}}>Error: {error}</Box>
            )}

            {!error && !loading && data?.status === "completed" && (
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Task ID</TableCell>
                            <TableCell>KnowledgeBase URL</TableCell>
                            <TableCell>Files</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TaskRow
                            key={data.task_id}
                            item={data}
                            index={0}
                            handleView={(event) => handleView(data.task_id, event)}
                            handleSearch={(event) => handleSearch(data, event)}
                        />
                    </TableBody>
                </Table>
            )}

            <Box sx={{flexGrow: 1}}>
                <LogViewer taskId={url} clearLogs={clearLogs}/>
            </Box>
        </BorderlessPaper>
    );
};

export default BuildIndex;