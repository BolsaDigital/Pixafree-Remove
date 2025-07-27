// src/app/editor/page.tsx
'use client'; // <--- ¡ESTA LÍNEA DEBE SER LA PRIMERA Y ÚNICA ANTES DE CUALQUIER OTRA COSA!

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Download, Type, Image as ImageIcon, Layout, Circle, Square, Calendar, Trash2, Undo2, Redo2, Sparkles, Plus, Palette, TextCursorInput, PenTool, CreditCard, DollarSign,
  Copy, PaintBucket, BringToFront, SendToBack, ChevronUp, ChevronDown, PlusSquare, RotateCcw, RotateCw, ImageMinus,
  FlipHorizontal, FlipVertical, Droplet, Sun, Contrast, Palette as PaletteIcon, ChevronRight, ChevronLeft, Settings, MoreHorizontal, Ruler
} from 'lucide-react';

// Importa el CollapsibleSection que usa Radix UI y tiene los estilos de Tailwind
import CollapsibleSection from '@/components/CollapsibleSection';

// Firebase imports (kept for general app functionality like history, authentication)
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, Firestore } from 'firebase/firestore';

const DynamicCanvasEditor = dynamic(
  () => import('@/components/CanvasEditor'),
  { ssr: false }
);

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

interface CanvasState {
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

  textElements: TextElement[];
  shapeElements: ShapeElement[];
  dateElement: DateElement | null;
  imageElements: ImageElement[];
}

interface CopiedStyle {
  type: 'text' | 'shape' | 'image' | 'date';
  style: any;
}

// Interfaz para los fondos cargados desde el backend
interface AdminBackground {
  id: string;
  url: string;
  isPremium: boolean;
  // Otros campos que tu API pueda devolver (ej. name, mimeType, etc.)
}

interface DisplayBackground {
  id: string;
  url: string;
  isPremium: boolean;
}

const CANVAS_SIZE = 700;

export default function EditorPage() {
  const searchParams = useSearchParams();

  const initialProductImageUrl = searchParams.get('image_url') || 'https://placehold.co/280x280/99e6ff/000000?text=Click+%27Imagen%27+to+Upload';
  const [productImageUrl, setProductImageUrl] = useState<string>(initialProductImageUrl);

  const [selectedPresetBackgroundUrl, setSelectedPresetBackgroundUrl] = useState<string | undefined>(undefined);

  const [scenePrompt, setScenePrompt] = useState<string>('Un estudio de fotografía minimalista con luz suave');
  const [aiReferenceImageFile, setAiReferenceImageFile] = useState<File | null>(null);
  const [aiReferenceImageUrl, setAiReferenceImageUrl] = useState<string | null>(null);
  const [isGeneratingScene, setIsGeneratingScene] = useState<boolean>(false);

  const [konvaCanvas, setKonvaCanvas] = useState<HTMLCanvasElement | null>(null);

  const [selectedCanvasElement, setSelectedCanvasElement] = useState<'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null>('product');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(null);
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [selectedShapeElementId, setSelectedShapeElementId] = useState<string | null>(null);
  const [dateElement, setDateElement] = useState<DateElement | null>(null);
  const [selectedDateElementId, setSelectedDateElementId] = useState<string | null>(null);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  const [selectedImageElementId, setSelectedImageElementId] = useState<string | null>(null);

  const [productX, setProductX] = useState(CANVAS_SIZE / 2);
  const [productY, setProductY] = useState(CANVAS_SIZE / 2);
  const [productScale, setProductScale] = useState(1);
  const [productRotation, setProductRotation] = useState(0);
  const [productOpacity, setProductOpacity] = useState(1);
  const [productBlurRadius, setProductBlurRadius] = useState(0);
  const [productShadowEnabled, setProductShadowEnabled] = useState(false);
  const [productShadowColor, setProductShadowColor] = useState('#000000');
  const [productShadowBlur, setProductShadowBlur] = useState(0);
  const [productShadowOffsetX, setProductShadowOffsetX] = useState(0);
  const [productShadowOffsetY, setProductShadowOffsetY] = useState(0);
  const [productShadowOpacity, setProductShadowOpacity] = useState(0.5);
  const [productReflectionEnabled, setProductReflectionEnabled] = useState(false);
  const [productFlipX, setProductFlipX] = useState(1);
  const [productFlipY, setProductFlipY] = useState(1);
  const [productFilter, setProductFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');
  const [hasProductBeenScaledManually, setHasProductBeenScaledManually] = useState(false);


  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [backgroundBlurRadius, setBackgroundBlurRadius] = useState(0);
  const [backgroundShadowEnabled, setBackgroundShadowEnabled] = useState(false);
  const [backgroundShadowColor, setBackgroundShadowColor] = useState('#000000');
  const [backgroundShadowBlur, setBackgroundShadowBlur] = useState(0);
  const [backgroundShadowOffsetX, setBackgroundShadowOffsetX] = useState(0);
  const [backgroundShadowOffsetY, setBackgroundShadowOffsetY] = useState(0);
  const [backgroundShadowOpacity, setBackgroundShadowOpacity] = useState(0.5);
  const [backgroundReflectionEnabled, setBackgroundReflectionEnabled] = useState(false);
  const [backgroundFlipX, setBackgroundFlipX] = useState(1);
  const [backgroundFlipY, setBackgroundFlipY] = useState(1);
  const [backgroundFilter, setBackgroundFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');


  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  const [rightSidebarView, setRightSidebarView] = useState<'properties' | 'backgrounds'>('backgrounds');
  const [showMoreToolsDropdown, setShowMoreToolsDropdown] = useState(false);
  const moreToolsRef = useRef<HTMLButtonElement>(null);

  const [showImageUploadTypeModal, setShowImageUploadTypeModal] = useState(false);
  const [tempUploadedFile, setTempUploadedFile] = useState<File | null>(null);


  const [textCreationMode, setTextCreationMode] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<CopiedStyle | null>(null);
  const [zOrderAction, setZOrderAction] = useState<{ type: 'up' | 'down' | 'top' | 'bottom', id: string, elementType: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' } | null>(null);

  const [imageToMoveToBottomId, setImageToMoveToBottomId] = useState<string | null>(null);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTextureOpen, setIsTextureOpen] = useState(false);
  const [isCustomBackgroundUploadOpen, setIsCustomBackgroundUploadOpen] = useState(false);

  const [isGenerateSceneAIOpen, setIsGenerateSceneAIOpen] = useState(true);

  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  // Estado para los fondos subidos por el administrador (ahora se cargarán desde el backend)
  const [adminUploadedBackgrounds, setAdminUploadedBackgrounds] = useState<AdminBackground[]>([]);
  // Eliminamos newPresetIsPremium y isUploadingAdminPreset de aquí, ya que se moverán al admin panel.

  const unifiedImageUploadRef = useRef<HTMLInputElement>(null);
  const uploadCustomBackgroundRef = useRef<HTMLInputElement>(null);
  const aiReferenceImageRef = useRef<HTMLInputElement>(null); // adminUploadPresetRef ya no es necesario aquí

  const [showCenterGuides, setShowCenterGuides] = useState(true);


  const predefinedTextStyles = [
    { name: 'Sustrae', text: 'Sustrae', fontSize: 48, fontFamily: 'Impact', fill: '#FF6347', align: 'center', shadowEnabled: true, shadowColor: '#000000', shadowBlur: 5, shadowOffsetX: 3, shadowOffsetY: 3, shadowOpacity: 0.6 },
    { name: 'Geografias', text: 'Geografias', fontSize: 36, fontFamily: 'Georgia', fill: '#4682B4', align: 'left', blurRadius: 2 },
    { name: 'Costura', text: 'Costura', fontSize: 40, fontFamily: 'Courier New', fill: '#228B22', align: 'right', reflectionEnabled: true },
    { name: 'Consisein', text: 'Consisein', fontSize: 32, fontFamily: 'Verdana', fill: '#8A2BE2', align: 'center', filter: 'grayscale' },
    { name: 'Varios Estilos', text: 'Varios Estilos', fontSize: 28, fontFamily: 'Arial', fill: '#DAA520', align: 'left' },
    { name: 'Tipografía', text: 'Tipografía', fontSize: 50, fontFamily: 'Roboto', fill: '#00CED1', align: 'center' },
    { name: 'Negrita', text: 'Negrita', fontSize: 30, fontFamily: 'Arial', fill: '#000000', align: 'center', textDecoration: 'bold' },
    { name: 'Cursiva', text: 'Cursiva', fontSize: 30, fontFamily: 'Arial', fill: '#000000', align: 'center', fontStyle: 'italic' },
    { name: 'Subrayado', text: 'Subrayado', fontSize: 30, fontFamily: 'Arial', fill: '#000000', align: 'center', textDecoration: 'underline' },
    { name: 'Contorno', text: 'Contorno', fontSize: 30, fontFamily: '#FFFFFF', stroke: '#000000', strokeWidth: 2, align: 'center' },
  ];

  // Mantener los fondos hardcodeados y de APIs externas si aún los quieres
  const hardcodedPresetBackgrounds: DisplayBackground[] = [
    { id: 'hardcoded-1', url: 'https://placehold.co/150x150/AEC6CF/000000', isPremium: false },
    { id: 'hardcoded-2', url: 'https://placehold.co/150x150/FFDAB9/000000', isPremium: false },
    { id: 'hardcoded-3', url: 'https://placehold.co/150x150/B0E0E6/000000', isPremium: false },
    { id: 'hardcoded-4', url: 'https://placehold.co/150x150/DDA0DD/000000', isPremium: true },
    { id: 'hardcoded-5', url: 'https://placehold.co/150x150/98FB98/000000', isPremium: false },
    { id: 'hardcoded-6', url: 'https://placehold.co/150x150/F0E68C/000000', isPremium: true },
  ];

  const pixabaySampleImages: DisplayBackground[] = [
    { id: 'pixabay-1', url: 'https://placehold.co/150x150/ADD8E6/000000', isPremium: false },
    { id: 'pixabay-2', url: 'https://placehold.co/150x150/E0BBE4/000000', isPremium: false },
    { id: 'pixabay-3', url: 'https://placehold.co/150x150/957DAD/000000', isPremium: true },
    { id: 'pixabay-4', url: 'https://placehold.co/150x150/C7CEEA/000000', isPremium: false },
  ];

  const pexelsSampleImages: DisplayBackground[] = [
    { id: 'pexels-1', url: 'https://placehold.co/150x150/FFB6C1/000000', isPremium: false },
    { id: 'pexels-2', url: 'https://placehold.co/150x150/FFD700/000000', isPremium: true },
    { id: 'pexels-3', url: 'https://placehold.co/150x150/ADFF2F/000000', isPremium: false },
    { id: 'pexels-4', url: 'https://placehold.co/150x150/87CEEB/000000', isPremium: false },
  ];

  const [isUserPremium, setIsUserPremium] = useState(false);

  // Initialize Firebase (for auth and history)
  useEffect(() => {
    try {
      const firebaseConfigString = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
      const currentAppId = process.env.NEXT_PUBLIC_APP_ID || 'default-app-id';

      if (!firebaseConfigString) {
        console.error("NEXT_PUBLIC_FIREBASE_CONFIG no está definida. Firebase no se inicializará.");
        return;
      }

      const firebaseConfig = JSON.parse(firebaseConfigString);
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setFirebaseApp(app);
      setDb(firestore);
      setAuth(firebaseAuth);
      setAppId(currentAppId);

      const setupAuth = async () => {
        await signInAnonymously(firebaseAuth);
        setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
      };
      setupAuth();

    } catch (e) {
      console.error("Error al inicializar Firebase:", e);
    }
  }, []);

  // Nuevo useEffect para cargar los fondos personalizados desde el backend
  useEffect(() => {
    const fetchAdminBackgrounds = async () => {
      try {
        // Asumiendo que tu API para obtener medios es /api/media
        // y que puedes filtrar por isCustomBackground=true
        const response = await fetch('/api/media?isCustomBackground=true'); // Ajusta esta URL si tu API es diferente
        if (!response.ok) {
          throw new Error('Failed to fetch admin backgrounds');
        }
        const data = await response.json();
        // Asegúrate de que la respuesta tenga la estructura esperada (docs array)
        if (data && Array.isArray(data.docs)) {
          setAdminUploadedBackgrounds(data.docs.map((media: any) => ({
            id: media.id,
            url: media.url,
            isPremium: media.isPremium,
          })));
        }
      } catch (error) {
        console.error('Error fetching admin backgrounds from your API:', error);
      }
    };

    fetchAdminBackgrounds();
  }, []); // Se ejecuta una vez al montar el componente


  const getCurrentCanvasState = useCallback((): CanvasState => {
    return {
      productX, productY, productScale, productRotation, productOpacity, productBlurRadius,
      productShadowEnabled, productShadowColor, productShadowBlur, productShadowOffsetX, productShadowOffsetY, productShadowOpacity,
      productReflectionEnabled, productFlipX, productFlipY, productFilter,

      backgroundOpacity, backgroundBlurRadius,
      backgroundShadowEnabled, backgroundShadowColor, backgroundShadowBlur, backgroundShadowOffsetX, backgroundShadowOffsetY, backgroundShadowOpacity,
      backgroundReflectionEnabled, backgroundFlipX, backgroundFlipY, backgroundFilter,
      selectedPresetBackgroundUrl,

      textElements: JSON.parse(JSON.stringify(textElements)),
      shapeElements: JSON.parse(JSON.stringify(shapeElements)),
      dateElement: dateElement ? JSON.parse(JSON.stringify(dateElement)) : null,
      imageElements: JSON.parse(JSON.stringify(imageElements)),
    };
  }, [
    productX, productY, productScale, productRotation, productOpacity, productBlurRadius,
    productShadowEnabled, productShadowColor, productShadowBlur, productShadowOffsetX, productShadowOffsetY, productShadowOpacity,
    productReflectionEnabled, productFlipX, productFlipY, productFilter,
    backgroundOpacity, backgroundBlurRadius,
    backgroundShadowEnabled, backgroundShadowColor, backgroundShadowBlur, backgroundShadowOffsetX, backgroundShadowOffsetY, backgroundShadowOpacity,
    backgroundReflectionEnabled, backgroundFlipX, backgroundFlipY, backgroundFilter,
    selectedPresetBackgroundUrl,
    textElements, shapeElements, dateElement, imageElements
  ]);

  const saveCurrentState = useCallback(() => {
    const newState = getCurrentCanvasState();
    setHistory((prevHistory) => {
      if (prevHistory.length > 0 && historyPointer >= 0 && JSON.stringify(prevHistory[historyPointer]) === JSON.stringify(newState)) {
        return prevHistory;
      }

      const newHistory = prevHistory.slice(0, historyPointer + 1);
      const updatedHistory = [...newHistory, newState];

      setHistoryPointer(updatedHistory.length - 1);

      return updatedHistory;
    });
  }, [getCurrentCanvasState, historyPointer]);

  const onTransformEndCommit = useCallback(() => {
    saveCurrentState();
  }, [saveCurrentState]);

  const applyState = useCallback((state: CanvasState) => {
    if (!state) {
      console.error("Attempted to apply an undefined or null state.");
      return;
    }

    setProductX(state.productX);
    setProductY(state.productY);
    setProductScale(state.productScale);
    setProductRotation(state.productRotation);
    setProductOpacity(state.productOpacity);
    setProductBlurRadius(state.productBlurRadius);
    setProductShadowEnabled(state.productShadowEnabled);
    setProductShadowColor(state.productShadowColor);
    setProductShadowBlur(state.productShadowBlur);
    setProductShadowOffsetX(state.productShadowOffsetX);
    setProductShadowOffsetY(state.productShadowOffsetY);
    setProductShadowOpacity(state.productShadowOpacity);
    setProductReflectionEnabled(state.productReflectionEnabled);
    setProductFlipX(state.productFlipX);
    setProductFlipY(state.productFlipY);
    setProductFilter(state.productFilter);

    setBackgroundOpacity(state.backgroundOpacity);
    setBackgroundBlurRadius(state.backgroundBlurRadius);
    setBackgroundShadowEnabled(state.backgroundShadowEnabled);
    setBackgroundShadowColor(state.backgroundShadowColor);
    setBackgroundShadowBlur(state.backgroundShadowBlur);
    setBackgroundShadowOffsetX(state.backgroundShadowOffsetX);
    setBackgroundShadowOffsetY(state.backgroundShadowOffsetY);
    setBackgroundShadowOpacity(state.backgroundShadowOpacity);
    setBackgroundReflectionEnabled(state.backgroundReflectionEnabled);
    setBackgroundFlipX(state.backgroundFlipX);
    setBackgroundFlipY(state.backgroundFlipY);
    setBackgroundFilter(state.backgroundFilter);
    setSelectedPresetBackgroundUrl(state.selectedPresetBackgroundUrl);

    setTextElements(state.textElements);
    setShapeElements(state.shapeElements);
    setDateElement(state.dateElement);
    setImageElements(state.imageElements);

    const currentSelectedId = selectedTextElementId || selectedShapeElementId || selectedDateElementId || selectedImageElementId;
    let newSelectedElement: typeof selectedCanvasElement = 'product';
    let newSelectedId: string | null = null;

    if (selectedCanvasElement === 'background' && state.selectedPresetBackgroundUrl) {
        newSelectedElement = 'background';
    } else if (currentSelectedId) {
        if (state.textElements.some(el => el.id === currentSelectedId)) {
            newSelectedElement = 'text';
            newSelectedId = currentSelectedId;
        } else if (state.shapeElements.some(el => el.id === currentSelectedId)) {
            newSelectedElement = 'shape';
            newSelectedId = currentSelectedId;
        } else if (state.dateElement && state.dateElement.id === currentSelectedId) {
            newSelectedElement = 'date';
            newSelectedId = currentSelectedId;
        } else if (state.imageElements.some(el => el.id === currentSelectedId)) {
            newSelectedElement = 'image';
            newSelectedId = currentSelectedId;
        }
    } else {
        newSelectedElement = 'product';
    }
    setSelectedCanvasElement(newSelectedElement);
    setSelectedTextElementId(newSelectedElement === 'text' ? newSelectedId : null);
    setSelectedShapeElementId(newSelectedElement === 'shape' ? newSelectedId : null);
    setSelectedDateElementId(newSelectedElement === 'date' ? newSelectedId : null);
    setSelectedImageElementId(newSelectedElement === 'image' ? newSelectedId : null);

  }, [selectedTextElementId, selectedShapeElementId, selectedDateElementId, selectedImageElementId, selectedCanvasElement,
      setProductX, setProductY, setProductScale, setProductRotation, setProductOpacity, setProductBlurRadius,
      setProductShadowEnabled, setProductShadowColor, setProductShadowBlur, setProductShadowOffsetX, setProductShadowOffsetY, setProductShadowOpacity,
      setProductReflectionEnabled, setProductFlipX, setProductFlipY, setProductFilter,
      setBackgroundOpacity, setBackgroundBlurRadius,
      setBackgroundShadowEnabled, setBackgroundShadowColor, setBackgroundShadowBlur, setBackgroundShadowOffsetX, setBackgroundShadowOffsetY, setBackgroundShadowOpacity,
      setBackgroundReflectionEnabled, setBackgroundFlipX, setBackgroundFlipY, setBackgroundFilter,
      setSelectedPresetBackgroundUrl,
      setTextElements, setShapeElements, setDateElement, setImageElements
  ]);

  useEffect(() => {
    const imageUrlFromParam = searchParams.get('image_url');
    if (imageUrlFromParam && productImageUrl === 'https://placehold.co/280x280/99e6ff/000000?text=Click+%27Imagen%27+to+Upload') {
      setProductImageUrl(imageUrlFromParam);
      setProductX(CANVAS_SIZE / 2);
      setProductY(CANVAS_SIZE / 2);
      setProductScale(1);
      setProductRotation(0);
      setHasProductBeenScaledManually(false);
      setSelectedCanvasElement('product');
    }
  }, [searchParams, productImageUrl, CANVAS_SIZE]);

  useEffect(() => {
    console.log('Product Image URL Effect Firing:', { productImageUrl, productScale, hasProductBeenScaledManually });
    const img = new window.Image();
    img.src = productImageUrl;
    img.onload = () => {
      if (!hasProductBeenScaledManually && productScale === 1 && !productImageUrl.includes('placehold.co')) {
        const maxDimension = Math.max(img.width, img.height);
        const targetMaxDimension = CANVAS_SIZE * 0.8;
        let newScale = 1;
        if (maxDimension > 0 && maxDimension > targetMaxDimension) {
          newScale = targetMaxDimension / maxDimension;
        }
        console.log('Applying initial product scale:', newScale);
        setProductScale(newScale);
        setProductX(CANVAS_SIZE / 2);
        setProductY(CANVAS_SIZE / 2);
      } else {
        console.log('Skipping initial product scale due to conditions:', { hasProductBeenScaledManually, productScale, isPlaceholder: productImageUrl.includes('placehold.co') });
      }
    };
    img.onerror = () => {
      console.error("Failed to load product image:", productImageUrl);
      setProductImageUrl('https://placehold.co/280x280/ff0000/ffffff?text=Error+Loading');
    };
  }, [productImageUrl, productScale, CANVAS_SIZE, setProductScale, setProductX, setProductY, hasProductBeenScaledManually]);


  useEffect(() => {
    if (konvaCanvas && historyPointer === -1) {
      saveCurrentState();
    }
  }, [konvaCanvas, historyPointer, saveCurrentState]);

  const handleElementSelect = useCallback((element: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null, id?: string) => {
    setSelectedCanvasElement(element);
    setSelectedTextElementId(null);
    setSelectedShapeElementId(null);
    setSelectedDateElementId(null);
    setSelectedImageElementId(null);

    if (element === 'text' && id) {
      setSelectedTextElementId(id);
    } else if (element === 'shape' && id) {
      setSelectedShapeElementId(id);
    } else if (element === 'date' && id) {
      setSelectedDateElementId(id);
    } else if (element === 'image' && id) {
      setSelectedImageElementId(id);
    }
  }, []);

  const handleProductRotate = useCallback((rotation: number) => {
    setProductRotation(rotation);
  }, []);

  const handleUpdateTextElement = useCallback((id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((textEl) => (textEl.id === id ? { ...textEl, ...updates } : textEl))
    );
  }, []);

  const handleUpdateShapeElement = useCallback((id: string, updates: Partial<ShapeElement>) => {
    setShapeElements((prev) =>
      prev.map((shapeEl) => (shapeEl.id === id ? { ...shapeEl, ...updates } : shapeEl))
    );
  }, []);

  const handleUpdateDateElement = useCallback((updates: Partial<DateElement>) => {
    setDateElement((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const handleUpdateImageElement = useCallback((id: string, updates: Partial<ImageElement>) => {
    setImageElements((prev) =>
      prev.map((imgEl) => (imgEl.id === id ? { ...imgEl, ...updates } : imgEl))
    );
  }, []);

  const handleImageAddedAndLoaded = useCallback((
    id: string,
    initialScaleX: number,
    initialScaleY: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    setImageElements((prev) => {
      const existingImage = prev.find(img => img.id === id);
      if (!existingImage ||
          existingImage.scaleX !== initialScaleX ||
          existingImage.scaleY !== initialScaleY ||
          existingImage.x !== x ||
          existingImage.y !== y ||
          existingImage.width === undefined || existingImage.height === undefined
      ) {
        return prev.map((imgEl) =>
          imgEl.id === id
            ? {
                ...imgEl,
                x: x,
                y: y,
                scaleX: initialScaleX,
                scaleY: initialScaleY,
                width: width,
                height: height,
              }
            : imgEl
        );
      }
      return prev;
    });
    onTransformEndCommit();
  }, [onTransformEndCommit]);


  const onImageMovedToBottom = useCallback((id: string) => {
    if (id === imageToMoveToBottomId) {
      setImageToMoveToBottomId(null);
    }
  }, [imageToMoveToBottomId]);


  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      applyState(history[newPointer]);
    }
  }, [history, historyPointer, applyState]);

  const handleRedo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      applyState(history[newPointer]);
    }
  }, [history, historyPointer, applyState]);

  const handleAddText = (style?: Partial<TextElement>) => {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: 'Tu Texto Aquí',
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      fontSize: 30,
      fill: '#000000',
      rotation: 0,
      fontFamily: 'Arial',
      align: 'center',
      opacity: 1,
      blurRadius: 0,
      shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      reflectionEnabled: false,
      flipX: 1, flipY: 1,
      filter: 'none',
      ...style,
    };
    setTextElements((prev) => [...prev, newText]);
    handleElementSelect('text', newText.id);
    onTransformEndCommit();
    setTextCreationMode(false);
    setRightSidebarView('properties');
  };


  const handleDeleteText = useCallback(() => {
    if (selectedCanvasElement === 'text' && selectedTextElementId) {
      setTextElements((prev) => prev.filter((textEl) => textEl.id !== selectedTextElementId));
      setSelectedTextElementId(null);
      setSelectedCanvasElement('product');
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, selectedTextElementId, onTransformEndCommit]);

  const currentTextElement = textElements.find(el => el.id === selectedTextElementId);

  const handleAddShape = (type: 'rect' | 'circle') => {
    const newShape: ShapeElement = {
      id: `shape-${Date.now()}`,
      type,
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      fill: '#FFD700',
      stroke: '#DAA520',
      strokeWidth: 2,
      rotation: 0,
      opacity: 1,
      blurRadius: 0,
      shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      reflectionEnabled: false,
      flipX: 1, flipY: 1,
      filter: 'none',
    };
    if (type === 'rect') {
      newShape.width = 100;
      newShape.height = 100;
    } else if (type === 'circle') {
      newShape.radius = 50;
    }
    setShapeElements((prev) => [...prev, newShape]);
    handleElementSelect('shape', newShape.id);
    onTransformEndCommit();
    setRightSidebarView('properties');
  };


  const handleDeleteShape = useCallback(() => {
    if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      setShapeElements((prev) => prev.filter((shapeEl) => shapeEl.id !== selectedShapeElementId));
      setSelectedShapeElementId(null);
      setSelectedCanvasElement('product');
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, selectedShapeElementId, onTransformEndCommit]);

  const currentShapeElement = shapeElements.find(el => el.id === selectedShapeElementId);

  const formatDate = (date: Date, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {};
    switch (format) {
      case 'DD/MM/YYYY':
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
      case 'MMMM DD, YYYY':
        options.month = 'long';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
      case 'YYYY-MM-DD':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        break;
      case 'DD MMMM YYYY':
        options.day = 'numeric';
        options.month = 'long';
        options.year = 'numeric';
        break;
      default:
        options.day = '2-digit';
        options.month = '2-digit';
        options.year = 'numeric';
        break;
    }
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  };

  const handleAddDate = () => {
    const today = new Date();
    const defaultFormat = 'DD/MM/YYYY';
    const newDate: DateElement = {
      id: `date-${Date.now()}`,
      text: formatDate(today, defaultFormat),
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2 + 50,
      fontSize: 24,
      fill: '#333333',
      rotation: 0,
      fontFamily: 'Arial',
      opacity: 1,
      blurRadius: 0,
      shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      reflectionEnabled: false,
      flipX: 1, flipY: 1,
      filter: 'none',
      format: defaultFormat,
    };
    setDateElement(newDate);
    handleElementSelect('date', newDate.id);
    onTransformEndCommit();
    setRightSidebarView('properties');
  };


  const handleDeleteDate = useCallback(() => {
    if (selectedCanvasElement === 'date' && dateElement) {
      setDateElement(null);
      setSelectedDateElementId(null);
      setSelectedCanvasElement('product');
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, dateElement, onTransformEndCommit]);

  const currentDateElement = dateElement;


  const handleUnifiedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setTempUploadedFile(event.target.files[0]);
      setShowImageUploadTypeModal(true);
      event.target.value = ''; // Clear the input so same file can be selected again
    }
  };

  const handleSetAsProduct = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    setProductImageUrl(newImageUrl);

    // Reset product transformations when a new product image is set
    setProductX(CANVAS_SIZE / 2);
    setProductY(CANVAS_SIZE / 2);
    setProductScale(1);
    setProductRotation(0);
    setProductOpacity(1);
    setProductBlurRadius(0);
    setProductShadowEnabled(false); setProductShadowColor('#000000'); setProductShadowBlur(0); setProductShadowOffsetX(0); setProductShadowOffsetY(0); setProductShadowOpacity(0.5);
    setProductReflectionEnabled(false);
    setProductFlipX(1); setProductFlipY(1);
    setProductFilter('none');
    setHasProductBeenScaledManually(false); // Reset this flag
    console.log('handleSetAsProduct: Resetting product state and manual flag to false.');
    handleElementSelect('product'); // Select the product element
    setShowImageUploadTypeModal(false); // Close the modal
    setTempUploadedFile(null); // Clear the temporary file
  };

  const handleAddImageAsElement = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    const newImageId = `image-${Date.now()}`;
    const newImage: ImageElement = {
      id: newImageId,
      url: newImageUrl,
      x: 0, // Initial position will be set by CanvasImageElement
      y: 0, // Initial position will be set by CanvasImageElement
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      blurRadius: 0,
      shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      reflectionEnabled: false,
      flipX: 1, flipY: 1,
      filter: 'none',
      width: undefined, // Will be set by CanvasImageElement after load
      height: undefined, // Will be set by CanvasImageElement after load
    };
    setImageElements((prev) => [...prev, newImage]);
    handleElementSelect('image', newImage.id); // Select the newly added image
    setRightSidebarView('properties'); // Switch to properties view
    setShowImageUploadTypeModal(false); // Close the modal
    setTempUploadedFile(null); // Clear the temporary file
  };


  const handleDeleteImage = useCallback(() => {
    if (selectedCanvasElement === 'image' && selectedImageElementId) {
      setImageElements((prev) => prev.filter((imgEl) => imgEl.id !== selectedImageElementId));
      setSelectedImageElementId(null);
      setSelectedCanvasElement('product'); // Default to product after deleting an image element
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, selectedImageElementId, onTransformEndCommit]);

  const currentImageElement = imageElements.find(el => el.id === selectedImageElementId);

  // New handler for "Cargar Imagen de Fondo"
  const handleCustomBackgroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newImageUrl = URL.createObjectURL(file);
      const newImageId = `image-${Date.now()}`;
      const newImage: ImageElement = {
        id: newImageId,
        url: newImageUrl,
        x: 0, // Initial position will be set by CanvasImageElement
        y: 0, // Initial position will be set by CanvasImageElement
        scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, blurRadius: 0, shadowEnabled: false, reflectionEnabled: false, flipX: 1, flipY: 1, filter: 'none',
        shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
        width: undefined, height: undefined,
      };
      setImageElements((prev) => [...prev, newImage]);
      handleElementSelect('image', newImage.id); // Select the newly added image
      setImageToMoveToBottomId(newImage.id); // Request to move this new image to bottom
      event.target.value = ''; // Clear the input so same file can be selected again
    }
  };

  const handleSelectPresetBackground = (background: DisplayBackground) => {
    if (background.isPremium && !isUserPremium) {
      alert('Este fondo es premium. Por favor, actualiza tu plan para usarlo.');
      return;
    }
    setSelectedPresetBackgroundUrl(background.url);
    // Reset background properties when a new preset is selected
    setBackgroundOpacity(1);
    setBackgroundBlurRadius(0);
    setBackgroundShadowEnabled(false); setBackgroundShadowColor('#000000'); setBackgroundShadowBlur(0); setBackgroundShadowOffsetX(0); setBackgroundShadowOffsetY(0); setBackgroundShadowOpacity(0.5);
    setBackgroundReflectionEnabled(false);
    setBackgroundFlipX(1); setBackgroundFlipY(1);
    setBackgroundFilter('none');
    onTransformEndCommit(); // Save state after changing background
    setSelectedCanvasElement('background'); // Select the background
  };

  const processImageWithReplicate = async () => {
    if (!productImageUrl || productImageUrl.includes('placeholder.com') || productImageUrl.includes('placehold.co')) {
      alert('Por favor, selecciona primero una imagen de producto para simular el procesamiento.');
      return;
    }
    alert('Esta función de "Editar recorte" es una simulación para demostrar una posible integración con IA. Para una funcionalidad real, necesitarías un servicio de procesamiento de imágenes (como Replicate AI) o implementar una herramienta de recorte directamente en el lienzo.');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProductImageUrl('https://via.placeholder.com/280/aaddcc/000000?text=PROCESSED+PRODUCT');
    onTransformEndCommit();
    setShowMoreToolsDropdown(false);
  };

  const handleAiReferenceImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAiReferenceImageFile(file);
      setAiReferenceImageUrl(URL.createObjectURL(file));
    } else {
      setAiReferenceImageFile(null);
      setAiReferenceImageUrl(null);
    }
  };

  const handleGenerateSceneWithAI = async () => {
    if (!scenePrompt && !aiReferenceImageFile) {
      alert('Por favor, ingresa una descripción para la escena o sube una imagen de referencia.');
      return;
    }

    setIsGeneratingScene(true);
    // Add a loading image to the canvas immediately
    const loadingImageId = `image-${Date.now()}`;
    const loadingImage: ImageElement = {
      id: loadingImageId,
      url: `https://placehold.co/200x200/eeeeee/333333?text=Generando...`,
      x: 0, // Will be centered by CanvasImageElement after load
      y: 0, // Will be centered by CanvasImageElement after load
      scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, blurRadius: 0, shadowEnabled: false, reflectionEnabled: false, flipX: 1, flipY: 1, filter: 'none',
      shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      width: undefined, height: undefined,
    };
    setImageElements((prev) => [...prev, loadingImage]);
    handleElementSelect('image', loadingImage.id); // Select the loading image
    setImageToMoveToBottomId(loadingImage.id); // Request to move this new image to bottom

    let finalPrompt = scenePrompt;
    const apiKey = ""; // API key will be provided by Canvas runtime

    try {
      if (aiReferenceImageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(aiReferenceImageFile);
        await new Promise((resolve) => {
          reader.onloadend = resolve;
        });

        if (reader.result === null || typeof reader.result !== 'string') {
          console.error("FileReader.result es null o no es una cadena.");
          alert('Error al leer la imagen de referencia. Intenta con otra imagen.');
          setIsGeneratingScene(false);
          setImageElements((prev) => prev.filter(img => img.id !== loadingImageId)); // Elimina la imagen de carga
          return;
        }
        const base64ImageData = reader.result.split(',')[1];

        // Call Gemini to describe the reference image
        const geminiPayload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: "Describe this image in detail, focusing on its main subject, colors, and overall style, to be used as context for generating a new scene." },
                {
                  inlineData: {
                    mimeType: aiReferenceImageFile.type,
                    data: base64ImageData
                  }
                }
              ]
            }
          ],
        };

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload)
        });
        const geminiResult = await geminiResponse.json();

        if (geminiResult.candidates && geminiResult.candidates.length > 0 && geminiResult.candidates[0].content && geminiResult.candidates[0].content.parts && geminiResult.candidates[0].content.parts.length > 0) {
          const descriptionFromAI = geminiResult.candidates[0].content.parts[0].text;
          finalPrompt = `${scenePrompt}. La escena debe incorporar elementos sugeridos por la siguiente descripción de imagen: ${descriptionFromAI}`;
        } else {
          console.warn('No se pudo obtener la descripción de Gemini, se procederá solo con el prompt de texto.');
        }
      }

      // Call Imagen to generate the scene
      const imagenPayload = {
        instances: { prompt: finalPrompt },
        parameters: { "sampleCount": 1 }
      };

      const imagenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      const imagenResponse = await fetch(imagenApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagenPayload)
      });
      const imagenResult = await imagenResponse.json();

      if (imagenResult.predictions && imagenResult.predictions.length > 0 && imagenResult.predictions[0].bytesBase64Encoded) {
        const imageUrl = `data:image/png;base64,${imagenResult.predictions[0].bytesBase64Encoded}`;
        setImageElements((prev) => prev.map(img =>
          img.id === loadingImageId ? { ...img, url: imageUrl, x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, scaleX: 1, scaleY: 1 } : img
        ));
        onTransformEndCommit(); // Save state after AI image is loaded
      } else {
        alert('No se pudo generar la escena. Intenta con otra descripción.');
        console.error('Error de respuesta de la API de Imagen:', imagenResult);
        // Update loading image to error state
        setImageElements((prev) => prev.map(img =>
          img.id === loadingImageId ? { ...img, url: `https://placehold.co/200x200/ff0000/ffffff?text=Error+AI`, x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, scaleX: 1, scaleY: 1 } : img
        ));
      }

    } catch (error) {
      console.error('Error al llamar a la API de IA:', error);
      alert('Ocurrió un error al generar la escena con IA. Por favor, inténtalo de nuevo más tarde.');
      // Update loading image to error state
      setImageElements((prev) => prev.map(img =>
        img.id === loadingImageId ? { ...img, url: `https://placehold.co/200x200/ff0000/ffffff?text=Error+AI`, x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, scaleX: 1, scaleY: 1 } : img
      ));
    } finally {
      setIsGeneratingScene(false);
    }
  };


  const handleDownloadNoBackground = () => {
    if (productImageUrl && !(productImageUrl.includes('placeholder.com') || productImageUrl.includes('placehold.co'))) {
      const link = document.createElement('a');
      link.href = productImageUrl;
      link.download = 'pixafree_product_no_background.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('No hay imagen de producto real sin fondo disponible para descargar. Sube una imagen o usa un enlace.');
    }
  };

  const handleDownloadTemplate = () => {
    if (konvaCanvas) {
      try {
        const link = document.createElement('a');
        link.href = konvaCanvas.toDataURL('image/png', 1.0);
        link.download = `pixafree_image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Imagen con tu producto descargada exitosamente!');
      } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Ocurrió un error al descargar la imagen. Por favor, verifica la consola del navegador para más detalles.');
      }
    } else {
      alert('El editor no está listo para descargar. Asegúrate de que la imagen se haya cargado y el canvas esté renderizado.');
    }
  };

  const handleDeleteElement = useCallback(() => {
    const currentSelectedElement = selectedCanvasElement;
    const currentSelectedId = selectedTextElementId || selectedShapeElementId || selectedDateElementId || selectedImageElementId;

    // Deselect element immediately
    handleElementSelect(null);

    // Perform deletion based on selected type
    if (currentSelectedElement === 'text' && currentSelectedId) {
      setTextElements((prev) => prev.filter((textEl) => textEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'shape' && currentSelectedId) {
      setShapeElements((prev) => prev.filter((shapeEl) => shapeEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'date' && currentSelectedId) {
      setDateElement(null); // Date element is unique, so set to null
    } else if (currentSelectedElement === 'image' && currentSelectedId) {
      setImageElements((prev) => prev.filter((imgEl) => imgEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'product') {
      // Reset product image and its properties to default placeholder
      setProductImageUrl('https://placehold.co/280x280/99e6ff/000000?text=Click+%27Imagen%27+to+Upload');
      setProductX(CANVAS_SIZE / 2);
      setProductY(CANVAS_SIZE / 2);
      setProductScale(1);
      setProductRotation(0);
      setProductOpacity(1);
      setProductBlurRadius(0);
      setProductShadowEnabled(false); setProductShadowColor('#000000'); setProductShadowBlur(0); setProductShadowOffsetX(0); setProductShadowOffsetY(0); setProductShadowOpacity(0.5);
      setProductReflectionEnabled(false);
      setProductFlipX(1); setProductFlipY(1);
      setProductFilter('none');
      setHasProductBeenScaledManually(false); // Reset this flag as product is reset
      console.log('handleDeleteElement: Deleting product, resetting manual flag to false.');
    } else if (currentSelectedElement === 'background') {
      // Clear the selected preset background and reset its properties
      setSelectedPresetBackgroundUrl(undefined);
      setBackgroundOpacity(1);
      setBackgroundBlurRadius(0);
      setBackgroundShadowEnabled(false); setBackgroundShadowColor('#000000'); setBackgroundShadowBlur(0); setBackgroundShadowOffsetX(0); setBackgroundShadowOffsetY(0); setBackgroundShadowOpacity(0.5);
      setBackgroundReflectionEnabled(false);
      setBackgroundFlipX(1); setBackgroundFlipY(1);
      setBackgroundFilter('none');
    }
    onTransformEndCommit(); // Save state after deletion
  }, [
    selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedDateElementId, selectedImageElementId,
    setTextElements, setShapeElements, setDateElement, setImageElements,
    setProductImageUrl, setProductX, setProductY, setProductScale, setProductRotation, setProductOpacity, setProductBlurRadius,
    setProductShadowEnabled, setProductShadowColor, setProductShadowBlur, setProductShadowOffsetX, setProductShadowOffsetY, setProductShadowOpacity,
    setProductReflectionEnabled, setProductFlipX, productFlipY, setProductFilter, setHasProductBeenScaledManually,
    setSelectedPresetBackgroundUrl,
    setBackgroundOpacity, setBackgroundBlurRadius,
    setBackgroundShadowEnabled, setBackgroundShadowColor, setBackgroundShadowBlur, setBackgroundShadowOffsetX, setBackgroundShadowOffsetY, setBackgroundShadowOpacity,
    setBackgroundReflectionEnabled, setBackgroundFlipX, setBackgroundFlipY, setBackgroundFilter,
    onTransformEndCommit,
    CANVAS_SIZE,
    handleElementSelect
  ]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if the event target is an input field or textarea to prevent deleting content while typing
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
      return; // Do not delete if typing in an input field
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      handleDeleteElement();
    }
  }, [handleDeleteElement]);

  // Add event listener for keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleDuplicateElement = useCallback(() => {
    if (selectedCanvasElement === 'text' && selectedTextElementId) {
      const originalText = textElements.find(el => el.id === selectedTextElementId);
      if (originalText) {
        const newText: TextElement = {
          ...originalText,
          id: `text-${Date.now()}`, // Generate a new unique ID
          x: originalText.x + 20, // Offset for visibility
          y: originalText.y + 20,
        };
        setTextElements((prev) => [...prev, newText]);
        handleElementSelect('text', newText.id); // Select the new duplicated element
        onTransformEndCommit();
      }
    } else if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      const originalShape = shapeElements.find(el => el.id === selectedShapeElementId);
      if (originalShape) {
        const newShape: ShapeElement = {
          ...originalShape,
          id: `shape-${Date.now()}`, // Generate a new unique ID
          x: originalShape.x + 20, // Offset for visibility
          y: originalShape.y + 20,
        };
        setShapeElements((prev) => [...prev, newShape]);
        handleElementSelect('shape', newShape.id); // Select the new duplicated element
        onTransformEndCommit();
      }
    } else if (selectedCanvasElement === 'date' && dateElement) {
      // Date element is unique, so duplicating it means creating a new one
      const newDate: DateElement = {
        ...dateElement,
        id: `date-${Date.now()}`,
        x: dateElement.x + 20,
        y: dateElement.y + 20,
      };
      setDateElement(newDate);
      handleElementSelect('date', newDate.id);
      onTransformEndCommit();
    } else if (selectedCanvasElement === 'image' && selectedImageElementId) {
      const originalImage = imageElements.find(el => el.id === selectedImageElementId);
      if (originalImage) {
        const newImage: ImageElement = {
          ...originalImage,
          id: `image-${Date.now()}`, // Generate a new unique ID
          x: originalImage.x + 20, // Offset for visibility
          y: originalImage.y + 20,
        };
        setImageElements((prev) => [...prev, newImage]);
        handleElementSelect('image', newImage.id); // Select the new duplicated element
        onTransformEndCommit();
      }
    } else {
      alert('Selecciona un elemento (texto, figura, fecha o imagen) para duplicar.');
    }
    setShowMoreToolsDropdown(false); // Close dropdown after action
  }, [selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedImageElementId, dateElement, textElements, shapeElements, imageElements, handleElementSelect, onTransformEndCommit]);

  const handleCopyStyle = useCallback(() => {
    if (selectedCanvasElement === 'text' && selectedTextElementId) {
      const text = textElements.find(el => el.id === selectedTextElementId);
      if (text) {
        setCopiedStyle({
          type: 'text',
          style: {
            fontSize: text.fontSize, fill: text.fill, fontFamily: text.fontFamily, align: text.align, opacity: text.opacity,
            blurRadius: text.blurRadius,
            shadowEnabled: text.shadowEnabled, shadowColor: text.shadowColor, shadowBlur: text.shadowBlur, shadowOffsetX: text.shadowOffsetX, shadowOffsetY: text.shadowOffsetY, shadowOpacity: text.shadowOpacity,
            reflectionEnabled: text.reflectionEnabled,
            filter: text.filter,
            textDecoration: text.textDecoration, fontStyle: text.fontStyle, stroke: text.stroke, strokeWidth: text.strokeWidth,
          }
        });
        alert('Estilo de texto copiado.');
      }
    } else if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      const shape = shapeElements.find(el => el.id === selectedShapeElementId);
      if (shape) {
        setCopiedStyle({
          type: 'shape',
          style: {
            fill: shape.fill, stroke: shape.stroke, strokeWidth: shape.strokeWidth, opacity: shape.opacity,
            blurRadius: shape.blurRadius,
            shadowEnabled: shape.shadowEnabled, shadowColor: shape.shadowColor, shadowBlur: shape.shadowBlur, shadowOffsetX: shape.shadowOffsetX, shadowOffsetY: shape.shadowOffsetY, shadowOpacity: shape.shadowOpacity,
            reflectionEnabled: shape.reflectionEnabled,
            filter: shape.filter,
          }
        });
        alert('Estilo de figura copiado.');
      }
    } else if (selectedCanvasElement === 'image' && selectedImageElementId) {
      const image = imageElements.find(el => el.id === selectedImageElementId);
      if (image) {
        setCopiedStyle({
          type: 'image',
          style: {
            opacity: image.opacity,
            blurRadius: image.blurRadius,
            shadowEnabled: image.shadowEnabled, shadowColor: image.shadowColor, shadowBlur: image.shadowBlur, shadowOffsetX: image.shadowOffsetX, shadowOffsetY: image.shadowOffsetY, shadowOpacity: image.shadowOpacity,
            reflectionEnabled: image.reflectionEnabled,
            filter: image.filter,
          }
        });
        alert('Estilo de imagen copiado.');
      }
    } else if (selectedCanvasElement === 'date' && dateElement) {
      setCopiedStyle({
        type: 'date',
        style: {
          fontSize: dateElement.fontSize, fill: dateElement.fill, fontFamily: dateElement.fontFamily, opacity: dateElement.opacity,
          blurRadius: dateElement.blurRadius,
          shadowEnabled: dateElement.shadowEnabled, shadowColor: dateElement.shadowColor, shadowBlur: dateElement.shadowBlur, shadowOffsetX: dateElement.shadowOffsetX, shadowOffsetY: dateElement.shadowOffsetY, shadowOpacity: dateElement.shadowOpacity,
          reflectionEnabled: dateElement.reflectionEnabled,
          filter: dateElement.filter,
        }
      });
      alert('Estilo de fecha copiado.');
    } else {
      alert('Selecciona un elemento (texto, figura, imagen o fecha) para copiar su estilo.');
    }
    setShowMoreToolsDropdown(false); // Close dropdown after action
  }, [selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedImageElementId, dateElement, textElements, shapeElements, imageElements]);

  const handlePasteStyle = useCallback(() => {
    if (!copiedStyle) {
      alert('Primero copia un estilo de un elemento.');
      return;
    }

    // Apply copied style based on the type of the selected element and copied style
    if (selectedCanvasElement === 'text' && selectedTextElementId && copiedStyle.type === 'text') {
      handleUpdateTextElement(selectedTextElementId, copiedStyle.style);
      onTransformEndCommit();
      alert('Estilo pegado al texto.');
    } else if (selectedCanvasElement === 'shape' && selectedShapeElementId && copiedStyle.type === 'shape') {
      handleUpdateShapeElement(selectedShapeElementId, copiedStyle.style);
      onTransformEndCommit();
      alert('Estilo pegado a la figura.');
    } else if (selectedCanvasElement === 'image' && selectedImageElementId && copiedStyle.type === 'image') {
      handleUpdateImageElement(selectedImageElementId, copiedStyle.style);
      onTransformEndCommit();
      alert('Estilo pegado a la imagen.');
    } else if (selectedCanvasElement === 'date' && dateElement && copiedStyle.type === 'date') {
      handleUpdateDateElement(copiedStyle.style);
      onTransformEndCommit();
      alert('Estilo pegado a la fecha.');
    }
    else {
      alert('El estilo copiado no es compatible con el elemento seleccionado.');
    }
    setShowMoreToolsDropdown(false); // Close dropdown after action
  }, [copiedStyle, selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedImageElementId, dateElement, handleUpdateTextElement, handleUpdateShapeElement, handleUpdateImageElement, handleUpdateDateElement, onTransformEndCommit]);


  const handleZOrder = useCallback((action: 'up' | 'down' | 'top' | 'bottom') => {
    let idToMove: string | null = null;
    let elementTypeToMove: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null = null;

    if (selectedCanvasElement === 'product') {
      idToMove = 'product';
      elementTypeToMove = 'product';
    } else if (selectedCanvasElement === 'background') {
      // Fixed background cannot be reordered, only image elements can
      alert('El fondo preestablecido no se puede reordenar. Solo los elementos de imagen cargados o generados por IA pueden ser reordenados.');
      return;
    } else if (selectedCanvasElement === 'text' && selectedTextElementId) {
      idToMove = selectedTextElementId;
      elementTypeToMove = 'text';
    } else if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      idToMove = selectedShapeElementId;
      elementTypeToMove = 'shape';
    } else if (selectedCanvasElement === 'date' && selectedDateElementId) {
      idToMove = selectedDateElementId;
      elementTypeToMove = 'date';
    } else if (selectedCanvasElement === 'image' && selectedImageElementId) {
      idToMove = selectedImageElementId;
      elementTypeToMove = 'image';
    }

    if (idToMove && elementTypeToMove) {
      setZOrderAction({ type: action, id: idToMove, elementType: elementTypeToMove });
    } else {
      alert('Selecciona un elemento para cambiar su orden de capa.');
    }
    setShowMoreToolsDropdown(false); // Close dropdown after action
  }, [selectedCanvasElement, selectedTextElementId, selectedShapeElementId, selectedDateElementId, selectedImageElementId]);

  const onZOrderActionComplete = useCallback(() => {
    setZOrderAction(null); // Clear the action after it's processed by CanvasEditor
    saveCurrentState(); // Save state after Z-order change
  }, [saveCurrentState]);

  const handleFlip = useCallback((axis: 'x' | 'y') => {
    if (selectedCanvasElement === 'product') {
      setProductFlipX((prev) => (axis === 'x' ? prev * -1 : prev));
      setProductFlipY((prev) => (axis === 'y' ? prev * -1 : prev));
    } else if (selectedCanvasElement === 'background') {
      // Background flip applies to the fixed background
      setBackgroundFlipX((prev) => (axis === 'x' ? prev * -1 : prev));
      setBackgroundFlipY((prev) => (axis === 'y' ? prev * -1 : prev));
    } else if (selectedCanvasElement === 'text' && currentTextElement) {
      handleUpdateTextElement(currentTextElement.id, { flipX: axis === 'x' ? currentTextElement.flipX * -1 : currentTextElement.flipX, flipY: axis === 'y' ? currentTextElement.flipY * -1 : currentTextElement.flipY });
    } else if (selectedCanvasElement === 'shape' && currentShapeElement) {
      handleUpdateShapeElement(currentShapeElement.id, { flipX: axis === 'x' ? currentShapeElement.flipX * -1 : currentShapeElement.flipX, flipY: axis === 'y' ? currentShapeElement.flipY * -1 : currentShapeElement.flipY });
    } else if (selectedCanvasElement === 'date' && currentDateElement) {
      handleUpdateDateElement({ flipX: axis === 'x' ? currentDateElement.flipX * -1 : currentDateElement.flipX, flipY: axis === 'y' ? currentDateElement.flipY * -1 : currentDateElement.flipY });
    } else if (selectedCanvasElement === 'image' && currentImageElement) {
      handleUpdateImageElement(currentImageElement.id, { flipX: axis === 'x' ? currentImageElement.flipX * -1 : currentImageElement.flipX, flipY: axis === 'y' ? currentImageElement.flipY * -1 : currentImageElement.flipY });
    }
    onTransformEndCommit(); // Save state after flip
  }, [selectedCanvasElement, currentTextElement, currentShapeElement, currentDateElement, currentImageElement, handleUpdateTextElement, handleUpdateShapeElement, handleUpdateDateElement, handleUpdateImageElement, onTransformEndCommit]);

  const handleApplyFilter = useCallback((filterType: 'none' | 'grayscale' | 'sepia') => {
    if (selectedCanvasElement === 'product') {
      setProductFilter(filterType);
    } else if (selectedCanvasElement === 'background') {
      setBackgroundFilter(filterType);
    } else if (selectedCanvasElement === 'text' && currentTextElement) {
      handleUpdateTextElement(currentTextElement.id, { filter: filterType });
    } else if (selectedCanvasElement === 'shape' && currentShapeElement) {
      handleUpdateShapeElement(currentShapeElement.id, { filter: filterType });
    } else if (selectedCanvasElement === 'date' && currentDateElement) {
      handleUpdateDateElement({ filter: filterType });
    } else if (selectedCanvasElement === 'image' && currentImageElement) {
      handleUpdateImageElement(currentImageElement.id, { filter: filterType });
    }
    onTransformEndCommit(); // Save state after filter change
  }, [selectedCanvasElement, currentTextElement, currentShapeElement, currentDateElement, currentImageElement, handleUpdateTextElement, handleUpdateShapeElement, handleUpdateDateElement, handleUpdateImageElement, onTransformEndCommit]);

  const handleToggleShadow = useCallback(() => {
    if (selectedCanvasElement === 'product') {
      setProductShadowEnabled((prev) => !prev);
    } else if (selectedCanvasElement === 'background') {
      setBackgroundShadowEnabled((prev) => !prev);
    } else if (selectedCanvasElement === 'text' && currentTextElement) {
      handleUpdateTextElement(currentTextElement.id, { shadowEnabled: !currentTextElement.shadowEnabled });
    } else if (selectedCanvasElement === 'shape' && currentShapeElement) {
      handleUpdateShapeElement(currentShapeElement.id, { shadowEnabled: !currentShapeElement.shadowEnabled });
    } else if (selectedCanvasElement === 'date' && currentDateElement) {
      handleUpdateDateElement({ shadowEnabled: !currentDateElement.shadowEnabled });
    } else if (selectedCanvasElement === 'image' && currentImageElement) {
      handleUpdateImageElement(currentImageElement.id, { shadowEnabled: !currentImageElement.shadowEnabled });
    }
    onTransformEndCommit(); // Save state after shadow toggle
  }, [selectedCanvasElement, currentTextElement, currentShapeElement, currentDateElement, currentImageElement, handleUpdateTextElement, handleUpdateShapeElement, handleUpdateDateElement, handleUpdateImageElement, onTransformEndCommit]);

  const handleToggleReflection = useCallback(() => {
    if (selectedCanvasElement === 'product') {
      setProductReflectionEnabled((prev) => !prev);
    } else if (selectedCanvasElement === 'background') {
      setBackgroundReflectionEnabled((prev) => !prev);
    } else if (selectedCanvasElement === 'text' && currentTextElement) {
      handleUpdateTextElement(currentTextElement.id, { reflectionEnabled: !currentTextElement.reflectionEnabled });
    } else if (selectedCanvasElement === 'shape' && currentShapeElement) {
      handleUpdateShapeElement(currentShapeElement.id, { reflectionEnabled: !currentShapeElement.reflectionEnabled });
    } else if (selectedCanvasElement === 'date' && currentDateElement) {
      handleUpdateDateElement({ reflectionEnabled: !currentDateElement.reflectionEnabled });
    } else if (selectedCanvasElement === 'image' && currentImageElement) {
      handleUpdateImageElement(currentImageElement.id, { reflectionEnabled: !currentImageElement.reflectionEnabled });
    }
    onTransformEndCommit(); // Save state after reflection toggle
  }, [selectedCanvasElement, currentTextElement, currentShapeElement, currentDateElement, currentImageElement, handleUpdateTextElement, handleUpdateShapeElement, handleUpdateDateElement, handleUpdateImageElement, onTransformEndCommit]);


  const isProductSelected = selectedCanvasElement === 'product';
  const isTextSelected = selectedCanvasElement === 'text' && selectedTextElementId !== null;
  const isShapeSelected = selectedCanvasElement === 'shape' && selectedShapeElementId !== null;
  const isDateSelected = selectedCanvasElement === 'date' && selectedDateElementId !== null;
  const isImageSelected = selectedCanvasElement === 'image' && selectedImageElementId !== null;
  const isAnyEditableElementSelected = isProductSelected || isTextSelected || isShapeSelected || isDateSelected || isImageSelected;


  let currentElementProps: any = {};
  if (isProductSelected) {
    currentElementProps = {
      opacity: productOpacity, blurRadius: productBlurRadius,
      shadowEnabled: productShadowEnabled, shadowColor: productShadowColor, shadowBlur: productShadowBlur, shadowOffsetX: productShadowOffsetX, shadowOffsetY: productShadowOffsetY, shadowOpacity: productShadowOpacity,
      reflectionEnabled: productReflectionEnabled,
      filter: productFilter,
      setOpacity: setProductOpacity, setBlurRadius: setProductBlurRadius,
      setShadowEnabled: setProductShadowEnabled, setShadowColor: setProductShadowColor, setShadowBlur: setProductShadowBlur, setShadowOffsetX: setProductShadowOffsetX, setShadowOffsetY: setProductShadowOffsetY, setShadowOpacity: setProductShadowOpacity,
      setReflectionEnabled: setProductReflectionEnabled,
      setFilter: setProductFilter,
    };
  } else if (selectedCanvasElement === 'background') {
    currentElementProps = {
      opacity: backgroundOpacity, blurRadius: backgroundBlurRadius,
      shadowEnabled: backgroundShadowEnabled, shadowColor: backgroundShadowColor, shadowBlur: backgroundShadowBlur, shadowOffsetX: backgroundShadowOffsetX, shadowOffsetY: backgroundShadowOffsetY, shadowOpacity: backgroundShadowOpacity,
      reflectionEnabled: backgroundReflectionEnabled,
      filter: backgroundFilter,
      setOpacity: setBackgroundOpacity, setBlurRadius: setBackgroundBlurRadius,
      setShadowEnabled: setBackgroundShadowEnabled, setShadowColor: setBackgroundShadowColor, setShadowBlur: setBackgroundShadowBlur,
      setShadowOffsetX: setBackgroundShadowOffsetX, setShadowOffsetY: setBackgroundShadowOffsetY, setShadowOpacity: setBackgroundShadowOpacity,
      setReflectionEnabled: setBackgroundReflectionEnabled,
      setFilter: setBackgroundFilter,
    };
  } else if (isTextSelected && currentTextElement) {
    currentElementProps = {
      opacity: currentTextElement.opacity, blurRadius: currentTextElement.blurRadius,
      shadowEnabled: currentTextElement.shadowEnabled, shadowColor: currentTextElement.shadowColor, shadowBlur: currentTextElement.shadowBlur, shadowOffsetX: currentTextElement.shadowOffsetX, shadowOffsetY: currentTextElement.shadowOffsetY, shadowOpacity: currentTextElement.shadowOpacity,
      reflectionEnabled: currentTextElement.reflectionEnabled,
      filter: currentTextElement.filter,
      setOpacity: (val: number) => handleUpdateTextElement(selectedTextElementId!, { opacity: val }),
      setBlurRadius: (val: number) => handleUpdateTextElement(selectedTextElementId!, { blurRadius: val }),
      setShadowEnabled: (val: boolean) => handleUpdateTextElement(selectedTextElementId!, { shadowEnabled: val }),
      setShadowColor: (val: string) => handleUpdateTextElement(selectedTextElementId!, { shadowColor: val }),
      setShadowBlur: (val: number) => handleUpdateTextElement(selectedTextElementId!, { shadowBlur: val }),
      setShadowOffsetX: (val: number) => handleUpdateTextElement(selectedTextElementId!, { shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateTextElement(selectedTextElementId!, { shadowOffsetY: val }),
      setShadowOpacity: (val: number) => handleUpdateTextElement(selectedTextElementId!, { shadowOpacity: val }),
      setReflectionEnabled: (val: boolean) => handleUpdateTextElement(selectedTextElementId!, { reflectionEnabled: val }),
      setFilter: (val: 'none' | 'grayscale' | 'sepia') => handleUpdateTextElement(selectedTextElementId!, { filter: val }),
    };
  } else if (isShapeSelected && currentShapeElement) {
    currentElementProps = {
      opacity: currentShapeElement.opacity, blurRadius: currentShapeElement.blurRadius,
      shadowEnabled: currentShapeElement.shadowEnabled, shadowColor: currentShapeElement.shadowColor, shadowBlur: currentShapeElement.shadowBlur, shadowOffsetX: currentShapeElement.shadowOffsetX, shadowOffsetY: currentShapeElement.shadowOffsetY, shadowOpacity: currentShapeElement.shadowOpacity,
      reflectionEnabled: currentShapeElement.reflectionEnabled,
      filter: currentShapeElement.filter,
      setOpacity: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { opacity: val }),
      setBlurRadius: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { blurRadius: val }),
      setShadowEnabled: (val: boolean) => handleUpdateShapeElement(selectedShapeElementId!, { shadowEnabled: val }),
      setShadowColor: (val: string) => handleUpdateShapeElement(selectedShapeElementId!, { shadowColor: val }),
      setShadowBlur: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { shadowBlur: val }),
      setShadowOffsetX: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { shadowOffsetY: val }),
      setShadowOpacity: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { shadowOpacity: val }),
      setReflectionEnabled: (val: boolean) => handleUpdateShapeElement(selectedShapeElementId!, { reflectionEnabled: val }),
      setFilter: (val: 'none' | 'grayscale' | 'sepia') => handleUpdateShapeElement(selectedShapeElementId!, { filter: val }),
    };
  } else if (isDateSelected && currentDateElement) {
    currentElementProps = {
      opacity: currentDateElement.opacity, blurRadius: currentDateElement.blurRadius,
      shadowEnabled: currentDateElement.shadowEnabled, shadowColor: currentDateElement.shadowColor, shadowBlur: currentDateElement.shadowBlur, shadowOffsetX: currentDateElement.shadowOffsetX, shadowOffsetY: currentDateElement.shadowOffsetY, shadowOpacity: currentDateElement.shadowOpacity,
      reflectionEnabled: currentDateElement.reflectionEnabled,
      filter: currentDateElement.filter,
      setOpacity: (val: number) => handleUpdateDateElement({ opacity: val }),
      setBlurRadius: (val: number) => handleUpdateDateElement({ blurRadius: val }),
      setShadowEnabled: (val: boolean) => handleUpdateDateElement({ shadowEnabled: val }),
      setShadowColor: (val: string) => handleUpdateDateElement({ shadowColor: val }),
      setShadowBlur: (val: number) => handleUpdateDateElement({ shadowBlur: val }),
      setShadowOffsetX: (val: number) => handleUpdateDateElement({ shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateDateElement({ shadowOffsetY: val }),
      setShadowOpacity: (val: number) => handleUpdateDateElement({ shadowOpacity: val }),
      setReflectionEnabled: (val: boolean) => handleUpdateDateElement({ reflectionEnabled: val }),
      setFilter: (val: 'none' | 'grayscale' | 'sepia') => handleUpdateDateElement({ filter: val }),
    };
  } else if (isImageSelected && currentImageElement) {
    currentElementProps = {
      opacity: currentImageElement.opacity, blurRadius: currentImageElement.blurRadius,
      shadowEnabled: currentImageElement.shadowEnabled, shadowColor: currentImageElement.shadowColor, shadowBlur: currentImageElement.shadowBlur, shadowOffsetX: currentImageElement.shadowOffsetX, shadowOffsetY: currentImageElement.shadowOffsetY, shadowOpacity: currentImageElement.shadowOpacity,
      reflectionEnabled: currentImageElement.reflectionEnabled,
      filter: currentImageElement.filter,
      setOpacity: (val: number) => handleUpdateImageElement(selectedImageElementId!, { opacity: val }),
      setBlurRadius: (val: number) => handleUpdateImageElement(selectedImageElementId!, { blurRadius: val }),
      setShadowEnabled: (val: boolean) => handleUpdateImageElement(selectedImageElementId!, { shadowEnabled: val }),
      setShadowColor: (val: string) => handleUpdateImageElement(selectedImageElementId!, { shadowColor: val }),
      setShadowBlur: (val: number) => handleUpdateImageElement(selectedImageElementId!, { blurRadius: val }),
      setShadowOffsetX: (val: number) => handleUpdateImageElement(selectedImageElementId!, { shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateImageElement(selectedImageElementId!, { shadowOffsetY: val }),
      setShadowOpacity: (val: number) => handleUpdateImageElement(selectedImageElementId!, { shadowOpacity: val }),
      setReflectionEnabled: (val: boolean) => handleUpdateImageElement(selectedImageElementId!, { reflectionEnabled: val }),
      setFilter: (val: 'none' | 'grayscale' | 'sepia') => handleUpdateImageElement(selectedImageElementId!, { filter: val }),
    };
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setShowMoreToolsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Eliminamos handleAdminUploadPreset y handleDeleteAdminPreset de aquí
  // ya que la administración se moverá al panel de administración.

  const allPresetBackgrounds: DisplayBackground[] = [
    ...hardcodedPresetBackgrounds,
    ...adminUploadedBackgrounds, // Ahora contendrá los fondos cargados desde el backend
    ...pixabaySampleImages,
    ...pexelsSampleImages,
  ];

  const handleGetProClick = () => {
    alert(
      `¡Obtén Pixafree PRO!\n\n` +
      `Desbloquea todos los fondos premium y funciones avanzadas con una suscripción.\n\n` +
      `Para suscribirte, haz clic en "Suscribirse con PayPal" a continuación.\n\n` +
      `Es crucial entender: La integración de PayPal es una SIMULACIÓN. Para una integración real y segura de pagos con PayPal, necesitarías una lógica de backend robusta que maneje la creación y captura de órdenes de pago, la gestión de suscripciones y la seguridad de las claves API.`
    );
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginRight: '1rem' }}>📸 Pixafree</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              style={{ padding: '0.5rem', borderRadius: '9999px', transition: 'all 0.2s', backgroundColor: historyPointer <= 0 ? '#e5e7eb' : '#e0f2fe', color: historyPointer <= 0 ? '#6b7280' : '#1d4ed8', cursor: historyPointer <= 0 ? 'not-allowed' : 'pointer' }}
              title="Deshacer"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= history.length - 1}
              style={{ padding: '0.5rem', borderRadius: '9999px', transition: 'all 0.2s', backgroundColor: historyPointer >= history.length - 1 ? '#e5e7eb' : '#e0f2fe', color: historyPointer >= history.length - 1 ? '#6b7280' : '#1d4ed8', cursor: historyPointer >= history.length - 1 ? 'not-allowed' : 'pointer' }}
              title="Rehacer"
            >
              <Redo2 size={20} />
            </button>
          </div>
        </div>

        {/* Main Tools */}
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={() => unifiedImageUploadRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', transition: 'color 0.2s' }} title="Subir Imagen">
            <input type="file" accept="image/*" onChange={handleUnifiedImageUpload} style={{ display: 'none' }} ref={unifiedImageUploadRef} />
            <ImageIcon size={24} />
            <span style={{ fontSize: '0.75rem' }}>Imagen</span>
          </button>
          <button onClick={() => { setRightSidebarView('backgrounds'); setIsGenerateSceneAIOpen(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: rightSidebarView === 'backgrounds' ? '#2563eb' : '#4b5563', fontWeight: rightSidebarView === 'backgrounds' ? 'semibold' : 'normal', transition: 'color 0.2s' }} title="Fondos">
            <PaletteIcon size={24} />
            <span style={{ fontSize: '0.75rem' }}>Fondos</span>
          </button>
          <button onClick={() => handleAddText()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', transition: 'color 0.2s' }} title="Añadir Texto">
            <TextCursorInput size={24} />
            <span style={{ fontSize: '0.75rem' }}>Texto</span>
          </button>
          <button onClick={() => handleAddShape('rect')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', transition: 'color 0.2s' }} title="Añadir Forma">
            <PenTool size={24} />
            <span style={{ fontSize: '0.75rem' }}>Forma</span>
          </button>
          <button
            onClick={processImageWithReplicate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', opacity: !isProductSelected ? 0.5 : 1, cursor: !isProductSelected ? 'not-allowed' : 'pointer', transition: 'color 0.2s' }}
            title="Editar Recorte (Simulado)"
            disabled={!isProductSelected}
          >
            <ImageMinus size={24} />
            <span style={{ fontSize: '0.75rem' }}>Recorte</span>
          </button>
          <button
            onClick={handleDeleteElement}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', opacity: (!isAnyEditableElementSelected && selectedCanvasElement !== 'background') ? 0.5 : 1, cursor: (!isAnyEditableElementSelected && selectedCanvasElement !== 'background') ? 'not-allowed' : 'pointer', transition: 'color 0.2s' }}
            title="Borrar Elemento Seleccionado"
            disabled={!isAnyEditableElementSelected && selectedCanvasElement !== 'background'}
          >
            <Trash2 size={24} />
            <span style={{ fontSize: '0.75rem' }}>Borrar</span>
          </button>
          <button
            onClick={handleDuplicateElement}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', opacity: !isAnyEditableElementSelected ? 0.5 : 1, cursor: !isAnyEditableElementSelected ? 'not-allowed' : 'pointer', transition: 'color 0.2s' }}
            disabled={!isAnyEditableElementSelected}
            title="Duplicar Elemento Seleccionado"
          >
            <PlusSquare size={24} />
            <span style={{ fontSize: '0.75rem' }}>Duplicar</span>
          </button>
          <button onClick={() => setRightSidebarView('properties')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: rightSidebarView === 'properties' ? '#2563eb' : '#4b5563', fontWeight: rightSidebarView === 'properties' ? 'semibold' : 'normal', transition: 'color 0.2s' }} title="Propiedades del Objeto Seleccionado">
            <Settings size={24} />
            <span style={{ fontSize: '0.75rem' }}>Propiedades</span>
          </button>
          <button
            onClick={() => setShowCenterGuides((prev) => !prev)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: showCenterGuides ? '#2563eb' : '#4b5563', fontWeight: showCenterGuides ? 'semibold' : 'normal', transition: 'color 0.2s' }}
            title="Alternar Guías Centrales"
          >
            <Ruler size={24} />
            <span style={{ fontSize: '0.75rem' }}>Guías</span>
          </button>
          <div style={{ position: 'relative' }}>
            <button ref={moreToolsRef} onClick={() => setShowMoreToolsDropdown(!showMoreToolsDropdown)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#4b5563', transition: 'color 0.2s' }} title="Más Herramientas">
              <MoreHorizontal size={24} />
              <span style={{ fontSize: '0.75rem' }}>Más</span>
            </button>
            {showMoreToolsDropdown && (
              <div style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', right: 0, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 20, padding: '0.5rem 0', width: '12rem', fontSize: '0.875rem' }}>
                <button
                  onClick={() => { alert('Funcionalidad "Compartir" (no implementada)'); setShowMoreToolsDropdown(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Compartir
                </button>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.25rem 0' }}></div>
                <button
                  onClick={handleCopyStyle}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: !isAnyEditableElementSelected ? 'not-allowed' : 'pointer', opacity: !isAnyEditableElementSelected ? 0.5 : 1 }}
                  disabled={!isAnyEditableElementSelected}
                >
                  <Copy size={16} /> Copiar Estilo
                </button>
                <button
                  onClick={handlePasteStyle}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: (!copiedStyle || !isAnyEditableElementSelected) ? 'not-allowed' : 'pointer', opacity: (!copiedStyle || !isAnyEditableElementSelected) ? 0.5 : 1 }}
                  disabled={!copiedStyle || !isAnyEditableElementSelected}
                >
                  <PaintBucket size={16} /> Pegar Estilo
                </button>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.25rem 0' }}></div>
                <span style={{ display: 'block', padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 'semibold', textTransform: 'uppercase' }}>Orden de Capas</span>
                <button
                  onClick={() => handleZOrder('up')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 'not-allowed' : 'pointer', opacity: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 0.5 : 1 }}
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <ChevronUp size={16} /> Adelante
                </button>
                <button
                  onClick={() => handleZOrder('down')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 'not-allowed' : 'pointer', opacity: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 0.5 : 1 }}
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <ChevronDown size={16} /> Atrás
                </button>
                <button
                  onClick={() => handleZOrder('top')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 'not-allowed' : 'pointer', opacity: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 0.5 : 1 }}
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <BringToFront size={16} /> Al Frente
                </button>
                <button
                  onClick={() => handleZOrder('bottom')}
                  style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: 'none', cursor: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 'not-allowed' : 'pointer', opacity: (selectedCanvasElement === 'background' || !isAnyEditableElementSelected) ? 0.5 : 1 }}
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <SendToBack size={16} /> Al Fondo
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          style={{ backgroundColor: '#3b82f6', color: '#ffffff', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', transition: 'background-color 0.3s' }}
          title="Descargar Imagen Final"
        >
          <Download size={18} style={{ marginRight: '0.5rem' }} /> Descargar
        </button>
      </header>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
          <DynamicCanvasEditor
            productImageUrl={productImageUrl}
            onCanvasReady={setKonvaCanvas}
            selectedCanvasElement={selectedCanvasElement}
            onElementSelect={handleElementSelect}

            productX={productX}
            productY={productY}
            productScale={productScale}
            productRotation={productRotation}
            productOpacity={productOpacity}
            productBlurRadius={productBlurRadius}
            productShadowEnabled={productShadowEnabled}
            productShadowColor={productShadowColor}
            productShadowBlur={productShadowBlur}
            productShadowOffsetX={productShadowOffsetX}
            productShadowOffsetY={productShadowOffsetY}
            productShadowOpacity={productShadowOpacity}
            productReflectionEnabled={productReflectionEnabled}
            productFlipX={productFlipX}
            productFlipY={productFlipY}
            productFilter={productFilter}
            onProductRotate={handleProductRotate}
            setProductX={setProductX}
            setProductY={setProductY}
            setProductScale={setProductScale}
            setHasProductBeenScaledManually={setHasProductBeenScaledManually}

            backgroundOpacity={backgroundOpacity}
            backgroundBlurRadius={backgroundBlurRadius}
            backgroundShadowEnabled={backgroundShadowEnabled}
            backgroundShadowColor={backgroundShadowColor}
            backgroundShadowBlur={backgroundShadowBlur}
            backgroundShadowOffsetX={backgroundShadowOffsetX}
            backgroundShadowOffsetY={backgroundShadowOffsetY}
            backgroundShadowOpacity={backgroundShadowOpacity}
            backgroundReflectionEnabled={backgroundReflectionEnabled}
            backgroundFlipX={backgroundFlipX}
            backgroundFlipY={backgroundFlipY}
            backgroundFilter={backgroundFilter}
            selectedPresetBackgroundUrl={selectedPresetBackgroundUrl}

            textElements={textElements}
            selectedTextElementId={selectedTextElementId}
            onTextUpdate={handleUpdateTextElement}

            shapeElements={shapeElements}
            selectedShapeElementId={selectedShapeElementId}
            onShapeUpdate={handleUpdateShapeElement}

            dateElement={dateElement}
            selectedDateElementId={selectedDateElementId}
            onDateUpdate={handleUpdateDateElement}

            imageElements={imageElements}
            selectedImageElementId={selectedImageElementId}
            onImageUpdate={handleUpdateImageElement}
            onImageAddedAndLoaded={handleImageAddedAndLoaded}

            onTransformEndCommit={onTransformEndCommit}
            canvasSize={CANVAS_SIZE}

            zOrderAction={zOrderAction}
            onZOrderActionComplete={onZOrderActionComplete}
            imageToMoveToBottomId={imageToMoveToBottomId}
            onImageMovedToBottom={onImageMovedToBottom}
            showCenterGuides={showCenterGuides}
          />
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '20rem', backgroundColor: '#ffffff', padding: '1rem', overflowY: 'auto', boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.05)' }}>
          {rightSidebarView === 'backgrounds' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>Opciones de Fondo</h2>

              <CollapsibleSection
                title="Generar Escena con IA"
                isOpen={isGenerateSceneAIOpen}
                setIsOpen={setIsGenerateSceneAIOpen}
                icon={Sparkles}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Describe la escena que quieres generar para tu producto.</p>
                  <textarea
                    value={scenePrompt}
                    onChange={(e) => setScenePrompt(e.target.value)}
                    placeholder="Ej: Un estudio de fotografía minimalista con luz suave"
                    rows={3}
                    style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                  />
                  <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Opcional: Sube una imagen de referencia para que la IA la use como contexto.</p>
                  <label htmlFor="aiReferenceImageUpload" style={{ cursor: 'pointer', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'semibold', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center', display: 'block' }}>
                    {aiReferenceImageFile ? 'Cambiar Imagen de Referencia' : 'Subir Imagen de Referencia'}
                  </label>
                  <input
                    id="aiReferenceImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAiReferenceImageChange}
                    style={{ display: 'none' }}
                    ref={aiReferenceImageRef}
                  />
                  {aiReferenceImageUrl && (
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Imagen de referencia:</p>
                      <img src={aiReferenceImageUrl} alt="AI Reference" style={{ maxWidth: '100%', height: '6rem', objectFit: 'contain', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} />
                      <button
                        onClick={() => { setAiReferenceImageFile(null); setAiReferenceImageUrl(null); if (aiReferenceImageRef.current) aiReferenceImageRef.current.value = ''; }}
                        style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.75rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        Eliminar Imagen de Referencia
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleGenerateSceneWithAI}
                    disabled={isGeneratingScene || (!scenePrompt && !aiReferenceImageFile)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.5rem 1rem', borderRadius: '0.375rem', color: '#ffffff', fontWeight: 'semibold', backgroundColor: (isGeneratingScene || (!scenePrompt && !aiReferenceImageFile)) ? '#93c5fd' : '#3b82f6', cursor: (isGeneratingScene || (!scenePrompt && !aiReferenceImageFile)) ? 'not-allowed' : 'pointer' }}
                  >
                    {isGeneratingScene ? (
                      <>
                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', marginRight: '0.5rem' }}></span>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} style={{ marginRight: '0.5rem' }} /> Generar Escena
                      </>
                    )}
                  </button>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Cargar Imagen de Fondo" isOpen={isCustomBackgroundUploadOpen} setIsOpen={setIsCustomBackgroundUploadOpen} icon={ImageIcon}>
                <label htmlFor="uploadCustomBackground" style={{ cursor: 'pointer', backgroundColor: '#f3f4f6', color: '#4b5563', fontWeight: 'semibold', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center', display: 'block' }}>
                  Seleccionar Archivo
                </label>
                <input
                  id="uploadCustomBackground"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomBackgroundFileChange}
                  style={{ display: 'none' }}
                  ref={uploadCustomBackgroundRef}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  La imagen cargada se añadirá como un elemento editable en el lienzo.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Fondos Preestablecidos" isOpen={true} setIsOpen={() => {}} icon={Layout}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: '15rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {allPresetBackgrounds.map((bg) => (
                    // Renderiza solo si no es premium O si el usuario es premium
                    (!bg.isPremium || isUserPremium) && (
                      <div
                        key={bg.id}
                        style={{ position: 'relative', width: '100%', height: '6rem', borderRadius: '0.375rem', overflow: 'hidden', cursor: 'pointer', border: `1px solid ${bg.isPremium && !isUserPremium ? '#f59e0b' : '#e5e7eb'}`, opacity: bg.isPremium && !isUserPremium ? 0.6 : 1, transition: 'all 0.2s' }}
                        onClick={() => handleSelectPresetBackground(bg)}
                      >
                        <img src={bg.url} alt={`Fondo ${bg.id}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {bg.isPremium && (
                          <span style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', backgroundColor: '#f59e0b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                            Premium
                          </span>
                        )}
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}>
                          <Plus size={24} style={{ color: '#ffffff', opacity: 0, transition: 'opacity 0.2s' }} />
                        </div>
                      </div>
                    )
                  ))}
                  {/* Mensaje si no hay fondos disponibles (ej. si todos son premium y el usuario no lo es) */}
                  {allPresetBackgrounds.filter(bg => !bg.isPremium || isUserPremium).length === 0 && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', gridColumn: 'span 2', textAlign: 'center' }}>
                      No hay fondos preestablecidos disponibles.
                    </p>
                  )}
                </div>
                {/* Botón "Get Pro" si hay fondos premium y el usuario no lo es */}
                {allPresetBackgrounds.some(bg => bg.isPremium) && !isUserPremium && (
                  <button
                    onClick={handleGetProClick}
                    style={{ marginTop: '1rem', width: '100%', padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#f59e0b', color: '#ffffff', fontWeight: 'semibold', border: 'none', cursor: 'pointer' }}
                  >
                    Obtener PRO para desbloquear fondos premium
                  </button>
                )}
              </CollapsibleSection>

              {/* Eliminamos la sección de Administrar Fondos Personalizados de aquí */}
              {/* <CollapsibleSection title="Administrar Fondos Personalizados (Integrar con tu API)" isOpen={true} setIsOpen={() => {}} icon={ImageIcon}>
                ... (contenido eliminado) ...
              </CollapsibleSection> */}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151' }}>Propiedades del Objeto</h2>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#fffbeb', borderRadius: '0.375rem', border: '1px solid #fcd34d' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'semibold', color: '#b45309' }}>Simular Usuario Premium:</span>
                <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    value=""
                    style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                    checked={isUserPremium}
                    onChange={(e) => setIsUserPremium(e.target.checked)}
                  />
                  <div style={{ width: '2.75rem', height: '1.5rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                  <div style={{ content: '""', position: 'absolute', top: '2px', left: '2px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '9999px', height: '1.25rem', width: '1.25rem', transition: 'transform 0.2s' }}></div>
                </label>
              </div>

              {!selectedCanvasElement && (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  Haz clic en un elemento en el lienzo para editar sus propiedades.
                </div>
              )}

              {isProductSelected && (
                <CollapsibleSection title="Propiedades del Producto" isOpen={true} setIsOpen={() => {}} icon={ImageIcon}>
                  <div>
                    <label htmlFor="productOpacity" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Opacidad: {(productOpacity * 100).toFixed(0)}%</label>
                    <input
                      id="productOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={productOpacity}
                      onChange={(e) => { setProductOpacity(Number(e.target.value)); onTransformEndCommit(); }}
                      style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </CollapsibleSection>
              )}

              {selectedCanvasElement === 'background' && (
                <CollapsibleSection title="Propiedades del Fondo" isOpen={true} setIsOpen={() => {}} icon={Layout}>
                  <div>
                    <label htmlFor="backgroundOpacity" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Opacidad: {(backgroundOpacity * 100).toFixed(0)}%</label>
                    <input
                      id="backgroundOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={backgroundOpacity}
                      onChange={(e) => { setBackgroundOpacity(Number(e.target.value)); onTransformEndCommit(); }}
                      style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </CollapsibleSection>
              )}

              {isTextSelected && currentTextElement && (
                <CollapsibleSection title="Propiedades del Texto" isOpen={true} setIsOpen={() => {}} icon={TextCursorInput}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="textContent" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Contenido del Texto</label>
                      <textarea
                        id="textContent"
                        value={currentTextElement.text}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { text: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label htmlFor="fontSize" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Tamaño de Fuente: {currentTextElement.fontSize.toFixed(0)}</label>
                      <input
                        id="fontSize"
                        type="range"
                        min="10"
                        max="100"
                        value={currentTextElement.fontSize}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fontSize: Number(e.target.value) })}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="textColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Texto</label>
                      <input
                        id="textColor"
                        type="color"
                        value={currentTextElement.fill}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fill: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="fontFamily" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Familia de Fuente</label>
                      <select
                        id="fontFamily"
                        value={currentTextElement.fontFamily}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fontFamily: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="monospace">Monospace</option>
                        <option value="Impact">Impact</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Bebas Neue">Bebas Neue</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="textAlign" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Alineación de Texto</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'left' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: currentTextElement.align === 'left' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.align === 'left' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          Izquierda
                        </button>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'center' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: currentTextElement.align === 'center' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.align === 'center' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          Centro
                        </button>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'right' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: currentTextElement.align === 'right' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.align === 'right' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          Derecha
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="textDecoration" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Estilo de Texto</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'bold' ? 'none' : 'bold' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: currentTextElement.textDecoration === 'bold' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.textDecoration === 'bold' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          B
                        </button>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { fontStyle: currentTextElement.fontStyle === 'italic' ? 'normal' : 'italic' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontStyle: 'italic', backgroundColor: currentTextElement.fontStyle === 'italic' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.fontStyle === 'italic' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          I
                        </button>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'underline' ? 'none' : 'underline' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', textDecoration: 'underline', backgroundColor: currentTextElement.textDecoration === 'underline' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.textDecoration === 'underline' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          U
                        </button>
                        <button
                          onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'line-through' ? 'none' : 'line-through' }); onTransformEndCommit(); }}
                          style={{ padding: '0.25rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', textDecoration: 'line-through', backgroundColor: currentTextElement.textDecoration === 'line-through' ? '#3b82f6' : '#e5e7eb', color: currentTextElement.textDecoration === 'line-through' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                        >
                          S
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="textStrokeColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Contorno</label>
                      <input
                        id="textStrokeColor"
                        type="color"
                        value={currentTextElement.stroke || '#000000'}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { stroke: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="textStrokeWidth" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Grosor de Contorno: {currentTextElement.strokeWidth?.toFixed(0) || 0}</label>
                      <input
                        id="textStrokeWidth"
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={currentTextElement.strokeWidth || 0}
                        onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { strokeWidth: Number(e.target.value) })}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {isShapeSelected && currentShapeElement && (
                <CollapsibleSection title="Propiedades de la Figura" isOpen={true} setIsOpen={() => {}} icon={PenTool}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentShapeElement.type === 'rect' && (
                      <>
                        <div>
                          <label htmlFor="shapeWidth" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Ancho: {currentShapeElement.width?.toFixed(0)}</label>
                          <input
                            id="shapeWidth"
                            type="range"
                            min="10"
                            max={CANVAS_SIZE / 2}
                            value={currentShapeElement.width}
                            onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { width: Number(e.target.value) })}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <label htmlFor="shapeHeight" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Alto: {currentShapeElement.height?.toFixed(0)}</label>
                          <input
                            id="shapeHeight"
                            type="range"
                            min="10"
                            max={CANVAS_SIZE / 2}
                            value={currentShapeElement.height}
                            onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { height: Number(e.target.value) })}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </>
                    )}
                    {currentShapeElement.type === 'circle' && (
                      <div>
                        <label htmlFor="shapeRadius" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Radio: {currentShapeElement.radius?.toFixed(0)}</label>
                        <input
                          id="shapeRadius"
                          type="range"
                          min="5"
                          max={CANVAS_SIZE / 4}
                          value={currentShapeElement.radius}
                          onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { radius: Number(e.target.value) })}
                          onMouseUp={onTransformEndCommit}
                          onTouchEnd={onTransformEndCommit}
                          style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                    {currentShapeElement.type !== 'line' && (
                      <div>
                        <label htmlFor="shapeFillColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Relleno</label>
                        <input
                          id="shapeFillColor"
                          type="color"
                          value={currentShapeElement.fill}
                          onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { fill: e.target.value })}
                          onBlur={onTransformEndCommit}
                          style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                        />
                      </div>
                    )}
                    <div>
                      <label htmlFor="shapeStrokeColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Borde</label>
                      <input
                        id="shapeStrokeColor"
                        type="color"
                        value={currentShapeElement.stroke}
                        onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { stroke: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="shapeStrokeWidth" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Grosor de Borde: {currentShapeElement.strokeWidth.toFixed(0)}</label>
                      <input
                        id="shapeStrokeWidth"
                        type="range"
                        min="0"
                        max="10"
                        value={currentShapeElement.strokeWidth}
                        onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { strokeWidth: Number(e.target.value) })}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {isDateSelected && currentDateElement && (
                <CollapsibleSection title="Propiedades de la Fecha" isOpen={true} setIsOpen={() => {}} icon={Layout}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="dateContent" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Contenido de la Fecha</label>
                      <input
                        id="dateContent"
                        type="text"
                        value={currentDateElement.text}
                        onChange={(e) => handleUpdateDateElement({ text: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="dateFormat" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Formato de Fecha</label>
                      <select
                        id="dateFormat"
                        value={currentDateElement.format}
                        onChange={(e) => {
                          const newFormat = e.target.value;
                          const today = new Date();
                          handleUpdateDateElement({ format: newFormat, text: formatDate(today, newFormat) });
                        }}
                        onBlur={onTransformEndCommit}
                        style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (ej. 12/07/2025)</option>
                        <option value="MMMM DD, YYYY">MMMM DD, YYYY (ej. Julio 12, 2025)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (ej. 2025-07-12)</option>
                        <option value="DD MMMM YYYY">DD MMMM YYYY (ej. 12 Julio 2025)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dateFontSize" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Tamaño de Fuente: {currentDateElement.fontSize.toFixed(0)}</label>
                      <input
                        id="dateFontSize"
                        type="range"
                        min="10"
                        max="100"
                        value={currentDateElement.fontSize}
                        onChange={(e) => handleUpdateDateElement({ fontSize: Number(e.target.value) })}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="dateTextColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Texto</label>
                      <input
                        id="dateTextColor"
                        type="color"
                        value={currentDateElement.fill}
                        onChange={(e) => handleUpdateDateElement({ fill: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="dateFontFamily" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Familia de Fuente</label>
                      <select
                        id="dateFontFamily"
                        value={currentDateElement.fontFamily}
                        onChange={(e) => handleUpdateDateElement({ fontFamily: e.target.value })}
                        onBlur={onTransformEndCommit}
                        style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem', width: '100%' }}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                        <option value="monospace">Monospace</option>
                        <option value="Impact">Impact</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Bebas Neue">Bebas Neue</option>
                      </select>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {isImageSelected && currentImageElement && (
                <CollapsibleSection title="Propiedades de la Imagen" isOpen={true} setIsOpen={() => {}} icon={ImageIcon}>
                  <div>
                    <label htmlFor="imageOpacity" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Opacidad: {(currentImageElement.opacity * 100).toFixed(0)}%</label>
                    <input
                      id="imageOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={currentImageElement.opacity}
                      onChange={(e) => handleUpdateImageElement(selectedImageElementId!, { opacity: Number(e.target.value) })}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                    />
                  </div>
                </CollapsibleSection>
              )}

              {isAnyEditableElementSelected && (
                <CollapsibleSection title="Ajustes Generales" isOpen={true} setIsOpen={() => {}} icon={Settings}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="blurRadius" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Desenfoque: {currentElementProps.blurRadius.toFixed(0)}px</label>
                      <input
                        id="blurRadius"
                        type="range"
                        min="0"
                        max="20"
                        value={currentElementProps.blurRadius}
                        onChange={(e) => { currentElementProps.setBlurRadius(Number(e.target.value)); onTransformEndCommit(); }}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Sombra</span>
                      <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          value=""
                          style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                          checked={currentElementProps.shadowEnabled}
                          onChange={handleToggleShadow}
                        />
                        <div style={{ width: '2.75rem', height: '1.5rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                        <div style={{ content: '""', position: 'absolute', top: '2px', left: '2px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '9999px', height: '1.25rem', width: '1.25rem', transition: 'transform 0.2s' }}></div>
                      </label>
                    </div>
                    {currentElementProps.shadowEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', border: '1px solid #e5e7eb', marginTop: '0.5rem' }}>
                        <div>
                          <label htmlFor="shadowColor" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color de Sombra</label>
                          <input
                            id="shadowColor"
                            type="color"
                            value={currentElementProps.shadowColor}
                            onChange={(e) => { currentElementProps.setShadowColor(e.target.value); onTransformEndCommit(); }}
                            onBlur={onTransformEndCommit}
                            style={{ width: '100%', height: '2.5rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none' }}
                          />
                        </div>
                        <div>
                          <label htmlFor="shadowBlur" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Desenfoque de Sombra: {currentElementProps.shadowBlur.toFixed(0)}</label>
                          <input
                            id="shadowBlur"
                            type="range"
                            min="0"
                            max="20"
                            value={currentElementProps.shadowBlur}
                            onChange={(e) => { currentElementProps.setShadowBlur(Number(e.target.value)); onTransformEndCommit(); }}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <label htmlFor="shadowOffsetX" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Desplazamiento X: {currentElementProps.shadowOffsetX.toFixed(0)}</label>
                          <input
                            id="shadowOffsetX"
                            type="range"
                            min="-20"
                            max="20"
                            value={currentElementProps.shadowOffsetX}
                            onChange={(e) => { currentElementProps.setShadowOffsetX(Number(e.target.value)); onTransformEndCommit(); }}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <label htmlFor="shadowOffsetY" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Desplazamiento Y: {currentElementProps.shadowOffsetY.toFixed(0)}</label>
                          <input
                            id="shadowOffsetY"
                            type="range"
                            min="-20"
                            max="20"
                            value={currentElementProps.shadowOffsetY}
                            onChange={(e) => { currentElementProps.setShadowOffsetY(Number(e.target.value)); onTransformEndCommit(); }}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <label htmlFor="shadowOpacity" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Opacidad de Sombra: {(currentElementProps.shadowOpacity * 100).toFixed(0)}%</label>
                          <input
                            id="shadowOpacity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={currentElementProps.shadowOpacity}
                            onChange={(e) => { currentElementProps.setShadowOpacity(Number(e.target.value)); onTransformEndCommit(); }}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            style={{ width: '100%', height: '0.5rem', backgroundColor: '#d1d5db', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Reflejo</span>
                      <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          value=""
                          style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                          checked={currentElementProps.reflectionEnabled}
                          onChange={handleToggleReflection}
                        />
                        <div style={{ width: '2.75rem', height: '1.5rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                        <div style={{ content: '""', position: 'absolute', top: '2px', left: '2px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '9999px', height: '1.25rem', width: '1.25rem', transition: 'transform 0.2s' }}></div>
                      </label>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 'semibold', color: '#4b5563', marginTop: '1rem' }}>Voltear</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleFlip('x')}
                        style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'semibold', backgroundColor: '#e5e7eb', color: '#4b5563', border: 'none', cursor: 'pointer' }}
                      >
                        Voltear Horizontal
                      </button>
                      <button
                        onClick={() => handleFlip('y')}
                        style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'semibold', backgroundColor: '#e5e7eb', color: '#4b5563', border: 'none', cursor: 'pointer' }}
                      >
                        Voltear Vertical
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 'semibold', color: '#4b5563', marginTop: '1rem' }}>Filtros</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleApplyFilter('none')}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'semibold', backgroundColor: currentElementProps.filter === 'none' ? '#3b82f6' : '#e5e7eb', color: currentElementProps.filter === 'none' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                      >
                        Ninguno
                      </button>
                      <button
                        onClick={() => handleApplyFilter('grayscale')}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'semibold', backgroundColor: currentElementProps.filter === 'grayscale' ? '#3b82f6' : '#e5e7eb', color: currentElementProps.filter === 'grayscale' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                      >
                        Escala de Grises
                      </button>
                      <button
                        onClick={() => handleApplyFilter('sepia')}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 'semibold', backgroundColor: currentElementProps.filter === 'sepia' ? '#3b82f6' : '#e5e7eb', color: currentElementProps.filter === 'sepia' ? '#ffffff' : '#4b5563', border: 'none', cursor: 'pointer' }}
                      >
                        Sepia
                      </button>
                    </div>
                  </div>
                </CollapsibleSection>
              )}
            </div>
          )}
        </div>
      </div>

      {showImageUploadTypeModal && tempUploadedFile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', maxWidth: '24rem', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>¿Cómo quieres usar esta imagen?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => handleSetAsProduct(tempUploadedFile)}
                style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'semibold', border: 'none', cursor: 'pointer' }}
              >
                Establecer como Imagen de Producto
              </button>
              <button
                onClick={() => handleAddImageAsElement(tempUploadedFile)}
                style={{ backgroundColor: '#22c55e', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'semibold', border: 'none', cursor: 'pointer' }}
              >
                Añadir como Elemento en el Lienzo
              </button>
              <button
                onClick={() => { setShowImageUploadTypeModal(false); setTempUploadedFile(null); }}
                style={{ backgroundColor: '#e5e7eb', color: '#4b5563', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 'semibold', border: 'none', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}