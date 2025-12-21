"use client";

import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
} from "@mui/material";
import  useProducts from "@/hooks/useProducts";

export default function HomePage() {
  const { products } = useProducts();

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} mb={4}>
        Featured Products
      </Typography>

      <Grid container spacing={4}>
        {products.map((p: any) => (
          <Grid item xs={12} sm={6} md={4} key={p._id}>
            <Card>
              <CardMedia
                component="img"
                height="220"
                image={p.image}
              />
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography color="text.secondary">
                  ${p.price}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
