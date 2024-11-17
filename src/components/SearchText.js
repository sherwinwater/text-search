import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    TextField,
    Button,
    Stack,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { config } from "../config/config";

const SearchText = ({ defaultTaskId, onSearchUpdate }) => {
    // eslint-disable-next-line
    const [searchIndexId, setSearchIndexId] = useState(defaultTaskId || "");
    const [data, setData] = useState(() => {
        // Initialize state with localStorage data
        try {
            const savedData = localStorage.getItem(config.SEARCH_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return parsedData.data || { results: [] };
            }
        } catch (error) {
            console.error('Error reading search data:', error);
        }
        return { results: [] };
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(() => {
        try {
            const savedData = localStorage.getItem(config.SEARCH_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return parsedData.searchQuery || "";
            }
        } catch (error) {
            console.error('Error reading search query:', error);
        }
        return "";
    });
    const [hasSearched, setHasSearched] = useState(() => {
        try {
            const savedData = localStorage.getItem(config.SEARCH_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                return parsedData.hasSearched || false;
            }
        } catch (error) {
            console.error('Error reading search state:', error);
        }
        return false;
    });

    // Update search state in parent component
    useEffect(() => {
        if (onSearchUpdate) {
            onSearchUpdate({
                data,
                searchQuery,
                hasSearched
            });
        }
    }, [data, searchQuery, hasSearched, onSearchUpdate]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setData({ results: [] });
        setHasSearched(true);

        try {
            const response = await axios.get(
                `${config.SEARCH_ENGINE_API_URL}/api/search_text/${encodeURIComponent(
                    searchIndexId
                )}?query=${encodeURIComponent(searchQuery)}`
            );
            setData(response.data);

            // Save data to localStorage
            const searchData = {
                data: response.data,
                searchQuery,
                hasSearched: true
            };
            localStorage.setItem(config.SEARCH_STORAGE_KEY, JSON.stringify(searchData));

            // Update parent component
            if (onSearchUpdate) {
                onSearchUpdate(searchData);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        const clearedData = {
            data: { results: [] },
            searchQuery: "",
            hasSearched: false
        };

        setData(clearedData.data);
        setSearchQuery(clearedData.searchQuery);
        setError(null);
        setHasSearched(clearedData.hasSearched);

        localStorage.setItem(config.SEARCH_STORAGE_KEY, JSON.stringify(clearedData));
        if (onSearchUpdate) {
            onSearchUpdate(clearedData);
        }
    };


    return (
        <Paper
            sx={{
                width: "100%",
                overflow: "hidden",
                margin: 1,
                padding: 1,
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 32px)"
            }}
        >
            <Stack
                direction="row"
                spacing={2}
                sx={{ marginBottom: 3 }}
                alignItems="center"
            >
                <TextField
                    fullWidth
                    label="Enter your search query"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ maxWidth: 1100 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading || !searchQuery.trim()}
                    startIcon={<SearchIcon />}
                >
                    Search
                </Button>
                {(data.results.length > 0 || searchQuery || searchIndexId) && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearSearch}
                        size="small"
                    >
                        Clear
                    </Button>
                )}
            </Stack>

            {!loading && !error && data.results.length > 0 && (
                <Box sx={{ paddingX: 2, textAlign: "left" }}>
                    <Typography variant="body1">
                        Showing {data.results.length} results for{' '}
                        <Box component="span" sx={{ color: "primary.main" }}>
                            {data.suggestion_text || data.original_query}
                        </Box>
                    </Typography>
                </Box>
            )}

            {loading && (
                <Box sx={{ padding: 2, textAlign: "center" }}>Loading...</Box>
            )}

            {error && (
                <Box sx={{ padding: 2, color: "error.main" }}>Error: {error}</Box>
            )}

            {!loading && !error && data.results.length > 0 && (
                <TableContainer sx={{ flexGrow: 1, maxHeight: 'none', mb: 4 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Score</TableCell>
                                <TableCell>Link</TableCell>
                                <TableCell>Content</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.results.map((item) => (
                                <TableRow
                                    key={item.document_id}
                                    hover
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell>
                                        <Box
                                            sx={{
                                                bgcolor: "primary.main",
                                                color: "white",
                                                borderRadius: 1,
                                                padding: "4px 8px",
                                                display: "inline-block",
                                            }}
                                        >
                                            {typeof item.score === "number"
                                                ? item.score.toFixed(2)
                                                : item.score}
                                        </Box>
                                    </TableCell>
                                    <TableCell style={{ width: '100px' }}>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            {item.url}
                                        </a>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 900 }}>
                                        <Box className="whitespace-pre-wrap break-words max-w-md text-sm">
                                            {item.content.slice(0, 1000)}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {!loading && !error && data.results.length === 0 && hasSearched && (
                <Box sx={{ padding: 2, textAlign: "center", color: "text.secondary" }}>
                    No results found for your search.
                </Box>
            )}
        </Paper>
    );
};

export default SearchText;