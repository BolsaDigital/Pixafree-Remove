// src/components/CanvasEditor.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Image, Rect, Circle, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';

// Import the CanvasImageElement component
import CanvasImageElement from './CanvasImageElement';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  rotation: number;
  fontFamily: string;
  align: 'left' | 'center' | 'right';
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
  textDecoration?: 'none' | 'underline' | 'line-through' | 'bold';
  fontStyle?: 'normal' | 'italic';
  stroke?: string;
  strokeWidth?: number;
}

interface ShapeElement {
  id: string;
  type: 'rect' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  points?: number[];
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
}

interface DateElement {
  id: string;
  text: string;
  format: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  rotation: number;
  fontFamily: string;
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
}

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

interface CanvasEditorProps {
  productImageUrl: string;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  selectedCanvasElement: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null;
  onElementSelect: (element: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null, id?: string) => void;

  // Product image properties
  productX: number;
  productY: number;
  productScale: number;
  productRotation: number;
  productOpacity: number;
  productBlurRadius: number;
  productShadowEnabled: boolean;
  productShadowColor: string;
  productShadowBlur: number;
  productShadowOffsetX: number;
  productShadowOffsetY: number;
  productShadowOpacity: number;
  productReflectionEnabled: boolean;
  productFlipX: number;
  productFlipY: number;
  productFilter: 'none' | 'grayscale' | 'sepia';
  onProductRotate: (rotation: number) => void;
  setProductX: (x: number) => void;
  setProductY: (y: number) => void;
  setProductScale: (scale: number) => void;
  // NEW: Prop para notificar al padre que el producto ha sido escalado/movido manualmente
  setHasProductBeenScaledManually: (value: boolean) => void;


  // Background properties (for fixed preset background)
  backgroundOpacity: number;
  backgroundBlurRadius: number;
  backgroundShadowEnabled: boolean;
  backgroundShadowColor: string;
  backgroundShadowBlur: number;
  backgroundShadowOffsetX: number;
  backgroundShadowOffsetY: number;
  backgroundShadowOpacity: number;
  backgroundReflectionEnabled: boolean;
  backgroundFlipX: number;
  backgroundFlipY: number;
  backgroundFilter: 'none' | 'grayscale' | 'sepia';
  selectedPresetBackgroundUrl?: string;

  // Text elements
  textElements: TextElement[];
  selectedTextElementId: string | null;
  onTextUpdate: (id: string, updates: Partial<TextElement>) => void;

  // Shape elements
  shapeElements: ShapeElement[];
  selectedShapeElementId: string | null;
  onShapeUpdate: (id: string, updates: Partial<ShapeElement>) => void;

  // Date element
  dateElement: DateElement | null;
  selectedDateElementId: string | null;
  onDateUpdate: (updates: Partial<DateElement>) => void;

  // Image elements (user-uploaded / AI-generated)
  imageElements: ImageElement[];
  selectedImageElementId: string | null;
  onImageUpdate: (id: string, updates: Partial<ImageElement>) => void;
  // Modified: onImageLoaded now passes x, y, width, height for initial setup
  onImageAddedAndLoaded: (id: string, initialScaleX: number, initialScaleY: number, x: number, y: number, width: number, height: number) => void;

  onTransformEndCommit: () => void;
  canvasSize: number;
  // Removed onProductImageLoadedAndScaled from props, as it's handled in page.tsx
  // onProductImageLoadedAndScaled: (width: number, height: number) => void;

