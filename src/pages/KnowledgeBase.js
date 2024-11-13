// src/components/KnowledgeBase.js
import React, {useState, useEffect} from 'react';
import {Routes, Route} from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import {config} from '../config/config';
import ViewKnowledgeBase from './ViewKnowledgeBasePage';
import TaskRow from "../components/TaskRow";

const KnowledgeBaseList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.SEARCH_ENGINE_API_URL}/api/text_indexes`);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch knowledge base data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>No knowledge base entries found</Typography>
            </Box>
        );
    }

    return (
        <TableContainer>
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
                    {data.map((item, index) => (
                        <TaskRow key={item.task_id} item={item} index={index} handleView={handleView}
                                 handleSearch={handleSearch}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const KnowledgeBase = () => {
    return (
        <Routes>
            <Route path="/" element={<KnowledgeBaseList/>}/>
            <Route path="/view/:taskId" element={<ViewKnowledgeBase/>}/>
        </Routes>
    );
};

export default KnowledgeBase;