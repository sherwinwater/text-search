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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Alert,
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { config } from "../config/config";

const SearchText = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [availableIndexes, setAvailableIndexes] = useState(() => {
    const saved = localStorage.getItem("builtIndexes");
    return saved ? JSON.parse(saved) : [];
  });

  // Add new index to the available indexes
  const addIndex = (indexInfo) => {
    setAvailableIndexes((prev) => {
      const newIndexes = [
        ...prev.filter((idx) => idx.name !== indexInfo.name),
        indexInfo,
      ];
      localStorage.setItem("builtIndexes", JSON.stringify(newIndexes));
      return newIndexes;
    });
  };

  // Remove index from available indexes
  const removeIndex = (indexName) => {
    setAvailableIndexes((prev) => {
      const newIndexes = prev.filter((idx) => idx.name !== indexName);
      localStorage.setItem("builtIndexes", JSON.stringify(newIndexes));
      return newIndexes;
    });
    if (selectedIndex?.name === indexName) {
      setSelectedIndex(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedIndex) return;

    setLoading(true);
    setError(null);
    setData([]);

    try {
      const response = await axios.get(
        `${config.SEARCH_ENGINE_API_URL}/api/search_text/${encodeURIComponent(
          selectedIndex.name
        )}?query=${encodeURIComponent(searchQuery)}`
      );
      setData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && selectedIndex) {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setData([]);
    setSearchQuery("");
    setError(null);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        margin: 1,
        padding: 3,
      }}
    >
      {/* Index Selection and Search Section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Index Selection */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Search Index
              </Typography>
              <Stack spacing={2}>
                <Autocomplete
                  value={selectedIndex}
                  onChange={(event, newValue) => setSelectedIndex(newValue)}
                  options={availableIndexes}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select an index"
                      variant="outlined"
                    />
                  )}
                  renderOption={(props, option) => (
                    <MenuItem {...props}>
                      <Stack spacing={1} sx={{ width: "100%" }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(option.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {option.url}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  )}
                />
                {selectedIndex && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={`URL: ${selectedIndex.url}`}
                      size="small"
                      onDelete={() => removeIndex(selectedIndex.name)}
                      deleteIcon={
                        <Tooltip title="Remove this index">
                          <DeleteIcon />
                        </Tooltip>
                      }
                    />
                    <Tooltip
                      title={`Created: ${new Date(
                        selectedIndex.timestamp
                      ).toLocaleString()}`}
                    >
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Search Query Input */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Search Query
              </Typography>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  label="Enter your search query"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!selectedIndex}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim() || !selectedIndex}
                  startIcon={<SearchIcon />}
                >
                  Search
                </Button>
                {(data.length > 0 || searchQuery) && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearSearch}
                    size="medium"
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {loading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Searching...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {/* Results Section */}
      {!loading && !error && data.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="100">Score</TableCell>
                    <TableCell>Filename</TableCell>
                    <TableCell>Content</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell>
                        <Chip
                          label={
                            typeof item.score === "number"
                              ? item.score.toFixed(2)
                              : item.score
                          }
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.filename}</TableCell>
                      <TableCell sx={{ maxWidth: 800 }}>
                        <Box
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontSize: "0.875rem",
                          }}
                        >
                          {item.content.slice(0, 2000)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data.length === 0 && searchQuery && (
        <Alert severity="info">No results found for your search.</Alert>
      )}
    </Paper>
  );
};

export default SearchText;
