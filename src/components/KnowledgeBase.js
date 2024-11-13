// src/components/KnowledgeBase.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    Typography,
    Chip,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { config } from '../config/config';
import ViewKnowledgeBase from './ViewKnowledgeBasePage';

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
        window.open(`/knowledge-base/view/${taskId}`, '_blank');
    };

    const handleSearch = (taskId) => {
        window.open(`/search/${taskId}`, '_blank');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
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

    return (
        <TableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Task ID</TableCell>
                        <TableCell>Scraping URL</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item,index) => (
                        <TableRow key={item.task_id} hover>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {index+1}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {item.task_id}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    <a
                                        href={item.scraping_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none', color: 'blue' }}
                                    >
                                        {item.scraping_url}
                                    </a>
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={item.status}
                                    color={item.status === 'completed' ? 'success' : 'warning'}
                                    size="small"
                                    sx={{ textTransform: 'capitalize' }}
                                />
                            </TableCell>
                            <TableCell>
                                {new Date(item.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => handleView(item.task_id)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<SearchIcon />}
                                        onClick={() => handleSearch(item.task_id)}
                                        disabled={item.status !== 'completed'}
                                    >
                                        Search
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {data.length === 0 && (
                <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <Typography color="text.secondary">
                        No knowledge base entries found
                    </Typography>
                </Box>
            )}
        </TableContainer>
    );
};

const KnowledgeBase = () => {
    return (
        <Routes>
            <Route path="/" element={<KnowledgeBaseList />} />
            <Route path="/view/:taskId" element={<ViewKnowledgeBase />} />
        </Routes>
    );
};

export default KnowledgeBase;