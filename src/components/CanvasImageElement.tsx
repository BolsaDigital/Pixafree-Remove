// src/components/CanvasImageElement.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';

interface ImageElement {
  id: string;
  url: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  blurRadius: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  reflectionEnabled: boolean;
  flipX: number;
  flipY: number;
  filter: 'none' | 'grayscale' | 'sepia';
  width?: number; // Added to interface
  height?: number; // Added to interface
}

interface CanvasImageElementProps {
  imageElement: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  // Modificado: Ahora pasamos x, y, width, height para la inicialización
  onImageLoaded: (id: string, initialScaleX: number, initialScaleY: number, x: number, y: number, width: number, height: number) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  onDragEnd: (e: KonvaEventObject<Event>) => void;
  elementRef: (node: any) => void; // Callback to pass the Konva node ref to parent
}

const CanvasImageElement: React.FC<CanvasImageElementProps> = ({
  imageElement,
  isSelected,
  onSelect,
  onImageLoaded,
  onTransformEnd,
  onDragEnd,
  elementRef,
}) => {
  const [image] = useImage(imageElement.url);
  const imageNodeRef = useRef<any>(null);

  // **CRUCIAL FIX for infinite loop**:
  // Only call onImageLoaded for initial setup if element is at its default state.
  useEffect(() => {
    if (image && imageNodeRef.current) {
      // Check if the image element's properties are still at their "default/uninitialized" values
      // We check if width/height are undefined, which indicates it's a newly added image.
      if (imageElement.width === undefined || imageElement.height === undefined) {
        const canvasSize = 700; // Assuming your canvas is 700x700. Make sure this matches your actual canvas size.
        const maxWidth = canvasSize * 0.8; // Fit to 80% of canvas
        const maxHeight = canvasSize * 0.8; // Fit to 80% of canvas
        let initialScale = 1;

        if (image.width > maxWidth || image.height > maxHeight) {
          initialScale = Math.min(maxWidth / image.width, maxHeight / image.height);
        }

        const centerX = canvasSize / 2;
        const centerY = canvasSize / 2;

        // Inform parent about the loaded image's initial scale and position
        // Parent will update the state, which then re-renders this component with new props
        onImageLoaded(
          imageElement.id,
          initialScale, // Use uniform scale for both X and Y
          initialScale,
          centerX,
          centerY,
          image.width, // Pass original image width
          image.height // Pass original image height
        );
      }
      // Konva node's position and scale are driven by imageElement.x, .y, .scaleX, .scaleY from props
      // We do NOT set imageNodeRef.current.x, .y, .scaleX, .scaleY directly here after initial load,
      // as it would create a loop with the state updates from the parent.
    }
  }, [image, imageElement.id, onImageLoaded, imageElement.width, imageElement.height]); // Depend on width/height to detect uninitialized state


  // Apply filters and shadow to Konva nodes
  const applyNodeProps = useCallback((node: any, props: any) => {
    if (!node) return;

    node.opacity(props.opacity);
    node.rotation(props.rotation);
    // Apply flip by multiplying with scale, assuming scaleX/Y from props is already the desired overall scale
    node.scaleX(props.scaleX * props.flipX);
    node.scaleY(props.scaleY * props.flipY);

    // Apply blur filter
    if (props.blurRadius > 0) {
      node.cache();
      node.filters([window.Konva.Filters.Blur]);
      node.blurRadius(props.blurRadius);
    } else {
      node.clearCache();
      node.filters([]);
    }

    // Apply shadow
    if (props.shadowEnabled) {
      node.shadowColor(props.shadowColor);
      node.shadowBlur(props.shadowBlur);
      node.shadowOffsetX(props.shadowOffsetX);
      node.shadowOffsetY(props.shadowOffsetY);
      node.shadowOpacity(props.shadowOpacity);
      node.shadowEnabled(true);
    } else {
      node.shadowEnabled(false);
    }

    // Apply grayscale/sepia filter
    if (props.filter === 'grayscale') {
      node.cache();
      node.filters([window.Konva.Filters.Grayscale]);
    } else if (props.filter === 'sepia') {
      node.cache();
      node.filters([window.Konva.Filters.Sepia]);
    } else {
      if (props.blurRadius === 0) { // Clear all filters if no blur
        node.clearCache();
        node.filters([]);
      } else { // If blur is active, ensure only blur filter is applied
        if (node.filters().includes(window.Konva.Filters.Blur)) {
            node.filters([window.Konva.Filters.Blur]);
        } else {
            node.filters([]);
        }
      }
    }

    // Redraw the layer to apply changes
    if (node.getLayer()) {
      node.getLayer().batchDraw();
    }
  }, []);

  // Apply properties to the image node when imageElement changes
  useEffect(() => {
    if (imageNodeRef.current && image) { // Ensure image is loaded before applying properties that depend on its dimensions
      applyNodeProps(imageNodeRef.current, {
        opacity: imageElement.opacity,
        rotation: imageElement.rotation,
        scaleX: imageElement.scaleX, // Use directly from state
        scaleY: imageElement.scaleY, // Use directly from state
        blurRadius: imageElement.blurRadius,
        shadowEnabled: imageElement.shadowEnabled,
        shadowColor: imageElement.shadowColor,
        shadowBlur: imageElement.shadowBlur,
        shadowOffsetX: imageElement.shadowOffsetX,
        shadowOffsetY: imageElement.shadowOffsetY,
        shadowOpacity: imageElement.shadowOpacity,
        reflectionEnabled: imageElement.reflectionEnabled,
        flipX: imageElement.flipX,
        flipY: imageElement.flipY,
        filter: imageElement.filter,
      });
    }
  }, [imageElement, applyNodeProps, image]); // Depend on 'image' as well

  return (
    <Image
      image={image}
      x={imageElement.x}
      y={imageElement.y}
      // Use imageElement.width/height if available, otherwise fall back to image.width/height
      // This is crucial for initial rendering before onImageLoaded updates state
      width={imageElement.width || (image ? image.width : 0)}
      height={imageElement.height || (image ? image.height : 0)}
      scaleX={imageElement.scaleX * imageElement.flipX} // Apply flip to scale
      scaleY={imageElement.scaleY * imageElement.flipY} // Apply flip to scale
      rotation={imageElement.rotation}
      offsetX={(imageElement.width || (image ? image.width : 0)) / 2}
      offsetY={(imageElement.height || (image ? image.height : 0)) / 2}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      ref={(node) => {
        imageNodeRef.current = node;
        elementRef(node); // Pass the ref up to the parent
      }}
      opacity={imageElement.opacity}
      filters={imageElement.blurRadius > 0 ? [window.Konva.Filters.Blur] : []}
      blurRadius={imageElement.blurRadius}
      shadowEnabled={imageElement.shadowEnabled}
      shadowColor={imageElement.shadowColor}
      shadowBlur={imageElement.shadowBlur}
      shadowOffsetX={imageElement.shadowOffsetX}
      shadowOffsetY={imageElement.shadowOffsetY}
      shadowOpacity={imageElement.shadowOpacity}
    />
  );
};

export default CanvasImageElement;