  zOrderAction: { type: 'up' | 'down' | 'top' | 'bottom', id: string, elementType: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' } | null;
  onZOrderActionComplete: () => void;
  imageToMoveToBottomId: string | null;
  onImageMovedToBottom: (id: string) => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  productImageUrl,
  onCanvasReady,
  selectedCanvasElement,
  onElementSelect,

  productX,
  productY,
  productScale,
  productRotation,
  productOpacity,
  productBlurRadius,
  productShadowEnabled,
  productShadowColor,
  productShadowBlur,
  productShadowOffsetX,
  productShadowOffsetY,
  productShadowOpacity,
  productReflectionEnabled,
  productFlipX,
  productFlipY,
  productFilter,
  onProductRotate,
  setProductX,
  setProductY,
  setProductScale,
  setHasProductBeenScaledManually, // NEW PROP

  backgroundOpacity,
  backgroundBlurRadius,
  backgroundShadowEnabled,
  backgroundShadowColor,
  backgroundShadowBlur,
  backgroundShadowOffsetX,
  backgroundShadowOffsetY,
  backgroundShadowOpacity,
  backgroundReflectionEnabled,
  backgroundFlipX,
  backgroundFlipY,
  backgroundFilter,
  selectedPresetBackgroundUrl,

  textElements,
  selectedTextElementId,
  onTextUpdate,

  shapeElements,
  selectedShapeElementId,
  onShapeUpdate,

  dateElement,
  selectedDateElementId,
  onDateUpdate,

  imageElements,
  selectedImageElementId,
  onImageUpdate,
  onImageAddedAndLoaded,

  onTransformEndCommit,
  canvasSize,
  // Removed from here: onProductImageLoadedAndScaled,

  zOrderAction,
  onZOrderActionComplete,
  imageToMoveToBottomId,
  onImageMovedToBottom,
}) => {
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const productRef = useRef<any>(null);
  const textRefs = useRef<{ [key: string]: any }>({});
  const shapeRefs = useRef<{ [key: string]: any }>({});
  const dateRef = useRef<any>(null);
  const imageRefs = useRef<{ [key: string]: any }>({});

  const [productImage] = useImage(productImageUrl);
  const [backgroundKonvaImage] = useImage(selectedPresetBackgroundUrl || '');

  // Effect to report Konva canvas to parent
  useEffect(() => {
    if (stageRef.current) {
      // Corrected: Access the HTML canvas element directly from the Konva Stage instance
      onCanvasReady(stageRef.current.canvas);
    }
  }, [onCanvasReady]);

  // Removed this useEffect as initial product scaling is now handled in page.tsx
  // useEffect(() => {
  //   if (productImage && productRef.current) {
  //     onProductImageLoadedAndScaled(productImage.width, productImage.height);
  //   }
  // }, [productImage, onProductImageLoadedAndScaled]);


  // Effect to manage Transformer attachment
  useEffect(() => {
    if (trRef.current && stageRef.current) {
      trRef.current.nodes([]); // Clear previous nodes
      let nodesToAttach: any[] = [];

      if (selectedCanvasElement === 'product' && productRef.current) {
        nodesToAttach = [productRef.current];
      } else if (selectedCanvasElement === 'text' && selectedTextElementId && textRefs.current[selectedTextElementId]) {
        nodesToAttach = [textRefs.current[selectedTextElementId]];
      } else if (selectedCanvasElement === 'shape' && selectedShapeElementId && shapeRefs.current[selectedShapeElementId]) {
        nodesToAttach = [shapeRefs.current[selectedShapeElementId]];
      } else if (selectedCanvasElement === 'date' && dateElement && dateRef.current) {
        nodesToAttach = [dateRef.current];
      } else if (selectedCanvasElement === 'image' && selectedImageElementId && imageRefs.current[selectedImageElementId]) {
        nodesToAttach = [imageRefs.current[selectedImageElementId]];
      }

      trRef.current.nodes(nodesToAttach);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedImageElementId, dateElement]);

  // Handle click outside elements to deselect
  const handleStageClick = useCallback((e: any) => {
    // If click on stage itself, deselect everything
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  // Common handler for drag and transform end
  const handleNodeTransformEnd = useCallback((e: KonvaEventObject<Event>, id: string, elementType: 'product' | 'text' | 'shape' | 'date' | 'image') => {
    const node = e.target;
    const currentKonvaScaleX = node.scaleX(); // This includes the flip
    const currentKonvaScaleY = node.scaleY(); // This includes the flip
    const rotation = node.rotation();
    const x = node.x();
    const y = node.y();

    // Reset Konva node's scale to 1 after transformation
    // This is crucial for applying transformations via state and preventing cumulative scaling issues
    node.scaleX(1);
    node.scaleY(1);

    if (elementType === 'product') {
      // Calculate the new base scale magnitude, accounting for flip
      // productScale should always be positive, flipX/Y handle direction
      const newProductScale = Math.abs(currentKonvaScaleX);
      setProductX(x);
      setProductY(y);
      setProductScale(newProductScale); // Update productScale with the new magnitude
      onProductRotate(rotation);
      setHasProductBeenScaledManually(true); // NEW: Mark product as manually scaled/moved
      console.log('Product Transform End - New ProductScale Magnitude:', newProductScale); // Debugging
    } else if (elementType === 'text') {
      const currentText = textElements.find(el => el.id === id);
      if (currentText) {
        onTextUpdate(id, {
          x, y, rotation,
          // Adjust font size based on the magnitude of scaleX from Konva node
          fontSize: currentText.fontSize * Math.abs(currentKonvaScaleX),
        });
      }
    } else if (elementType === 'shape') {
      const originalShape = shapeElements.find(el => el.id === id);
      if (originalShape) {
        const newWidth = originalShape.width ? originalShape.width * Math.abs(currentKonvaScaleX) : undefined;
        const newHeight = originalShape.height ? originalShape.height * Math.abs(currentKonvaScaleY) : undefined;
        const newRadius = originalShape.radius ? originalShape.radius * Math.abs(currentKonvaScaleX) : undefined; // Assuming uniform scaling for radius
        onShapeUpdate(id, {
          x, y, rotation,
          width: newWidth,
          height: newHeight,
          radius: newRadius,
        });
      }
    } else if (elementType === 'date') {
      const originalDate = dateElement;
      if (originalDate) {
        onDateUpdate({
          x, y, rotation,
          fontSize: originalDate.fontSize * Math.abs(currentKonvaScaleX),
        });
      }
    } else if (elementType === 'image') {
      // For image elements, scaleX/Y in state already represent the magnitude
      // and flipX/Y are separate. So we pass the Konva node's scaleX/Y directly.
      // Assuming imageElement.scaleX/Y in state are magnitudes.
      onImageUpdate(id, { x, y, scaleX: currentKonvaScaleX, scaleY: currentKonvaScaleY, rotation });
    }
    node.getLayer().batchDraw();
    onTransformEndCommit(); // Commit after any transformation or drag
  }, [setProductX, setProductY, setProductScale, onProductRotate, setHasProductBeenScaledManually, onTextUpdate, onShapeUpdate, onDateUpdate, onImageUpdate, onTransformEndCommit, textElements, shapeElements, dateElement]);


  // Z-order management
  useEffect(() => {
    if (zOrderAction && stageRef.current) {
      const layer = stageRef.current.getLayers()[0]; // Assuming all movable elements are on the first layer
      let nodeToMove: any = null;

      if (zOrderAction.elementType === 'product' && productRef.current) {
        nodeToMove = productRef.current;
      } else if (zOrderAction.elementType === 'text' && zOrderAction.id && textRefs.current[zOrderAction.id]) {
        nodeToMove = textRefs.current[zOrderAction.id];
      } else if (zOrderAction.elementType === 'shape' && zOrderAction.id && shapeRefs.current[zOrderAction.id]) {
        nodeToMove = shapeRefs.current[zOrderAction.id];
      } else if (zOrderAction.elementType === 'date' && dateRef.current) {
        nodeToMove = dateRef.current;
      } else if (zOrderAction.elementType === 'image' && zOrderAction.id && imageRefs.current[zOrderAction.id]) {
        nodeToMove = imageRefs.current[zOrderAction.id];
      }

      if (nodeToMove) {
        if (zOrderAction.type === 'up') {
          nodeToMove.moveUp();
        } else if (zOrderAction.type === 'down') {
          nodeToMove.moveDown();
        } else if (zOrderAction.type === 'top') {
          nodeToMove.moveToTop();
        } else if (zOrderAction.type === 'bottom') {
          nodeToMove.moveToBottom();
        }
        layer.batchDraw();
        onZOrderActionComplete(); // Notify parent that action is complete
      }
    }
  }, [zOrderAction, onZOrderActionComplete]);

  // Effect to move newly added image to bottom
  useEffect(() => {
    if (imageToMoveToBottomId && imageRefs.current[imageToMoveToBottomId] && stageRef.current) {
      const layer = stageRef.current.getLayers()[0];
      const nodeToMove = imageRefs.current[imageToMoveToBottomId];
      if (nodeToMove) {
        nodeToMove.moveToBottom();
        layer.batchDraw();
        onImageMovedToBottom(imageToMoveToBottomId); // Notify parent that move is complete
      }
    }
  }, [imageToMoveToBottomId, onImageMovedToBottom]);


  // Apply filters and shadow to Konva nodes
  const applyNodeProps = useCallback((node: any, props: any) => {
    if (!node) return;

    node.opacity(props.opacity);
    node.rotation(props.rotation);

    // Apply flip by multiplying with scale
    // Note: For product image, productScale is already applied in JSX,
    // so here we just apply flip. For other elements, scaleX/Y are 1 after transformEnd,
    // so we apply the stored scaleX/Y from props along with flip.
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
      node.shadowEnabled(true); // Ensure shadow is enabled
    } else {
      node.shadowEnabled(false);
    }

    // Apply reflection (conceptual, Konva doesn't have built-in reflection)
    // This would typically involve duplicating the node and flipping it,
    // then applying a gradient mask and opacity. For now, it's a placeholder.
    // We'll just set a flag.
    // node.reflectionEnabled = props.reflectionEnabled; // This is not a Konva property

    // Apply grayscale/sepia filter
    if (props.filter === 'grayscale') {
      node.cache();
      node.filters([window.Konva.Filters.Grayscale]);
    } else if (props.filter === 'sepia') {
      node.cache();
      node.filters([window.Konva.Filters.Sepia]);
    } else {
      // Clear all filters if none is selected, but keep blur if it was applied
      if (props.blurRadius === 0) {
        node.clearCache();
        node.filters([]);
      } else {
        // If blur is applied, ensure it's the only filter or is re-applied
        if (node.filters().includes(window.Konva.Filters.Blur)) {
            node.filters([window.Konva.Filters.Blur]);
        } else {
            node.filters([]); // Clear other filters if blur isn't active
        }
      }
    }

    // Redraw the layer to apply changes
    if (node.getLayer()) {
      node.getLayer().batchDraw();
    }
  }, []);

  // Apply properties to product image
  useEffect(() => {
    if (productRef.current && productImage) {
      applyNodeProps(productRef.current, {
        opacity: productOpacity,
        rotation: productRotation,
        scaleX: productScale, // Use productScale directly here
        scaleY: productScale, // Use productScale directly here
        blurRadius: productBlurRadius,
        shadowEnabled: productShadowEnabled,
        shadowColor: productShadowColor,
        shadowBlur: productShadowBlur,
        shadowOffsetX: productShadowOffsetX,
        shadowOffsetY: productShadowOffsetY,
        shadowOpacity: productShadowOpacity,
        reflectionEnabled: productReflectionEnabled,
        flipX: productFlipX,
        flipY: productFlipY,
        filter: productFilter,
      });
    }
  }, [
    productImage, productRef, applyNodeProps,
    productOpacity, productRotation, productScale, productBlurRadius,
    productShadowEnabled, productShadowColor, productShadowBlur, productShadowOffsetX, productShadowOffsetY, productShadowOpacity,
    productReflectionEnabled, productFlipX, productFlipY, productFilter
  ]);

  // Apply properties to background image (fixed preset background)
  useEffect(() => {
    if (backgroundKonvaImage && stageRef.current) {
      const backgroundRect = stageRef.current.findOne('#fixed-background-rect');
      if (backgroundRect) {
        applyNodeProps(backgroundRect, {
          opacity: backgroundOpacity,
          rotation: 0, // Fixed background does not rotate
          scaleX: 1, // Fixed background does not scale independently
          scaleY: 1, // Fixed background does not scale independently
          blurRadius: backgroundBlurRadius,
          shadowEnabled: backgroundShadowEnabled,
          shadowColor: backgroundShadowColor,
          shadowBlur: backgroundShadowBlur,
          shadowOffsetX: backgroundShadowOffsetX,
          shadowOffsetY: backgroundShadowOffsetY,
          shadowOpacity: backgroundShadowOpacity,
          reflectionEnabled: backgroundReflectionEnabled,
          flipX: backgroundFlipX,
          flipY: backgroundFlipY,
          filter: backgroundFilter,
        });
      }
    }
  }, [
    backgroundKonvaImage, stageRef, applyNodeProps,
    backgroundOpacity, backgroundBlurRadius,
    backgroundShadowEnabled, backgroundShadowColor, backgroundShadowBlur, backgroundShadowOffsetX, backgroundShadowOffsetY, backgroundShadowOpacity,
    backgroundReflectionEnabled, backgroundFlipX, backgroundFlipY, backgroundFilter
  ]);

  return (
    <Stage
      width={canvasSize}
      height={canvasSize}
      ref={stageRef}
      onMouseDown={handleStageClick}
      onTouchStart={handleStageClick}
      className="rounded-lg shadow-lg"
    >
      <Layer>
        {/* Fixed Background (if selected) */}
        {selectedPresetBackgroundUrl && backgroundKonvaImage && (
          <Image
            image={backgroundKonvaImage}
            x={0}
            y={0}
            width={canvasSize}
            height={canvasSize}
            opacity={backgroundOpacity}
            id="fixed-background-rect" // ID for selection
            listening={false} // Make it not selectable/draggable for now
            filters={backgroundBlurRadius > 0 ? [window.Konva.Filters.Blur] : []}
            blurRadius={backgroundBlurRadius}
            shadowEnabled={backgroundShadowEnabled}
            shadowColor={backgroundShadowColor}
            shadowBlur={backgroundShadowBlur}
            shadowOffsetX={backgroundShadowOffsetX}
            shadowOffsetY={backgroundShadowOffsetY}
            shadowOpacity={backgroundShadowOpacity}
            scaleX={backgroundFlipX} // Apply flip
            scaleY={backgroundFlipY} // Apply flip
            offsetX={backgroundFlipX === -1 ? canvasSize : 0} // Adjust offset for flip
            offsetY={backgroundFlipY === -1 ? canvasSize : 0} // Adjust offset for flip
          />
        )}
        {!selectedPresetBackgroundUrl && (
          <Rect
            x={0}
            y={0}
            width={canvasSize}
            height={canvasSize}
            fill="#FFFFFF" // Default white background
            id="fixed-background-rect"
            listening={false}
          />
        )}

        {/* Product Image */}
        {productImage && (
          <Image
            image={productImage}
            x={productX}
            y={productY}
            scaleX={productScale * productFlipX} // Apply flip to scale
            scaleY={productScale * productFlipY} // Apply flip to scale
            rotation={productRotation}
            offsetX={(productImage.width / 2)}
            offsetY={(productImage.height / 2)}
            draggable
            onClick={() => onElementSelect('product')}
            onTap={() => onElementSelect('product')}
            onDragEnd={(e) => handleNodeTransformEnd(e, 'product', 'product')}
            onTransformEnd={(e) => handleNodeTransformEnd(e, 'product', 'product')}
            ref={productRef}
            opacity={productOpacity}
            filters={productBlurRadius > 0 ? [window.Konva.Filters.Blur] : []}
            blurRadius={productBlurRadius}
            shadowEnabled={productShadowEnabled}
            shadowColor={productShadowColor}
            shadowBlur={productShadowBlur}
            shadowOffsetX={productShadowOffsetX}
            shadowOffsetY={productShadowOffsetY}
            shadowOpacity={productShadowOpacity}
            name="product-image" // Add a name for easier identification if needed
          />
        )}

        {/* User-uploaded / AI-generated Image Elements */}
        {imageElements.map((imgEl) => (
          <CanvasImageElement
            key={imgEl.id}
            imageElement={imgEl}
            isSelected={selectedImageElementId === imgEl.id}
            onSelect={() => onElementSelect('image', imgEl.id)}
            onImageLoaded={onImageAddedAndLoaded}
            onTransformEnd={(e) => handleNodeTransformEnd(e, imgEl.id, 'image')}
            onDragEnd={(e) => handleNodeTransformEnd(e, imgEl.id, 'image')}
            elementRef={(node) => { imageRefs.current[imgEl.id] = node; }}
          />
        ))}

        {/* Shape Elements */}
        {shapeElements.map((shapeEl) => {
          const commonProps = {
            key: shapeEl.id,
            x: shapeEl.x,
            y: shapeEl.y,
            rotation: shapeEl.rotation,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            opacity: shapeEl.opacity,
            draggable: true,
            onClick: () => onElementSelect('shape', shapeEl.id),
            onTap: () => onElementSelect('shape', shapeEl.id),
            onDragEnd: (e: any) => handleNodeTransformEnd(e, shapeEl.id, 'shape'),
            onTransformEnd: (e: any) => handleNodeTransformEnd(e, shapeEl.id, 'shape'),
            ref: (node: any) => { shapeRefs.current[shapeEl.id] = node; },
            filters: shapeEl.blurRadius > 0 ? [window.Konva.Filters.Blur] : []
            ,
            blurRadius: shapeEl.blurRadius,
            shadowEnabled: shapeEl.shadowEnabled,
            shadowColor: shapeEl.shadowColor,
            shadowBlur: shapeEl.shadowBlur,
            shadowOffsetX: shapeEl.shadowOffsetX,
            shadowOffsetY: shapeEl.shadowOffsetY,
            shadowOpacity: shapeEl.shadowOpacity,
            scaleX: shapeEl.flipX, // Apply flip
            scaleY: shapeEl.flipY, // Apply flip
            // Adjusted offsetX/offsetY for shapes to handle flipping correctly
            offsetX: shapeEl.flipX === -1 ? (shapeEl.type === 'rect' ? (shapeEl.width || 0) : (shapeEl.radius ? shapeEl.radius * 2 : 0)) : 0,
            offsetY: shapeEl.flipY === -1 ? (shapeEl.type === 'rect' ? (shapeEl.height || 0) : (shapeEl.radius ? shapeEl.radius * 2 : 0)) : 0,
          };

          if (shapeEl.type === 'rect') {
            return <Rect {...commonProps} width={shapeEl.width} height={shapeEl.height} />;
          } else if (shapeEl.type === 'circle') {
            return <Circle {...commonProps} radius={shapeEl.radius} />;
          }
          return null;
        })}

        {/* Text Elements */}
        {textElements.map((textEl) => (
          <Text
            key={textEl.id}
            x={textEl.x}
            y={textEl.y}
            text={textEl.text}
            fontSize={textEl.fontSize}
            fill={textEl.fill}
            rotation={textEl.rotation}
            fontFamily={textEl.fontFamily}
            align={textEl.align}
            verticalAlign="middle"
            wrap="word"
            draggable
            onClick={() => onElementSelect('text', textEl.id)}
            onTap={() => onElementSelect('text', textEl.id)}
            onDragEnd={(e) => handleNodeTransformEnd(e, textEl.id, 'text')}
            onTransformEnd={(e) => handleNodeTransformEnd(e, textEl.id, 'text')}
            ref={(node) => { textRefs.current[textEl.id] = node; }}
            opacity={textEl.opacity}
            filters={textEl.blurRadius > 0 ? [window.Konva.Filters.Blur] : []}
            blurRadius={textEl.blurRadius}
            shadowEnabled={textEl.shadowEnabled}
            shadowColor={textEl.shadowColor}
            shadowBlur={textEl.shadowBlur}
            shadowOffsetX={textEl.shadowOffsetX}
            shadowOffsetY={textEl.shadowOffsetY}
            shadowOpacity={textEl.shadowOpacity}
            scaleX={textEl.flipX} // Apply flip
            scaleY={textEl.flipY} // Apply flip
            offsetX={textEl.flipX === -1 ? textEl.fontSize * textEl.text.length / 2 : 0} // Adjust offset for flip (rough estimate)
            offsetY={textEl.flipY === -1 ? textEl.fontSize / 2 : 0} // Adjust offset for flip (rough estimate)
            fontStyle={textEl.fontStyle}
            textDecoration={textEl.textDecoration}
            stroke={textEl.stroke}
            strokeWidth={textEl.strokeWidth}
          />
        ))}

        {/* Date Element */}
        {dateElement && (
          <Text
            key={dateElement.id}
            x={dateElement.x}
            y={dateElement.y}
            text={dateElement.text}
            fontSize={dateElement.fontSize}
            fill={dateElement.fill}
            rotation={dateElement.rotation}
            fontFamily={dateElement.fontFamily}
            align="center"
            verticalAlign="middle"
            draggable
            onClick={() => onElementSelect('date', dateElement.id)}
            onTap={() => onElementSelect('date', dateElement.id)}
            onDragEnd={(e) => handleNodeTransformEnd(e, dateElement.id, 'date')}
            onTransformEnd={(e) => handleNodeTransformEnd(e, dateElement.id, 'date')}
            ref={dateRef}
            opacity={dateElement.opacity}
            filters={dateElement.blurRadius > 0 ? [window.Konva.Filters.Blur] : []}
            blurRadius={dateElement.blurRadius}
            shadowEnabled={dateElement.shadowEnabled}
            shadowColor={dateElement.shadowColor}
            shadowBlur={dateElement.shadowBlur}
            shadowOffsetX={dateElement.shadowOffsetX}
            shadowOffsetY={dateElement.shadowOffsetY}
            shadowOpacity={dateElement.shadowOpacity}
            scaleX={dateElement.flipX} // Apply flip
            scaleY={dateElement.flipY} // Apply flip
            offsetX={dateElement.flipX === -1 ? dateElement.fontSize * dateElement.text.length / 2 : 0} // Adjust offset for flip (rough estimate)
            offsetY={dateElement.flipY === -1 ? dateElement.fontSize / 2 : 0} // Adjust offset for flip (rough estimate)
          />
        )}

        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit transformer to canvas bounds
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
};

export default CanvasEditor;