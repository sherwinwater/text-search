import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Container,
    Button
} from '@mui/material';

const AdminDashboard = ({ onLogout }) => {
    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        onLogout();
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to the admin dashboard. Here you can manage your knowledge base and other settings.
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminDashboard;