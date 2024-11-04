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
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import LogViewer from "./LogViewer";

const BuildIndex = () => {
  const [indexName, setIndexName] = useState(() => {
    const savedIndexName = localStorage.getItem("indexName");
    return savedIndexName || "";
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("indexData");
    try {
      return savedData ? JSON.parse(savedData) : {};
    } catch (e) {
      console.error("Error parsing stored data:", e);
      return {};
    }
  });

  // Save to localStorage whenever data or indexName changes
  useEffect(() => {
    localStorage.setItem("indexName", indexName);
  }, [indexName]);

  useEffect(() => {
    localStorage.setItem("indexData", JSON.stringify(data));
  }, [data]);

  const handleBuildIndex = async () => {
    if (!indexName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5009/api/build_text_index/${encodeURIComponent(
          indexName
        )}`
      );
      setData(response.data);
      console.log(response.data);
      // Save to localStorage immediately after successful response
      localStorage.setItem("indexData", JSON.stringify(response.data));
    } catch (error) {
      setError(error.message);
      // Optionally save error state to localStorage
      localStorage.setItem("indexError", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleBuildIndex();
    }
  };

  const handleClearData = () => {
    setData({});
    setIndexName("");
    setError(null);
    // Clear localStorage
    localStorage.removeItem("indexName");
    localStorage.removeItem("indexData");
    localStorage.removeItem("indexError");
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", margin: 2, padding: 2 }}>
      {/* Header and Clear Button */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Build Index</Typography>
        {(Object.keys(data).length > 0 || indexName) && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearData}
            size="small"
          >
            Clear Data
          </Button>
        )}
      </Stack>

      {/* Input Section */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ marginBottom: 3 }}
        alignItems="center"
      >
        <TextField
          fullWidth
          label="Enter index name"
          variant="outlined"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ maxWidth: 500 }}
        />
        <Button
          variant="contained"
          onClick={handleBuildIndex}
          disabled={loading || !indexName.trim()}
          startIcon={<BuildIcon />}
        >
          Build Index
        </Button>
      </Stack>

      {/* Loading State */}
      {loading && (
        <Box sx={{ padding: 2, textAlign: "center" }}>Building index...</Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ padding: 2, color: "error.main" }}>Error: {error}</Box>
      )}

      {/* Results Table */}
      {/* {!loading && !error && Object.keys(data).length > 0 && (
        <TableContainer sx={{ maxHeight: 900 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Index Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{indexName}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      bgcolor:
                        data.status === "completed"
                          ? "success.main"
                          : "primary.main",
                      color: "white",
                      borderRadius: 1,
                      padding: "4px 8px",
                      display: "inline-block",
                    }}
                  >
                    {data.message || "Processing"}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )} */}

      {/* No Results State */}
      {!loading && !error && Object.keys(data).length === 0 && indexName && (
        <Box sx={{ padding: 2, textAlign: "center", color: "text.secondary" }}>
          No index has been built yet.
        </Box>
      )}
      <LogViewer taskId={indexName}/>
    </Paper>
  );
};

export default BuildIndex;
