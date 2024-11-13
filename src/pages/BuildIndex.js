import React, {useState, useEffect} from "react";
import axios from "axios";
import {
    Paper,
    Box,
    TextField,
    Button,
    Stack, Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogViewer from "../components/LogViewer";
import {config} from "../config/config";
import TaskRow from "../components/TaskRow";

const POLLING_INTERVAL = 5000; // 5 seconds

const BuildIndex = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [data, setData] = useState({});

    const handleView = (taskId) => {
        // Create full URL for the new tab
        const url = `/knowledge-base/view/${taskId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleSearch = (index_data) => {
        if (index_data) {
            localStorage.setItem('knowledgeBaseData', JSON.stringify({
                task_id: index_data.task_id,
                scraping_url: index_data.scraping_url,
                status: index_data.status,
                created_at: index_data.created_at,
                processed_files: index_data.processed_files
            }));
        }
        window.open(`/knowledge-base/search/${index_data.task_id}`, '_blank');
    };

    // Clear localStorage and reset state on component mount
    useEffect(() => {
        localStorage.removeItem("scrapeUrl");
        localStorage.removeItem("scrapeData");
        localStorage.removeItem("scrapeError");

        setUrl("");
        setData({});
        setError(null);
        setTaskId(null);
        setLoading(false);
    }, []);

    // Polling effect
    useEffect(() => {
        let pollInterval;

        const checkStatus = async () => {
            if (!taskId) return;

            try {
                const response = await axios.get(
                    `${config.SEARCH_ENGINE_API_URL}/api/build_text_index_status/${taskId}`
                );

                setData(response.data);

                if (response.data.status === "completed") {
                    setLoading(false);
                    clearInterval(pollInterval);
                } else if (response.data.status === "failed") {
                    setError("Building process failed");
                    setLoading(false);
                    clearInterval(pollInterval);
                }
            } catch (error) {
                setError(error.message);
                setLoading(false);
                clearInterval(pollInterval);
            }
        };

        if (loading && taskId) {
            // Start polling
            checkStatus(); // Initial check
            pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
        }

        // Cleanup function
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [taskId, loading, data]);

    const handleBuilding = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError(null);

        const apiEndpoint = `${config.SEARCH_ENGINE_API_URL}/api/build_index_by_url`;

        try {
            const response = await axios.post(apiEndpoint, {url});
            setData(response.data);
            setTaskId(response.data.task_id);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleBuilding();
        }
    };

    const handleClearData = () => {
        setData({});
        setUrl("");
        setError(null);
        setTaskId(null);
        setLoading(false);
    };

    return (
        <Paper sx={{width: "100%", overflow: "hidden", margin: 1, padding: 3}}>
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
                    Building in progress... This may take time.
                </Box>
            )}

            {error && (
                <Box sx={{padding: 2, color: "error.main"}}>Error: {error}</Box>
            )}

            {!error && !loading && Object.keys(data).length > 0 && (
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Task ID</TableCell>
                            <TableCell>Scraping URL</TableCell>
                            <TableCell>Files</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TaskRow key={data.task_id} item={data} index={0} handleView={handleView}
                                 handleSearch={handleSearch}/>

                    </TableBody>
                </Table>
            )}

            <Box sx={{flexGrow: 1}}>
                <LogViewer taskId={url}/>
            </Box>

        </Paper>
    );
};

export default BuildIndex;