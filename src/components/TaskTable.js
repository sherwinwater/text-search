import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import TaskRow from "./TaskRow";

const TaskTable = ({ data, indexId=0,handleView,handleSearch }) => {
    return (
        <Table stickyHeader>
            <TableHead>
                <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Task ID</TableCell>
                    <TableCell>Knowledge Base</TableCell>
                    <TableCell>Files</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TaskRow
                    key={data.task_id}
                    item={data}
                    index={indexId}
                    {...(handleView && { handleView: (event) => handleView(data.task_id, indexId,event) })}
                    {...(handleSearch && { handleSearch: (event) => handleSearch(data, indexId, event) })}
                />
            </TableBody>
        </Table>
    );
};

export default TaskTable;