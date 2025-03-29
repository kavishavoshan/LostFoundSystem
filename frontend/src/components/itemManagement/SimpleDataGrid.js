import { DataGrid } from "@mui/x-data-grid";

const SimpleDataGrid = ({ title, rows, columns }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-darkBlue mb-2">{title}</h2>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 100]}
        />
      </div>
    </div>
  );
};

export default SimpleDataGrid;
