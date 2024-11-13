// ViewKnowledgeBasePage.jsx
import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    Fade,
    Skeleton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import {config} from '../config/config';
import WebpageNetwork from "./WebpageNetwork";

const ViewKnowledgeBasePage = () => {
    const {taskId} = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!taskId) return;
            try {
                setLoading(true);
                setContentVisible(false);

                // Add a minimum loading time to prevent flashing
                const minimumLoadTime = 300;
                const startTime = Date.now();

                const response = await axios.get(`${config.SEARCH_ENGINE_API_URL}/api/text_index/${taskId}`);

                // Calculate remaining time to meet minimum load time
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);

                // Wait for minimum time before showing content
                setTimeout(() => {
                    setData(response.data);
                    setContentVisible(true);
                    setLoading(false);
                }, remainingTime);

            } catch (err) {
                setError('Failed to fetch knowledge base details');
                console.error('Error fetching data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, [taskId]);

    const handleClose = () => {
        window.close();
    };

    const handleBack = () => {
        // If opened in new tab, close it, otherwise navigate back
        if (window.history.length <= 1) {
            window.close();
        } else {
            navigate('/knowledge-base', { replace: true });
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="text" width={200} height={40} />
                    </Box>

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box key={item}>
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={150} height={24} />
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    <Skeleton variant="rectangular" width="100%" height={400} />
                </Box>
            );
        }

        if (error || !data) {
            return (
                <Fade in={true}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <Typography color="error">{error || 'No data found'}</Typography>
                    </Box>
                </Fade>
            );
        }

        return (
            <Fade in={contentVisible}>
                <Box sx={{p: 0, mt: 0}}>
                    <Box sx={{mb: 0}}>
                        <Box sx={{
                            display: 'flex',
                            px: 2,
                            mb: 2,
                            alignItems: 'center',
                            gap: 2,
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton
                                    onClick={handleBack}
                                    sx={{
                                        backgroundColor: '#f0f4f8',
                                        '&:hover': {
                                            backgroundColor: '#e3f2fd',
                                        }
                                    }}
                                >
                                    <ArrowBackIcon/>
                                </IconButton>
                                <Typography variant="h6">
                                    Knowledge Base Details
                                </Typography>
                            </Box>

                            {/* Close button */}
                            <IconButton
                                onClick={handleClose}
                                sx={{
                                    backgroundColor: '#f0f4f8',
                                    '&:hover': {
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626'
                                    }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{display: 'grid', gap: 3}}>
                        <Paper
                            sx={{
                                p: 1,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                gap: 4,
                                flexWrap: 'nowrap',
                                alignItems: 'center'
                            }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Task ID</Typography>
                                    <Typography variant="body1" sx={{fontFamily: 'monospace'}}>{data.task_id}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Scraping URL</Typography>
                                    <Typography variant="body1" sx={{fontFamily: 'monospace'}}>{data.scraping_url}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                    <Chip
                                        label={data.status}
                                        color={data.status === 'completed' ? 'success' : 'warning'}
                                        size="small"
                                        sx={{textTransform: 'capitalize', mt: 0.5}}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                                    <Typography variant="body1">{new Date(data.created_at).toLocaleString()}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Files</Typography>
                                    <Typography variant="body1">
                                        {data.processed_files}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    <Box>
                        {data.webpage_graph && (
                            <WebpageNetwork data={data.webpage_graph}/>
                        )}
                    </Box>
                </Box>
            </Fade>
        );
    };

    return (
        <Box sx={{width: "100%", p: 3}}>
            <Paper
                sx={{
                    width: "100%",
                    transition: 'all 0.3s ease'
                }}
            >
                {renderContent()}
            </Paper>
        </Box>
    );
};

export default ViewKnowledgeBasePage;