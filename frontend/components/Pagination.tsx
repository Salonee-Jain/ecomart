"use client";

import { Box, Pagination as MuiPagination, Typography, Select, MenuItem, FormControl } from "@mui/material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 48],
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mt: 4,
        p: 2,
        borderTop: "1px solid #E8E8E8",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {startItem}-{endItem} of {totalItems} items
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {onPageSizeChange && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Items per page:
            </Typography>
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{
                  minWidth: 80,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E8E8E8",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#EB1700",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#EB1700",
                  },
                }}
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <MuiPagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange(page)}
          color="primary"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#767676",
              borderColor: "#E8E8E8",
              "&:hover": {
                backgroundColor: "#FFF5F5",
                borderColor: "#EB1700",
              },
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              backgroundColor: "#EB1700",
              color: "white",
              "&:hover": {
                backgroundColor: "#C91400",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
