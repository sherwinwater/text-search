// ViewKnowledgeBasePage.jsx
import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Fade,
    Skeleton
} from '@mui/material';
import {config} from '../config/config';
import WebpageNetwork from "../components/WebpageNetwork";
import ClusterBrowser from "../components/ClusterBrowser";
import TaskTable from "../components/TaskTable";

const ViewKnowledgeBasePage = () => {
    const {taskId,indexId} = useParams();
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
        console.log("rul---", url)

        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            console.log("rul", url)
            navigate(url);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{p: 3}}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 3, gap: 2}}>
                        <Skeleton variant="circular" width={40} height={40}/>
                        <Skeleton variant="text" width={200} height={40}/>
                    </Box>

                    <Paper sx={{p: 2, mb: 3}}>
                        <Box sx={{display: 'flex', gap: 4, flexWrap: 'nowrap'}}>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box key={item}>
                                    <Skeleton variant="text" width={100} height={20}/>
                                    <Skeleton variant="text" width={150} height={24}/>
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    <Skeleton variant="rectangular" width="100%" height={400}/>
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
                    <TaskTable data={data} indexId={indexId} handleSearch={handleSearch}/>

                    <Box>
                        {data.webpage_graph && (
                            <WebpageNetwork data={data.webpage_graph}/>
                        )}
                    </Box>
                    <Box sx={{
                        marginTop: "20px",
                    }}>
                        {data.clustering_data && <ClusterBrowser clusterData={data.clustering_data}/>}
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