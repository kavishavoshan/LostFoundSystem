// src/components/common/SimpleDataGrid.jsx
import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

const SimpleDataGrid = ({ rows, columns, title = "Item List" }) => {
  return (
    <Box sx={{ height: 400, width: "100%", backgroundColor: "#fff", p: 2, borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F3F4F6",
          },
        }}
      />
    </Box>
  );
};

export default SimpleDataGrid;
