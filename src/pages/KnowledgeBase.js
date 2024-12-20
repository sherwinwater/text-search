import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate here
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
    CircularProgress,
    Pagination
} from '@mui/material';
import { config } from '../config/config';
import ViewKnowledgeBase from './ViewKnowledgeBasePage';
import TaskRow from "../components/TaskRow";

const KnowledgeBaseList = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10; // Adjust this value as needed
    const navigate = useNavigate();

    const isAdmin = localStorage.getItem('isAdmin') === 'true';


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

    const handleView = (taskId, indexId,event) => {
        const url = `/knowledge-base/view/${taskId}/${indexId}`;
        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            navigate(url);
        }
    };

    const handleSearch = (index_data, indexId,event) => {
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

        if (event.button === 2) { // Right-click
            window.open(url, '_blank', 'noopener,noreferrer');
        } else { // Left-click
            navigate(url);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this knowledge base?')) {
            return;
        }

        try {
            await axios.delete(`${config.SEARCH_ENGINE_API_URL}/api/text_indexes/${taskId}`);

            // Update local data state immediately
            const newData = data.filter(item => item.task_id !== taskId);
            setData(newData);

            // Adjust page number if necessary
            const totalPages = Math.ceil(newData.length / itemsPerPage);
            if (page > totalPages) {
                setPage(totalPages || 1);
            }

            // If current page is empty but there is data, go to previous page
            const currentPageData = newData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
            if (currentPageData.length === 0 && newData.length > 0) {
                setPage(prev => Math.max(1, prev - 1));
            }
        } catch (err) {
            setError('Failed to delete knowledge base');
            console.error('Error deleting data:', err);
        }
    };

    const handleContextMenu = (event) => {
        event.preventDefault();
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    useEffect(() => {
        // Reset to first page when data changes significantly
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (page > totalPages) {
            setPage(1);
        }
    }, [data.length, page, itemsPerPage]);


    const paginatedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

    if (paginatedData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>No data found</Typography>
            </Box>
        );
    }

    return (
        <div onContextMenu={handleContextMenu}>
            <TableContainer sx={{ paddingX: 5, paddingY: 2, height: '800px',maxHeight: '1000px', overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead >
                        <TableRow >
                            <TableCell>Id</TableCell>
                            <TableCell>Task ID</TableCell>
                            <TableCell>Knowledge Base</TableCell>
                            <TableCell>Files</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell sx={{textAlign: 'center'}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((item, index) => {
                            const calculatedIndex = (page - 1) * itemsPerPage + index;
                            return (
                                <TaskRow
                                    key={item.task_id}
                                    item={item}
                                    index={calculatedIndex}
                                    handleView={(event) => handleView(item.task_id, calculatedIndex, event)}
                                    handleSearch={(event) => handleSearch(item, calculatedIndex,calculatedIndex, event)}
                                    handleDelete={handleDelete}
                                    isAdmin={isAdmin}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(data.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}
            />
        </div>
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