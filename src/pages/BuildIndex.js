import React, {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
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

// const validateUrl = (url) => {
//     try {
//         const urlObject = new URL(url);
//         return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
//     } catch (e) {
//         return false;
//     }
// };

function validateUrl(str) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', // fragment locator
        'i'
    );
    return pattern.test(str);
}

const BuildIndex = () => {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const [data, setData] = useState({});
    const [retryCount, setRetryCount] = useState(0);
    const [clearLogs, setClearLogs] = useState(false);
    const [hasBuilding, setHasBuilding] = useState(false);
    const [hasCancelBuilding, setHasCancelBuilding] = useState(false);
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
        setHasBuilding(false);
        setHasCancelBuilding(false);
        setTimeout(() => setClearLogs(false), 100);
    };

    const handleCancelBuilding = async () => {
        if (!taskId) return;

        try {
            await axios.post(`${config.SEARCH_ENGINE_API_URL}/api/kill/${taskId}`);
            setHasCancelBuilding(true);
            setLoading(false);
            setError("Building process cancelled");
        } catch (error) {
            setError("Failed to cancel building process which is not running.");
        }
    };

    const handleBuilding = async () => {
        if (!url.trim()) return;

        // URL validation
        if (!validateUrl(url.trim())) {
            setError("Please enter a valid URL (e.g., https://example.com)");
            return;
        }

        handleClearData();
        setLoading(true);
        setHasBuilding(true);

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
            if (!taskId || !isPollingActive || hasCancelBuilding) return;

            try {
                const response = await axios.get(
                    `${config.SEARCH_ENGINE_API_URL}/api/clustering_status/${taskId}`
                );
                setData(response.data);

                if (response.data.status === "completed") {
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

        if (loading && taskId && !hasCancelBuilding) {
            checkStatus();
            pollInterval = setInterval(checkStatus, POLLING_INTERVAL);
        }

        return () => {
            isPollingActive = false;
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [taskId, loading, retryCount, error, hasCancelBuilding]);

    const handleView = (taskId, indexId, event) => {
        const url = `/knowledge-base/view/${taskId}/${indexId}`;
        if (event.button === 2) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            navigate(url);
        }
    };

    const handleSearch = (index_data, indexId, event) => {
        const url = `/knowledge-base/search/${index_data.task_id}/${indexId}`;

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

        if (event.button === 2) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
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
            <Box
                sx={{
                    position: 'fixed',
                    top: 70,
                    left: 0,
                    right: 0,
                    zIndex: 1100,
                    backgroundColor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    px: 3,
                    pt: 3,
                    pb: 2
                }}
            >
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
                    {loading ? (
                        <Button
                            variant="contained"
                            color={hasCancelBuilding ? "secondary" : "error"}
                            onClick={handleCancelBuilding}
                            disabled={hasCancelBuilding}
                            startIcon={<UploadFileIcon />}
                            sx={{
                                whiteSpace: 'nowrap',
                                opacity: hasCancelBuilding ? 0.7 : 1,
                                transition: 'all 0.2s',
                                backgroundColor: hasCancelBuilding ? 'grey.300' : undefined,
                                '&:disabled': {
                                    backgroundColor: 'grey.300',
                                    color: 'grey.500'
                                }
                            }}
                        >
                            {hasCancelBuilding ? 'Cancelled' : 'Cancel Building'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleBuilding}
                            disabled={!url.trim()}
                            startIcon={<UploadFileIcon/>}
                            sx={{whiteSpace: 'nowrap'}}
                        >
                            Start Building
                        </Button>
                    )}
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

                {error && (
                    <Box sx={{padding: 2, color: "error.main"}}>{error}</Box>
                )}

                {!error && hasBuilding && data?.task_id &&(
                    <Box sx={{overflowX: 'auto'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Id</TableCell>
                                    <TableCell>Task ID</TableCell>
                                    <TableCell>Knowledge Base</TableCell>
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
                                    handleView={(event) => handleView(data.task_id, 0, event)}
                                    handleSearch={(event) => handleSearch(data, 0, event)}
                                />
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </Box>


            <Box sx={{
                mt: '230px'
            }}>
                {hasBuilding && <LogViewer taskId={url} clearLogs={clearLogs} />}
            </Box>


        </BorderlessPaper>
    );
};

export default BuildIndex;