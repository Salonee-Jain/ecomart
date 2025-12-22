"use client";

import { Dialog, Box, IconButton } from "@mui/material";
import { Close, ChevronLeft, ChevronRight, ZoomIn } from "@mui/icons-material";
import { useState } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const hasMultipleImages = images.length > 1;
  const currentImage = images[selectedImage] || images[0];

  const handleNext = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box>
      {/* Main Image */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1/1",
          backgroundColor: "#FAFAFA",
          borderRadius: 2,
          overflow: "hidden",
          cursor: "zoom-in",
        }}
        onClick={() => setZoomOpen(true)}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          style={{ objectFit: "contain", padding: "2rem" }}
          priority
        />
        
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setZoomOpen(true);
          }}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "white",
            boxShadow: 1,
            "&:hover": { bgcolor: "#FFF5F5", color: "#EB1700" },
          }}
        >
          <ZoomIn />
        </IconButton>

        {hasMultipleImages && (
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "#FFF5F5", color: "#EB1700" },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "white",
                boxShadow: 1,
                "&:hover": { bgcolor: "#FFF5F5", color: "#EB1700" },
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnail Strip */}
      {hasMultipleImages && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: 6,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#F0F0F0",
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#E8E8E8",
              borderRadius: 3,
              "&:hover": {
                backgroundColor: "#D0D0D0",
              },
            },
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              onClick={() => setSelectedImage(index)}
              sx={{
                minWidth: 80,
                width: 80,
                height: 80,
                borderRadius: 1.5,
                border: selectedImage === index ? "2px solid #EB1700" : "2px solid #E8E8E8",
                cursor: "pointer",
                overflow: "hidden",
                backgroundColor: "#FAFAFA",
                transition: "border-color 0.2s",
                "&:hover": {
                  borderColor: selectedImage === index ? "#EB1700" : "#D0D0D0",
                },
                position: "relative",
              }}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                style={{ objectFit: "contain", padding: "0.5rem" }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Zoom Dialog */}
      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          },
        }}
      >
        <IconButton
          onClick={() => setZoomOpen(false)}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "white",
            zIndex: 1,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "80vh",
            p: 4,
          }}
        >
          <Image
            src={currentImage}
            alt={productName}
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>

        {hasMultipleImages && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </Dialog>
    </Box>
  );
}
