"use client";

import { Box, Skeleton, Grid, Card, CardContent } from "@mui/material";

export function ProductCardSkeleton() {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={32} width="80%" />
        <Skeleton variant="text" height={24} width="60%" sx={{ mt: 1 }} />
        <Skeleton variant="text" height={28} width="40%" sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <ProductCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

export function CartItemSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={100} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" height={28} width="70%" />
            <Skeleton variant="text" height={24} width="40%" sx={{ mt: 1 }} />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Skeleton variant="rectangular" width={100} height={36} />
              <Skeleton variant="rectangular" width={80} height={36} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function OrderCardSkeleton() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Skeleton variant="text" width={150} height={28} />
          <Skeleton variant="rectangular" width={80} height={28} sx={{ borderRadius: 4 }} />
        </Box>
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mt: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Skeleton variant="text" width={100} height={32} />
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function ProductDetailSkeleton() {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="text" height={48} width="90%" />
        <Skeleton variant="text" height={32} width="40%" sx={{ mt: 2 }} />
        <Skeleton variant="text" width="100%" sx={{ mt: 3 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" height={48} sx={{ mt: 4, borderRadius: 1 }} />
      </Grid>
    </Grid>
  );
}
