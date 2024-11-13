import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    InputAdornment,
    TextField,
    Chip,
    Paper,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
} from '@mui/material';
import {
    Search,
    Folder,
    Label,
    Article
} from '@mui/icons-material';
import clusterData from './cluster_structure.json';

const ClusterBrowser = () => {
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const theme = useTheme();

    // Filter clusters and documents based on search term
    const getFilteredData = () => {
        if (!searchTerm) return clusterData;

        const filtered = {};
        Object.entries(clusterData).forEach(([clusterId, cluster]) => {
            const matchingDocs = cluster.documents.filter(doc =>
                doc.file_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.preview.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (matchingDocs.length > 0 ||
                cluster.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))) {
                filtered[clusterId] = {
                    ...cluster,
                    documents: matchingDocs
                };
            }
        });
        return filtered;
    };

    const filteredData = getFilteredData();

    return (
        <Box sx={{ maxWidth: '1200px', margin: 'auto', p: 3 }}>
            {/* Search Bar */}
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search clusters, documents, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Clusters Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {Object.entries(filteredData).map(([clusterId, cluster]) => (
                    <Grid item xs={12} sm={6} md={4} key={clusterId}>
                        <Card
                            elevation={selectedCluster === clusterId ? 8 : 1}
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[4]
                                },
                                border: selectedCluster === clusterId ?
                                    `2px solid ${theme.palette.primary.main}` : 'none'
                            }}
                            onClick={() => setSelectedCluster(clusterId === selectedCluster ? null : clusterId)}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Folder color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6" component="div">
                                        {clusterId}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ ml: 'auto' }}
                                    >
                                        {cluster.size} docs
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                    {cluster.keywords.map((keyword, idx) => (
                                        <Chip
                                            key={idx}
                                            icon={<Label />}
                                            label={keyword}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Selected Cluster Details */}
            {selectedCluster && (
                <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ px: 2, py: 1 }}>
                        Documents in {selectedCluster}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                        {filteredData[selectedCluster].documents.map((doc) => (
                            <ListItem
                                key={doc.index}
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'action.hover'
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <Article color="action" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Link
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{
                                                cursor: 'pointer',
                                                textDecoration: 'none',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            {doc.url}
                                        </Link>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {doc.preview}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default ClusterBrowser;