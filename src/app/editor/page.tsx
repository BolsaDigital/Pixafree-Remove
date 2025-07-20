// src/app/editor/page.tsx
'use client'; // <--- ¡Asegúrate de que esta línea esté aquí!

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Download, Type, Image as ImageIcon, Layout, Circle, Square, Calendar, Trash2, Undo2, Redo2, Sparkles, Plus, Palette, TextCursorInput, PenTool, CreditCard, DollarSign,
  Copy, PaintBucket, BringToFront, SendToBack, ChevronUp, ChevronDown, PlusSquare, RotateCcw, RotateCw, ImageMinus,
  FlipHorizontal, FlipVertical, Droplet, Sun, Contrast, Palette as PaletteIcon, ChevronRight, ChevronLeft, Settings, MoreHorizontal
} from 'lucide-react';

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
  width?: number; // <--- ADDED THIS
  height?: number; // <--- ADDED THIS
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

  // Background properties now only apply to the fixed preset background
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
  selectedPresetBackgroundUrl?: string; // Only for the fixed preset background

  textElements: TextElement[];
  shapeElements: ShapeElement[];
  dateElement: DateElement | null;
  imageElements: ImageElement[]; // Now includes user-uploaded and AI-generated "backgrounds"
}

interface CopiedStyle {
  type: 'text' | 'shape' | 'image' | 'date';
  style: any;
}

// New interface for admin-uploaded backgrounds to include premium status
interface AdminBackground {
  id: string;
  url: string;
  isPremium: boolean;
}

// New interface for combined preset backgrounds (hardcoded + admin)
interface DisplayBackground {
  id: string; // Unique ID for selection/tracking
  url: string;
  isPremium: boolean;
}

const CANVAS_SIZE = 700;

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, isOpen, setIsOpen, children, className, icon: Icon }) => {
  return (
    <div className={`rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <button
        className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-semibold transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} />}
          {title}
        </div>
        <ChevronRight size={18} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="p-4 bg-gray-50 border-t border-gray-200">{children}</div>}
    </div>
  );
};

export default function EditorPage() {
  const searchParams = useSearchParams();

  const [productImageUrl, setProductImageUrl] = useState<string>('https://placehold.co/280x280/99e6ff/000000?text=Click+%27Imagen%27+to+Upload');
  // Removed selectedFile state as it's now handled by tempUploadedFile

  const [selectedPresetBackgroundUrl, setSelectedPresetBackgroundUrl] = useState<string | undefined>(undefined); // New state for fixed preset backgrounds

  const [scenePrompt, setScenePrompt] = useState<string>('Un estudio de fotografía minimalista con luz suave');
  const [aiReferenceImageFile, setAiReferenceImageFile] = useState<File | null>(null); // New state for AI reference image file
  const [aiReferenceImageUrl, setAiReferenceImageUrl] = useState<string | null>(null); // New state for AI reference image URL
  const [isGeneratingScene, setIsGeneratingScene] = useState<boolean>(false);

  const [konvaCanvas, setKonvaCanvas] = useState<HTMLCanvasElement | null>(null);

  const [selectedCanvasElement, setSelectedCanvasElement] = useState<'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null>('product');
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextElementId, setSelectedTextElementId] = useState<string | null>(null);
  const [shapeElements, setShapeElements] = useState<ShapeElement[]>([]);
  const [selectedShapeElementId, setSelectedShapeElementId] = useState<string | null>(null);
  const [dateElement, setDateElement] = useState<DateElement | null>(null);
  const [selectedDateElementId, setSelectedDateElementId] = useState<string | null>(null);
  const [imageElements, setImageElements] = useState<ImageElement[]>([]); // Now includes user-uploaded and AI-generated "backgrounds"
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
  const [productFlipY, setProductFlipY] = useState(1); // Corrected: Removed type annotation inside destructuring
  const [productFilter, setProductFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');
  // NEW STATE: Para controlar si el producto ha sido escalado/movido manualmente
  const [hasProductBeenScaledManually, setHasProductBeenScaledManually] = useState(false);


  // Background properties now only apply to the fixed preset background
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

  // New state to control right sidebar content
  const [rightSidebarView, setRightSidebarView] = useState<'properties' | 'backgrounds'>('backgrounds');
  // State for the "More Tools" dropdown
  const [showMoreToolsDropdown, setShowMoreToolsDropdown] = useState(false);
  const moreToolsRef = useRef<HTMLButtonElement>(null);

  // New states for unified image upload
  const [showImageUploadTypeModal, setShowImageUploadTypeModal] = useState(false);
  const [tempUploadedFile, setTempUploadedFile] = useState<File | null>(null);


  const [textCreationMode, setTextCreationMode] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState<CopiedStyle | null>(null);
  const [zOrderAction, setZOrderAction] = useState<{ type: 'up' | 'down' | 'top' | 'bottom', id: string, elementType: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' } | null>(null);

  // New state to manage moving a newly added image to the bottom of the movable layer
  const [imageToMoveToBottomId, setImageToMoveToBottomId] = useState<string | null>(null);

  // Initial states for collapsible sections - these will be removed for properties view
  // but kept for background view if needed.
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTextureOpen, setIsTextureOpen] = useState(false);
  // State for "Cargar Imagen de Fondo" collapsible section
  const [isCustomBackgroundUploadOpen, setIsCustomBackgroundUploadOpen] = useState(false);

  // NEW STATE: For "Generar Escena con IA" collapsible section
  const [isGenerateSceneAIOpen, setIsGenerateSceneAIOpen] = useState(true); // Initially open


  // Firebase states (kept for general app functionality like history, authentication)
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);

  // Admin uploaded preset backgrounds (NO LONGER SIMULATED, user will integrate their API here)
  const [isUploadingAdminPreset, setIsUploadingAdminPreset] = useState(false);
  // Changed to store objects with id, url, and isPremium
  const [adminUploadedBackgrounds, setAdminUploadedBackgrounds] = useState<AdminBackground[]>([]);
  // New state for admin upload premium/free toggle
  const [newPresetIsPremium, setNewPresetIsPremium] = useState<boolean>(false);

  // Refs for file inputs to programmatically click them
  const unifiedImageUploadRef = useRef<HTMLInputElement>(null); // Unified ref for image uploads
  const uploadCustomBackgroundRef = useRef<HTMLInputElement>(null);
  const adminUploadPresetRef = useRef<HTMLInputElement>(null);
  const aiReferenceImageRef = useRef<HTMLInputElement>(null); // New ref for AI reference image


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

  // Sample images for preset backgrounds (hardcoded) - now as DisplayBackground objects
  const hardcodedPresetBackgrounds: DisplayBackground[] = [
    { id: 'hardcoded-1', url: 'https://placehold.co/150x150/AEC6CF/000000', isPremium: false },
    { id: 'hardcoded-2', url: 'https://placehold.co/150x150/FFDAB9/000000', isPremium: false },
    { id: 'hardcoded-3', url: 'https://placehold.co/150x150/B0E0E6/000000', isPremium: false },
    { id: 'hardcoded-4', url: 'https://placehold.co/150x150/DDA0DD/000000', isPremium: true }, // Example premium
    { id: 'hardcoded-5', url: 'https://placehold.co/150x150/98FB98/000000', isPremium: false },
    { id: 'hardcoded-6', url: 'https://placehold.co/150x150/F0E68C/000000', isPremium: true }, // Example premium
  ];

  // Sample images for Pixabay and Pexels (mock data for now)
  const pixabaySampleImages: DisplayBackground[] = [
    { id: 'pixabay-1', url: 'https://placehold.co/150x150/ADD8E6/000000', isPremium: false },
    { id: 'pixabay-2', url: 'https://placehold.co/150x150/E0BBE4/000000', isPremium: false },
    { id: 'pixabay-3', url: 'https://placehold.co/150x150/957DAD/000000', isPremium: true }, // Example premium
    { id: 'pixabay-4', url: 'https://placehold.co/150x150/C7CEEA/000000', isPremium: false },
  ];

  const pexelsSampleImages: DisplayBackground[] = [
    { id: 'pexels-1', url: 'https://placehold.co/150x150/FFB6C1/000000', isPremium: false },
    { id: 'pexels-2', url: 'https://placehold.co/150x150/FFD700/000000', isPremium: true }, // Example premium
    { id: 'pexels-3', url: 'https://placehold.co/150x150/ADFF2F/000000', isPremium: false },
    { id: 'pexels-4', url: 'https://placehold.co/150x150/87CEEB/000000', isPremium: false },
  ];

  // Simulate user's premium status (for demo purposes)
  const [isUserPremium, setIsUserPremium] = useState(false); // Set to true to test premium features

  // Initialize Firebase (for auth and history)
  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setFirebaseApp(app);
      setDb(firestore);
      setAuth(firebaseAuth);

      const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      setAppId(currentAppId);

      const setupAuth = async () => {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }
        setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
      };
      setupAuth();

    } catch (e) {
      console.error("Error initializing Firebase:", e);
      // alert("Error initializing Firebase. Some features may not work."); // Removed alert to avoid blocking
    }
  }, []);

  // No longer fetching admin presets from Firestore/S3 simulation
  // This section would be replaced by user's actual API calls in production
  useEffect(() => {
    // This useEffect would be where you fetch your admin-uploaded backgrounds
    // from your `https://pixafree.online/admin/media` API.
    // Example (conceptual):
    /*
    const fetchMyAdminBackgrounds = async () => {
      try {
        const response = await fetch('https://pixafree.online/api/admin/media-backgrounds', {
          headers: {
            // Include your authentication token here if needed
            'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch admin backgrounds');
        }
        const data = await response.json();
        // Assuming your API returns an array of { id, url, isPremium } objects
        setAdminUploadedBackgrounds(data.backgrounds);
      } catch (error) {
        console.error('Error fetching admin backgrounds from your API:', error);
        // Handle error, e.g., show a message to the user
      }
    };
    // Call this function when component mounts or when a refresh is needed
    // fetchMyAdminBackgrounds();
    */
    // For this demo, we'll just add it to local state (not persistent)
  }, []);


  // Define getCurrentCanvasState first as it's a dependency for saveCurrentState
  const getCurrentCanvasState = useCallback((): CanvasState => {
    return {
      productX, productY, productScale, productRotation, productOpacity, productBlurRadius,
      productShadowEnabled, productShadowColor, productShadowBlur, productShadowOffsetX, productShadowOffsetY, productShadowOpacity,
      productReflectionEnabled, productFlipX, productFlipY, productFilter,

      backgroundOpacity, backgroundBlurRadius,
      backgroundShadowEnabled, backgroundShadowColor, backgroundShadowBlur, backgroundShadowOffsetX, backgroundShadowOffsetY, backgroundShadowOpacity,
      backgroundReflectionEnabled, backgroundFlipX, backgroundFlipY, backgroundFilter,
      selectedPresetBackgroundUrl, // Save this state

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
    selectedPresetBackgroundUrl, // Add this dependency
    textElements, shapeElements, dateElement, imageElements
  ]);

  // Define saveCurrentState next as it's a dependency for onTransformEndCommit
  const saveCurrentState = useCallback(() => {
    const newState = getCurrentCanvasState();
    setHistory((prevHistory) => {
      // Check if the current state is identical to the last saved state
      // This prevents saving duplicate states if no actual change occurred
      if (prevHistory.length > 0 && historyPointer >= 0 && JSON.stringify(prevHistory[historyPointer]) === JSON.stringify(newState)) {
        return prevHistory; // No change, return previous history
      }

      // Slice history to remove any "future" states after an undo
      const newHistory = prevHistory.slice(0, historyPointer + 1);
      const updatedHistory = [...newHistory, newState];

      // Update the history pointer to the new end of history
      // This is crucial: set the pointer based on the *new* history length
      setHistoryPointer(updatedHistory.length - 1);

      return updatedHistory;
    });
    // Removed the separate setHistoryPointer call here, as it's now inside setHistory callback
  }, [getCurrentCanvasState, historyPointer]); // historyPointer is still a dependency because of the comparison

  // Define onTransformEndCommit here as it's a dependency for other handlers
  const onTransformEndCommit = useCallback(() => {
    saveCurrentState();
  }, [saveCurrentState]);

  const applyState = useCallback((state: CanvasState) => {
    // Ensure state is not null or undefined before accessing its properties
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
    setSelectedPresetBackgroundUrl(state.selectedPresetBackgroundUrl); // Apply this state

    setTextElements(state.textElements);
    setShapeElements(state.shapeElements);
    setDateElement(state.dateElement);
    setImageElements(state.imageElements);

    const currentSelectedId = selectedTextElementId || selectedShapeElementId || selectedDateElementId || selectedImageElementId;
    let newSelectedElement: typeof selectedCanvasElement = 'product';
    let newSelectedId: string | null = null;

    // Adjust selected element logic for background
    // If the selected element was 'background' and a preset background URL exists, keep it selected.
    // Otherwise, default to 'product'.
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
        newSelectedElement = 'product'; // Default to product if nothing else is selected or background was cleared
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
      setSelectedPresetBackgroundUrl, // Add this dependency
      setTextElements, setShapeElements, setDateElement, setImageElements
  ]);

  useEffect(() => {
    const urlFromParams = searchParams.get('imageUrl');
    if (urlFromParams) {
      setProductImageUrl(urlFromParams);
    }
  }, [searchParams]);

  // **NUEVA LÓGICA PARA ESCALADO INICIAL DEL PRODUCTO**
  // Este useEffect se encargará de escalar la imagen del producto
  // solo cuando se carga inicialmente o se cambia el `productImageUrl`
  // y el `productScale` aún está en su valor predeterminado (1), Y NO HA SIDO ESCALADO MANUALMENTE.
  useEffect(() => {
    console.log('Product Image URL Effect Firing:', { productImageUrl, productScale, hasProductBeenScaledManually });
    const img = new window.Image();
    img.src = productImageUrl;
    img.onload = () => {
      // Solo aplica el escalado inicial si productScale es 1 (no ha sido modificado por el usuario)
      // y si la imagen no es un placeholder genérico, Y NO HA SIDO ESCALADO MANUALMENTE.
      if (!hasProductBeenScaledManually && productScale === 1 && !productImageUrl.includes('placehold.co')) {
        const maxDimension = Math.max(img.width, img.height);
        const targetMaxDimension = CANVAS_SIZE * 0.8;
        let newScale = 1;
        if (maxDimension > 0 && maxDimension > targetMaxDimension) {
          newScale = targetMaxDimension / maxDimension;
        }
        console.log('Applying initial product scale:', newScale);
        setProductScale(newScale);
        setProductX(CANVAS_SIZE / 2); // Centrar horizontalmente
        setProductY(CANVAS_SIZE / 2); // Centrar verticalmente
        // No llamamos a onTransformEndCommit aquí. El estado inicial se guardará
        // por el useEffect que llama a saveCurrentState cuando historyPointer es -1.
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

  // Updated handleElementSelect to manage sidebar view and properties
  const handleElementSelect = useCallback((element: 'product' | 'background' | 'text' | 'shape' | 'date' | 'image' | null, id?: string) => {
    setSelectedCanvasElement(element);
    setSelectedTextElementId(null);
    setSelectedShapeElementId(null);
    setSelectedDateElementId(null);
    setSelectedImageElementId(null);

    // Set the specific ID if applicable
    if (element === 'text' && id) {
      setSelectedTextElementId(id);
    } else if (element === 'shape' && id) {
      setSelectedShapeElementId(id);
    } else if (element === 'date' && id) {
      setSelectedDateElementId(id);
    } else if (element === 'image' && id) {
      setSelectedImageElementId(id);
    }
    // Note: 'background' selection will not attach transformer as it's a fixed stage background.
    // Its properties are edited via the 'Fondos' sidebar.
  }, []);

  const handleProductRotate = useCallback((rotation: number) => {
    setProductRotation(rotation);
  }, []);

  // Removed handleBackgroundRotate as fixed background does not rotate independently

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

  // Moved handleUpdateImageElement declaration here to ensure it's defined before use
  const handleUpdateImageElement = useCallback((id: string, updates: Partial<ImageElement>) => {
    setImageElements((prev) =>
      prev.map((imgEl) => (imgEl.id === id ? { ...imgEl, ...updates } : imgEl))
    );
  }, []);

  // Callback from CanvasEditor when an image has finished loading and is ready
  // **MODIFICADO**: Ahora recibe x, y, width, height de CanvasImageElement
  const handleImageAddedAndLoaded = useCallback((
    id: string,
    initialScaleX: number,
    initialScaleY: number,
    x: number, // Nuevo
    y: number, // Nuevo
    width: number, // Nuevo
    height: number, // Nuevo
  ) => {
    setImageElements((prev) => {
      const existingImage = prev.find(img => img.id === id);
      // Solo actualiza si las propiedades de posición/escala/dimensiones son diferentes,
      // o si las dimensiones no están definidas (lo que indica una imagen recién cargada).
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
                width: width, // Guardar las dimensiones originales
                height: height, // Guardar las dimensiones originales
              }
            : imgEl
        );
      }
      return prev; // No se necesita actualización, evita el bucle infinito
    });
    onTransformEndCommit(); // Commit after the image is loaded and positioned
  }, [onTransformEndCommit]);


  // Callback from CanvasEditor when an image has been moved to the bottom
  const onImageMovedToBottom = useCallback((id: string) => {
    if (id === imageToMoveToBottomId) {
      setImageToMoveToBottomId(null); // Reset the state after the action is complete
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
    onTransformEndCommit(); // Commit immediately for text as it doesn't have external loading
    setTextCreationMode(false); // Exit text creation mode
    setRightSidebarView('properties'); // Switch to properties when adding text
  };


  const handleDeleteText = useCallback(() => {
    if (selectedCanvasElement === 'text' && selectedTextElementId) {
      setTextElements((prev) => prev.filter((textEl) => textEl.id !== selectedTextElementId));
      setSelectedTextElementId(null);
      setSelectedCanvasElement('product'); // Default to product selection
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
    setRightSidebarView('properties'); // Switch to properties when adding shape
  };


  const handleDeleteShape = useCallback(() => {
    if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      setShapeElements((prev) => prev.filter((shapeEl) => shapeEl.id !== selectedShapeElementId));
      setSelectedShapeElementId(null);
      setSelectedCanvasElement('product'); // Default to product selection
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
      format: defaultFormat, // Ensure format is set
    };
    setDateElement(newDate);
    handleElementSelect('date', newDate.id);
    onTransformEndCommit();
    setRightSidebarView('properties'); // Switch to properties when adding date
  };


  const handleDeleteDate = useCallback(() => {
    if (selectedCanvasElement === 'date' && dateElement) {
      setDateElement(null);
      setSelectedDateElementId(null);
      setSelectedCanvasElement('product'); // Default to product selection
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, dateElement, onTransformEndCommit]);

  const currentDateElement = dateElement;


  // New unified image upload handler
  const handleUnifiedImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setTempUploadedFile(event.target.files[0]);
      setShowImageUploadTypeModal(true);
      event.target.value = ''; // Clear the input value to allow re-uploading the same file
    }
  };

  // Handler for setting image as main product
  const handleSetAsProduct = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    setProductImageUrl(newImageUrl);

    // Reset product properties to default when a new product image is loaded
    setProductX(CANVAS_SIZE / 2);
    setProductY(CANVAS_SIZE / 2);
    setProductScale(1); // Reset scale to 1 (will be re-scaled by useEffect after image loads)
    setProductRotation(0);
    setProductOpacity(1);
    setProductBlurRadius(0);
    setProductShadowEnabled(false); setProductShadowColor('#000000'); setProductShadowBlur(0); setProductShadowOffsetX(0); setProductShadowOffsetY(0); setProductShadowOpacity(0.5);
    setProductReflectionEnabled(false);
    setProductFlipX(1); setProductFlipY(1);
    setProductFilter('none');
    setHasProductBeenScaledManually(false); // NEW: Reset manual scale flag for new product
    console.log('handleSetAsProduct: Resetting product state and manual flag to false.');
    // onTransformEndCommit will be called by useEffect for initial scale, or later by user interaction
    handleElementSelect('product');
    setShowImageUploadTypeModal(false);
    setTempUploadedFile(null);
  };

  // Handler for adding image as a new element
  const handleAddImageAsElement = (file: File) => {
    const newImageUrl = URL.createObjectURL(file);
    const newImageId = `image-${Date.now()}`;
    const newImage: ImageElement = {
      id: newImageId,
      url: newImageUrl,
      x: 0, // Initial position, CanvasImageElement will adjust scale/center
      y: 0, // Initial position, CanvasImageElement will adjust scale/center
      scaleX: 1, // CanvasImageElement will calculate actual scale
      scaleY: 1,
      rotation: 0,
      opacity: 1,
      blurRadius: 0,
      shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      reflectionEnabled: false,
      flipX: 1, flipY: 1,
      filter: 'none',
      width: undefined, // Will be set by onImageAddedAndLoaded
      height: undefined, // Will be set by onImageAddedAndLoaded
    };
    setImageElements((prev) => [...prev, newImage]);
    handleElementSelect('image', newImage.id);
    // Do NOT set imageToMoveToBottomId here, as this is for regular images that should be on top
    setRightSidebarView('properties'); // Switch to properties when adding image
    setShowImageUploadTypeModal(false);
    setTempUploadedFile(null);
  };


  const handleDeleteImage = useCallback(() => {
    if (selectedCanvasElement === 'image' && selectedImageElementId) {
      setImageElements((prev) => prev.filter((imgEl) => imgEl.id !== selectedImageElementId));
      setSelectedImageElementId(null);
      setSelectedCanvasElement('product'); // Default to product selection
      onTransformEndCommit();
    }
  }, [selectedCanvasElement, selectedImageElementId, onTransformEndCommit]);

  const currentImageElement = imageElements.find(el => el.id === selectedImageElementId);

  // This handler is for "Cargar Imagen de Fondo" which adds a movable image to the canvas, and should be at the bottom
  const handleCustomBackgroundFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newImageUrl = URL.createObjectURL(file);
      const newImageId = `image-${Date.now()}`;
      const newImage: ImageElement = {
        id: newImageId,
        url: newImageUrl,
        x: 0, // Initial position, CanvasImageElement will adjust scale/center
        y: 0, // Initial position, CanvasImageElement will adjust scale/center
        scaleX: 1, // Initial scale to fill, user can resize
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        blurRadius: 0,
        shadowEnabled: false, shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
        reflectionEnabled: false,
        flipX: 1, flipY: 1,
        filter: 'none',
        width: undefined, // Will be set by onImageAddedAndLoaded
        height: undefined, // Will be set by onImageAddedAndLoaded
      };
      // Do NOT clear preset background here. User can have both.
      setImageElements((prev) => [...prev, newImage]);
      handleElementSelect('image', newImage.id); // Select the newly added image
      setImageToMoveToBottomId(newImage.id); // Set the ID to trigger move to bottom
      event.target.value = ''; // Clear the input value to allow re-uploading the same file
    }
  };

  // This handler is for selecting a FIXED preset background (not movable image element)
  const handleSelectPresetBackground = (background: DisplayBackground) => {
    if (background.isPremium && !isUserPremium) {
      alert('Este fondo es premium. Por favor, actualiza tu plan para usarlo.');
      return;
    }
    setSelectedPresetBackgroundUrl(background.url); // Set the fixed preset background
    // Reset background properties to default when a new preset background is selected
    setBackgroundOpacity(1);
    setBackgroundBlurRadius(0);
    setBackgroundShadowEnabled(false); setBackgroundShadowColor('#000000'); setBackgroundShadowBlur(0); setBackgroundShadowOffsetX(0); setBackgroundShadowOffsetY(0); setBackgroundShadowOpacity(0.5);
    setBackgroundReflectionEnabled(false);
    setBackgroundFlipX(1); setBackgroundFlipY(1);
    setBackgroundFilter('none');
    onTransformEndCommit();
    // Do NOT clear imageElements here. User can have both.
    setSelectedCanvasElement('background'); // Select the fixed background (though not transformable)
  };

  const processImageWithReplicate = async () => {
    if (!productImageUrl || productImageUrl.includes('placeholder.com') || productImageUrl.includes('placehold.co')) {
      alert('Por favor, selecciona primero una imagen de producto para simular el procesamiento.');
      return;
    }
    alert('Esta función de "Editar recorte" es una simulación para demostrar una posible integración con IA. Para una funcionalidad real, necesitarías un servicio de procesamiento de imágenes (como Replicate AI) o implementar una herramienta de recorte directamente en el lienzo.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProductImageUrl('https://via.placeholder.com/280/aaddcc/000000?text=PROCESSED+PRODUCT');
    onTransformEndCommit();
    setShowMoreToolsDropdown(false); // Close dropdown after action
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
    // Add a loading placeholder image to imageElements
    const loadingImageId = `image-${Date.now()}`; // Ensure unique ID for loading image
    const loadingImage: ImageElement = {
      id: loadingImageId,
      url: `https://placehold.co/200x200/eeeeee/333333?text=Generando...`,
      x: 0, // Will be centered by CanvasImageElement
      y: 0, // Will be centered by CanvasImageElement
      scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, blurRadius: 0, shadowEnabled: false, reflectionEnabled: false, flipX: 1, flipY: 1, filter: 'none',
      shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0.5,
      width: undefined, height: undefined, // Will be set by onImageAddedAndLoaded
    };
    setImageElements((prev) => [...prev, loadingImage]);
    handleElementSelect('image', loadingImage.id); // Select the loading image
    setImageToMoveToBottomId(loadingImage.id); // Set the ID to trigger move to bottom

    let finalPrompt = scenePrompt;
    const apiKey = ""; // Leave as empty string. Canvas will provide the key at runtime.

    try {
      if (aiReferenceImageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(aiReferenceImageFile);
        await new Promise((resolve) => {
          reader.onloadend = resolve;
        });
        const base64ImageData = reader.result.split(',')[1]; // Get base64 part

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
        // Update the loading image with the actual generated image
        setImageElements((prev) => prev.map(img =>
          img.id === loadingImageId ? { ...img, url: imageUrl, x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, scaleX: 1, scaleY: 1 } : img
        ));
        onTransformEndCommit();
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
        link.download = `pixafree_image.png`; // Simplified download name
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
    // Store current selection to clear it first
    const currentSelectedElement = selectedCanvasElement;
    const currentSelectedId = selectedTextElementId || selectedShapeElementId || selectedDateElementId || selectedImageElementId;

    // Clear selection immediately to detach transformer
    // This will trigger the useEffect in CanvasEditor to clear transformer.nodes()
    handleElementSelect(null); // This is the crucial change

    // Now proceed with deletion based on the stored type
    if (currentSelectedElement === 'text' && currentSelectedId) {
      setTextElements((prev) => prev.filter((textEl) => textEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'shape' && currentSelectedId) {
      setShapeElements((prev) => prev.filter((shapeEl) => shapeEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'date' && currentSelectedId) {
      setDateElement(null);
    } else if (currentSelectedElement === 'image' && currentSelectedId) {
      setImageElements((prev) => prev.filter((imgEl) => imgEl.id !== currentSelectedId));
    } else if (currentSelectedElement === 'product') {
      setProductImageUrl('https://placehold.co/280x280/99e6ff/000000?text=Click+%27Imagen%27+to+Upload');
      // Removed setSelectedFile(null); as it's no longer used directly
      setProductX(CANVAS_SIZE / 2);
      setProductY(CANVAS_SIZE / 2);
      setProductScale(1); // Reset scale to 1 (will be re-scaled on next upload)
      setProductRotation(0);
      setProductOpacity(1);
      setProductBlurRadius(0);
      setProductShadowEnabled(false); setProductShadowColor('#000000'); setProductShadowBlur(0); setProductShadowOffsetX(0); setProductShadowOffsetY(0); setProductShadowOpacity(0.5);
      setProductReflectionEnabled(false);
      setProductFlipX(1); setProductFlipY(1);
      setProductFilter('none');
      setHasProductBeenScaledManually(false); // NEW: Reset manual scale flag on delete
      console.log('handleDeleteElement: Deleting product, resetting manual flag to false.');
    } else if (currentSelectedElement === 'background') { // For the fixed preset background
      setSelectedPresetBackgroundUrl(undefined); // Reset background to default (white)
      setBackgroundOpacity(1);
      setBackgroundBlurRadius(0);
      setBackgroundShadowEnabled(false); setBackgroundShadowColor('#000000'); setBackgroundShadowBlur(0); setBackgroundShadowOffsetX(0); setBackgroundShadowOffsetY(0); setBackgroundShadowOpacity(0.5);
      setBackgroundReflectionEnabled(false);
      setBackgroundFlipX(1); setBackgroundFlipY(1);
      setBackgroundFilter('none');
    }
    // After deletion, commit the state change
    onTransformEndCommit();
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
    handleElementSelect // Added dependency
  ]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
      }
      handleDeleteElement();
    }
  }, [handleDeleteElement]);

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
          id: `text-${Date.now()}`,
          x: originalText.x + 20,
          y: originalText.y + 20,
        };
        setTextElements((prev) => [...prev, newText]);
        handleElementSelect('text', newText.id);
        onTransformEndCommit();
      }
    } else if (selectedCanvasElement === 'shape' && selectedShapeElementId) {
      const originalShape = shapeElements.find(el => el.id === selectedShapeElementId);
      if (originalShape) {
        const newShape: ShapeElement = {
          ...originalShape,
          id: `shape-${Date.now()}`,
          x: originalShape.x + 20,
          y: originalShape.y + 20,
        };
        setShapeElements((prev) => [...prev, newShape]);
        handleElementSelect('shape', newShape.id);
        onTransformEndCommit();
      }
    } else if (selectedCanvasElement === 'date' && dateElement) {
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
          id: `image-${Date.now()}`,
          x: originalImage.x + 20,
          y: originalImage.y + 20,
        };
        setImageElements((prev) => [...prev, newImage]);
        handleElementSelect('image', newImage.id);
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
      // Fixed background cannot be reordered
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
    setZOrderAction(null);
    saveCurrentState();
  }, [saveCurrentState]);

  const handleFlip = useCallback((axis: 'x' | 'y') => {
    if (selectedCanvasElement === 'product') {
      setProductFlipX((prev) => (axis === 'x' ? prev * -1 : prev));
      setProductFlipY((prev) => (axis === 'y' ? prev * -1 : prev));
    } else if (selectedCanvasElement === 'background') {
      // Fixed background does not flip independently, its flip is handled by the overall background properties
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
    onTransformEndCommit();
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
    onTransformEndCommit();
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
    onTransformEndCommit();
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
    onTransformEndCommit();
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
  } else if (selectedCanvasElement === 'background') { // Background is handled separately for properties view
    currentElementProps = {
      opacity: backgroundOpacity, blurRadius: backgroundBlurRadius,
      shadowEnabled: backgroundShadowEnabled, shadowColor: backgroundShadowColor, shadowBlur: backgroundShadowBlur, shadowOffsetX: backgroundShadowOffsetX, backgroundShadowOffsetY: backgroundShadowOffsetY, backgroundShadowOpacity: backgroundShadowOpacity,
      reflectionEnabled: backgroundReflectionEnabled,
      filter: backgroundFilter,
      setOpacity: setBackgroundOpacity, setBlurRadius: setBackgroundBlurRadius,
      setShadowEnabled: setBackgroundShadowEnabled, setShadowColor: setBackgroundShadowColor, setShadowBlur: setBackgroundBlurRadius, setShadowOffsetX: setBackgroundShadowOffsetX, setBackgroundShadowOffsetY: setBackgroundShadowOffsetY, setBackgroundShadowOpacity: setBackgroundShadowOpacity,
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
      setShadowBlur: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { blurRadius: val }),
      setShadowOffsetX: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateShapeElement(selectedShapeElementId!, { offsetY: val }),
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
      setShadowBlur: (val: number) => handleUpdateDateElement({ blurRadius: val }),
      setShadowOffsetX: (val: number) => handleUpdateDateElement({ shadowOffsetX: val }),
      setShadowOffsetY: (val: number) => handleUpdateDateElement({ offsetY: val }),
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
      setShadowOffsetY: (val: number) => handleUpdateImageElement(selectedImageElementId!, { offsetY: val }),
      setShadowOpacity: (val: number) => handleUpdateImageElement(selectedImageElementId!, { shadowOpacity: val }),
      setReflectionEnabled: (val: boolean) => handleUpdateImageElement(selectedImageElementId!, { reflectionEnabled: val }),
      setFilter: (val: 'none' | 'grayscale' | 'sepia') => handleUpdateImageElement(selectedImageElementId!, { filter: val }),
    };
  }

  // Close dropdown if clicked outside
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

  // Admin upload functions (PLACEHOLDER FOR USER'S AWS S3 / MEDIA API INTEGRATION)
  const handleAdminUploadPreset = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setIsUploadingAdminPreset(true);
      // Simulate network delay for upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // --- START: YOUR AWS S3 / MEDIA API INTEGRATION HERE ---
      // This is where you would send the 'file' to your backend API
      // (e.g., https://pixafree.online/admin/media) for secure upload to S3.
      // Your backend would then return the public URL of the uploaded image.
      // Make sure to also send the `newPresetIsPremium` value to your backend.

      // Example conceptual fetch request:
      /*
      const formData = new FormData();
      formData.append('image', file);
      formData.append('isPremium', String(newPresetIsPremium)); // Send premium status

      try {
        const response = await fetch('https://pixafree.online/api/upload-admin-background', {
          method: 'POST',
          headers: {
            // Include your authentication token here (e.g., from a login session)
            'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error al subir el fondo a tu API de medios.');
        }

        const result = await response.json();
        const imageUrlFromYourApi = result.url; // Assuming your API returns the URL
        const uploadedId = `admin-uploaded-${Date.now()}`; // Or use ID from your backend

        // Update local state to display the newly uploaded image (optional, for immediate feedback)
        setAdminUploadedBackgrounds((prev) => [...prev, { id: uploadedId, url: imageUrlFromYourApi, isPremium: newPresetIsPremium }]);
        alert("Fondo preestablecido subido exitosamente a tu sistema!");

      } catch (error) {
        console.error("Error uploading to your media API:", error);
        alert("Error al subir el fondo. Revisa la consola para más detalles.");
      }
      */
      // --- END: YOUR AWS S3 / MEDIA API INTEGRATION HERE ---

      // For this demo, we'll just add it to local state (not persistent)
      const newImageUrl = URL.createObjectURL(file);
      const newId = `admin-local-${Date.now()}`;
      setAdminUploadedBackgrounds((prev) => [...prev, { id: newId, url: newImageUrl, isPremium: newPresetIsPremium }]);
      alert("Fondo preestablecido subido exitosamente (solo en esta sesión)!");
      event.target.value = ''; // Clear the input value to allow re-uploading the same file

      setIsUploadingAdminPreset(false);
    }
  };

  const handleDeleteAdminPreset = async (idToDelete: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este fondo preestablecido? (Esto no eliminará el archivo de tu servidor real)")) {
      // Simulate network delay for deletion
      await new Promise(resolve => setTimeout(resolve, 500));

      // --- START: YOUR AWS S3 / MEDIA API DELETION INTEGRATION HERE ---
      // This is where you would send a request to your backend API
      // to delete the image from S3. You'd likely send the ID or URL.

      // Example conceptual fetch request:
      /*
      try {
        const response = await fetch('https://pixafree.online/api/delete-admin-background', {
          method: 'POST', // Or DELETE, depending on your API design
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
          },
          body: JSON.stringify({ id: idToDelete }), // Or { url: urlToDelete }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el fondo de tu API de medios.');
        }

        alert("Fondo preestablecido eliminado exitosamente de tu sistema!");
        // After successful deletion from your API, update local state:
        setAdminUploadedBackgrounds((prev) => prev.filter((bg) => bg.id !== idToDelete));

      } catch (error) {
        console.error("Error deleting from your media API:", error);
        alert("Error al eliminar el fondo. Revisa la consola para más detalles.");
      }
      */
      // --- END: YOUR AWS S3 / MEDIA API DELETION INTEGRATION HERE ---

      // For this demo, we'll just remove it from local state (not persistent)
      setAdminUploadedBackgrounds((prev) => prev.filter((bg) => bg.id !== idToDelete));
      alert("Fondo preestablecido eliminado de esta sesión (no de tu servidor)!");
    }
  };

  // Combine hardcoded and locally "uploaded" admin presets for display in this demo
  const allPresetBackgrounds: DisplayBackground[] = [
    ...hardcodedPresetBackgrounds,
    ...adminUploadedBackgrounds, // These are only for demonstration in this session
    ...pixabaySampleImages, // Include Pixabay samples
    ...pexelsSampleImages, // Include Pexels samples
  ];

  const handleGetProClick = () => {
    alert(
      `¡Obtén Pixafree PRO!\n\n` +
      `Desbloquea todos los fondos premium y funciones avanzadas con una suscripción.\n\n` +
      `Para suscribirte, haz clic en "Suscribirse con PayPal" a continuación.\n\n` +
      `Es crucial entender: La integración de PayPal es una SIMULACIÓN. Para una integración real y segura de pagos con PayPal, necesitarías una lógica de backend robusta que maneje la creación y captura de órdenes de pago, la gestión de suscripciones y la seguridad de las claves API.`
    );
    // In a real application, you would open a modal here with the PayPal button
    // and subscription details.
  };


  return (
    <div className="h-screen flex flex-col font-sans relative bg-gray-50">
      <header className="w-full bg-white shadow-md p-4 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">📸 Pixafree</h1>
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              className={`p-2 rounded-full transition duration-200 ${
                historyPointer <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              title="Deshacer"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= history.length - 1}
              className={`p-2 rounded-full transition duration-200 ${
                historyPointer >= history.length - 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              title="Rehacer"
            >
              <Redo2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Unified Image Upload Button */}
          <button
            onClick={() => unifiedImageUploadRef.current?.click()}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group"
            title="Subir Imagen"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleUnifiedImageUpload}
              className="hidden"
              ref={unifiedImageUploadRef}
            />
            <label htmlFor="unified-image-upload" className="cursor-pointer flex flex-col items-center">
              <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
              <span>Imagen</span>
            </label>
          </button>

          <button
            onClick={() => {
              setRightSidebarView('backgrounds');
              setIsGenerateSceneAIOpen(false); // Collapse AI scene generation when "Fondos" is clicked
            }}
            className={`flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group ${rightSidebarView === 'backgrounds' ? 'text-blue-600 font-semibold' : ''}`}
            title="Fondos"
          >
            <PaletteIcon size={24} className="group-hover:scale-110 transition-transform" />
            <span>Fondos</span>
          </button>

          <button
            onClick={() => handleAddText()} // Simplified to directly add text
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group"
            title="Añadir Texto"
          >
            <TextCursorInput size={24} className="group-hover:scale-110 transition-transform" />
            <span>Texto</span>
          </button>

          <button
            onClick={() => handleAddShape('rect')}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group"
            title="Añadir Forma"
          >
            <PenTool size={24} className="group-hover:scale-110 transition-transform" />
            <span>Forma</span>
          </button>

          {/* New/Moved Buttons for Top Bar */}
          <button
            onClick={processImageWithReplicate}
            className={`flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group ${!isProductSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Editar Recorte (Simulado)"
            disabled={!isProductSelected}
          >
            <ImageMinus size={24} className="group-hover:scale-110 transition-transform" />
            <span>Recorte</span>
          </button>

          <button
            onClick={handleDeleteElement}
            className={`flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors text-sm group ${!isAnyEditableElementSelected && selectedCanvasElement !== 'background' ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Borrar Elemento Seleccionado"
            disabled={!isAnyEditableElementSelected && selectedCanvasElement !== 'background'}
          >
            <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
            <span>Borrar</span>
          </button>

          <button
            onClick={handleDuplicateElement}
            className={`flex flex-col items-center text-gray-700 hover:text-green-600 transition-colors text-sm group ${!isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Duplicar Elemento Seleccionado"
            disabled={!isAnyEditableElementSelected}
          >
            <PlusSquare size={24} className="group-hover:scale-110 transition-transform" />
            <span>Duplicar</span>
          </button>

          <button
            onClick={() => setRightSidebarView('properties')}
            className={`flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group ${rightSidebarView === 'properties' ? 'text-blue-600 font-semibold' : ''}`}
            title="Propiedades del Objeto Seleccionado"
          >
            <Settings size={24} className="group-hover:scale-110 transition-transform" />
            <span>Propiedades</span>
          </button>

          {/* "Más Herramientas" dropdown button */}
          <div className="relative">
            <button
              ref={moreToolsRef}
              onClick={() => setShowMoreToolsDropdown(!showMoreToolsDropdown)}
              className="flex flex-col items-center text-gray-700 hover:text-blue-600 transition-colors text-sm group"
              title="Más Herramientas"
            >
              <MoreHorizontal size={24} className="group-hover:scale-110 transition-transform" />
              <span>Más</span>
            </button>
            {showMoreToolsDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-30 py-2 w-48">
                <button
                  onClick={() => { alert('Funcionalidad "Compartir" (no implementada)'); setShowMoreToolsDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm"
                  title="Compartir Imagen"
                >
                  Compartir
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleCopyStyle}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${!isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Copiar Estilo del Elemento Seleccionado"
                  disabled={!isAnyEditableElementSelected}
                >
                  <Copy size={16} /> Copiar Estilo
                </button>
                <button
                  onClick={handlePasteStyle}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${!copiedStyle || !isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Pegar Estilo al Elemento Seleccionado"
                  disabled={!copiedStyle || !isAnyEditableElementSelected}
                >
                  <PaintBucket size={16} /> Pegar Estilo
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <span className="block px-4 py-2 text-xs text-gray-500 font-semibold uppercase">Orden de Capas</span>
                <button
                  onClick={() => handleZOrder('up')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${selectedCanvasElement === 'background' || !isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Mover Adelante"
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <ChevronUp size={16} /> Adelante
                </button>
                <button
                  onClick={() => handleZOrder('down')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${selectedCanvasElement === 'background' || !isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Mover Atrás"
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <ChevronDown size={16} /> Atrás
                </button>
                <button
                  onClick={() => handleZOrder('top')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${selectedCanvasElement === 'background' || !isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Mover al Frente"
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <BringToFront size={16} /> Al Frente
                </button>
                <button
                  onClick={() => handleZOrder('bottom')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2 text-sm ${selectedCanvasElement === 'background' || !isAnyEditableElementSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Mover al Fondo"
                  disabled={selectedCanvasElement === 'background' || !isAnyEditableElementSelected}
                >
                  <SendToBack size={16} /> Al Fondo
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* NEW: Obtener PRO Button */}
          <button
            onClick={handleGetProClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            title="Obtener Pixafree PRO"
          >
            Obtener PRO
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 text-sm transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            title="Descargar Imagen Final"
          >
            <Download size={18} /> Descargar
          </button>
        </div>
      </header>

      <div className="flex flex-1 w-full overflow-hidden">
        <div className="flex-grow flex items-center justify-center p-6 bg-gray-100 overflow-hidden">
          <DynamicCanvasEditor
            productImageUrl={productImageUrl}
            onCanvasReady={setKonvaCanvas}
            selectedCanvasElement={selectedCanvasElement}
            onElementSelect={handleElementSelect}

            // Product props
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
            setHasProductBeenScaledManually={setHasProductBeenScaledManually} // NEW PROP

            // Background props
            selectedPresetBackgroundUrl={selectedPresetBackgroundUrl}
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

            // Text elements
            textElements={textElements}
            selectedTextElementId={selectedTextElementId}
            onTextUpdate={handleUpdateTextElement}

            // Shape elements
            shapeElements={shapeElements}
            selectedShapeElementId={selectedShapeElementId}
            onShapeUpdate={handleUpdateShapeElement}

            // Date element
            dateElement={dateElement}
            selectedDateElementId={selectedDateElementId}
            onDateUpdate={handleUpdateDateElement}

            // Image elements
            imageElements={imageElements}
            selectedImageElementId={selectedImageElementId}
            onImageUpdate={handleUpdateImageElement}
            onImageAddedAndLoaded={handleImageAddedAndLoaded} // Passing updated handler

            onTransformEndCommit={onTransformEndCommit}
            canvasSize={CANVAS_SIZE}
            // onProductImageLoadedAndScaled={handleProductImageLoadedAndScaled} // REMOVED FROM HERE

            // Z-order
            zOrderAction={zOrderAction}
            onZOrderActionComplete={onZOrderActionComplete}
            imageToMoveToBottomId={imageToMoveToBottomId}
            onImageMovedToBottom={onImageMovedToBottom}
          />
        </div>

        <div className="w-80 bg-white p-4 border-l border-gray-200 flex flex-col gap-3 overflow-y-auto shadow-inner flex-shrink-0">
          {rightSidebarView === 'backgrounds' ? (
            // Backgrounds View
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800">Opciones de Fondo</h2>

              <CollapsibleSection
                title="Generar Escena con IA"
                isOpen={isGenerateSceneAIOpen} // Use new state
                setIsOpen={setIsGenerateSceneAIOpen} // Pass setter for toggling
                icon={Sparkles}
              >
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-600">Describe la escena que quieres generar para tu producto.</p>
                  <textarea
                    value={scenePrompt}
                    onChange={(e) => setScenePrompt(e.target.value)}
                    placeholder="Ej: Un estudio de fotografía minimalista con luz suave"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <p className="text-sm text-gray-600">Opcional: Sube una imagen de referencia para que la IA la use como contexto.</p>
                  <label htmlFor="aiReferenceImageUpload" className="cursor-pointer py-2 px-4 rounded-md text-sm font-semibold text-left hover:bg-gray-100 block bg-gray-100 text-center">
                    {aiReferenceImageFile ? 'Cambiar Imagen de Referencia' : 'Subir Imagen de Referencia'}
                  </label>
                  <input
                    id="aiReferenceImageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAiReferenceImageChange}
                    className="hidden"
                    ref={aiReferenceImageRef}
                  />
                  {aiReferenceImageUrl && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500 mb-1">Imagen de referencia:</p>
                      <img src={aiReferenceImageUrl} alt="AI Reference" className="max-w-full h-24 object-contain mx-auto rounded-md border border-gray-200" />
                      <button
                        onClick={() => { setAiReferenceImageFile(null); setAiReferenceImageUrl(null); if (aiReferenceImageRef.current) aiReferenceImageRef.current.value = ''; }}
                        className="mt-2 text-red-500 hover:text-red-700 text-xs"
                      >
                        Eliminar Imagen de Referencia
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleGenerateSceneWithAI}
                    disabled={isGeneratingScene || (!scenePrompt && !aiReferenceImageFile)}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white font-semibold transition duration-200 ${
                      isGeneratingScene || (!scenePrompt && !aiReferenceImageFile) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGeneratingScene ? (
                      <>
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-solid rounded-full border-r-transparent"></span>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Generar Escena
                      </>
                    )}
                  </button>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Cargar Imagen de Fondo" isOpen={isCustomBackgroundUploadOpen} setIsOpen={setIsCustomBackgroundUploadOpen} icon={ImageIcon}>
                <label htmlFor="uploadCustomBackground" className="cursor-pointer py-2 px-4 rounded-md text-sm font-semibold text-left hover:bg-gray-100 block bg-gray-100">
                  Seleccionar Archivo
                </label>
                <input
                  id="uploadCustomBackground"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomBackgroundFileChange}
                  className="hidden"
                  ref={uploadCustomBackgroundRef}
                />
                <p className="text-xs text-gray-500 mt-2">
                  La imagen cargada se añadirá como un elemento editable en el lienzo.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Fondos Preestablecidos" isOpen={true} setIsOpen={() => {}} icon={Layout}>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2"> {/* Added max-h and overflow */}
                  {allPresetBackgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      className={`relative w-full h-24 rounded-md overflow-hidden cursor-pointer group border transition-colors ${
                        bg.isPremium && !isUserPremium ? 'border-yellow-500 opacity-60' : 'border-gray-200 hover:border-blue-500'
                      }`}
                      onClick={() => handleSelectPresetBackground(bg)}
                    >
                      {/* Image of sample background */}
                      <img src={bg.url} alt={`Fondo ${bg.id}`} className="w-full h-full object-cover" />
                      {bg.isPremium && (
                        <span className="absolute top-1 right-1 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Premium
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all">
                        <Plus size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Admin Preset Backgrounds Section (FOR YOUR INTEGRATION) */}
              <CollapsibleSection title="Administrar Fondos Personalizados (Integrar con tu API)" isOpen={true} setIsOpen={() => {}} icon={ImageIcon}>
                <p className="text-sm text-gray-600 mb-2">
                  Aquí puedes subir nuevos fondos preestablecidos que se guardarán en tu propio sistema de medios (ej. `https://pixafree.online/admin/media`).
                </p>
                <div className="mb-3">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Tipo de Fondo:</span>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="presetType"
                        value="free"
                        checked={!newPresetIsPremium}
                        onChange={() => setNewPresetIsPremium(false)}
                      />
                      <span className="ml-2 text-gray-700">Gratis</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="presetType"
                        value="premium"
                        checked={newPresetIsPremium}
                        onChange={() => setNewPresetIsPremium(true)}
                      />
                      <span className="ml-2 text-gray-700">Premium</span>
                    </label>
                  </div>
                </div>
                <label htmlFor="adminUploadPreset" className="cursor-pointer py-2 px-4 rounded-md text-sm font-semibold text-left hover:bg-blue-100 block bg-blue-500 text-white text-center">
                  {isUploadingAdminPreset ? 'Subiendo...' : 'Subir Nuevo Fondo'}
                </label>
                <input
                  id="adminUploadPreset"
                  type="file"
                  accept="image/*"
                  onChange={handleAdminUploadPreset}
                  className="hidden"
                  ref={adminUploadPresetRef}
                  disabled={isUploadingAdminPreset}
                />
                <p className="text-xs text-gray-500 mt-1">
                  **Nota:** La subida es solo para demostración en esta sesión. Para persistencia, debes integrar con tu API.
                </p>

                <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2">Fondos Subidos (Solo en esta sesión)</h4>
                {adminUploadedBackgrounds.length === 0 ? (
                  <p className="text-sm text-gray-500">No has subido ningún fondo en esta sesión.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                    {adminUploadedBackgrounds.map((preset) => (
                      <div
                        key={preset.id}
                        className="relative w-full h-24 rounded-md overflow-hidden group border border-gray-200"
                      >
                        {/* Image of sample background */}
                        <img src={preset.url} alt={`Admin Uploaded ${preset.id}`} className="w-full h-full object-cover" />
                        {preset.isPremium && (
                          <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Premium
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteAdminPreset(preset.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar este fondo (solo de esta sesión)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  **Implementación:** Para que los fondos subidos persistan y estén disponibles para todos los usuarios, deberás:
                  <br/>1. Llamar a tu API de backend (`https://pixafree.online/admin/media` o similar) en `handleAdminUploadPreset` para subir el archivo, incluyendo el estado `isPremium`.
                  <br/>2. Llamar a tu API en `handleDeleteAdminPreset` para eliminar el archivo.
                  <br/>3. En la sección "Fondos Preestablecidos", deberás cargar las URLs y el estado `isPremium` de las imágenes desde tu API de medios al inicio de la aplicación.
                </p>
              </CollapsibleSection>

            </div>
          ) : (
            // Properties View (Flattened)
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Propiedades del Objeto</h2>

              {/* Toggle for User Premium Status (for demo) - Moved here */}
              <div className="flex items-center justify-between p-2 bg-yellow-100 rounded-md border border-yellow-200 mb-4">
                <span className="text-sm font-semibold text-yellow-800">Simular Usuario Premium:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={isUserPremium}
                    onChange={(e) => setIsUserPremium(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {!selectedCanvasElement && (
                <div className="p-4 text-center text-gray-500">
                  Haz clic en un elemento en el lienzo para editar sus propiedades.
                </div>
              )}

              {/* Product Specific Properties */}
              {isProductSelected && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades del Producto</h3>
                  <div>
                    <label htmlFor="productOpacity" className="block text-sm font-medium text-gray-700">Opacidad: {(productOpacity * 100).toFixed(0)}%</label>
                    <input
                      id="productOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={productOpacity}
                      onChange={(e) => { setProductOpacity(Number(e.target.value)); onTransformEndCommit(); }}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Background Specific Properties (for fixed preset background) */}
              {selectedCanvasElement === 'background' && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades del Fondo</h3>
                  <div>
                    <label htmlFor="backgroundOpacity" className="block text-sm font-medium text-gray-700">Opacidad: {(backgroundOpacity * 100).toFixed(0)}%</label>
                    <input
                      id="backgroundOpacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={backgroundOpacity}
                      onChange={(e) => { setBackgroundOpacity(Number(e.target.value)); onTransformEndCommit(); }}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Text Specific Properties */}
              {isTextSelected && currentTextElement && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades del Texto</h3>
                  <div>
                    <label htmlFor="textContent" className="block text-sm font-medium text-gray-700">Contenido del Texto</label>
                    <textarea
                      id="textContent"
                      value={currentTextElement.text}
                      onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { text: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">Tamaño de Fuente: {currentTextElement.fontSize.toFixed(0)}</label>
                    <input
                      id="fontSize"
                      type="range"
                      min="10"
                      max="100"
                      value={currentTextElement.fontSize}
                      onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fontSize: Number(e.target.value) })}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="textColor" className="block text-sm font-medium text-gray-700">Color de Texto</label>
                    <input
                      id="textColor"
                      type="color"
                      value={currentTextElement.fill}
                      onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fill: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Familia de Fuente</label>
                    <select
                      id="fontFamily"
                      value={currentTextElement.fontFamily}
                      onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { fontFamily: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                  <div className="col-span-1">
                    <label htmlFor="textAlign" className="block text-sm font-medium text-gray-700">Alineación de Texto</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'left' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm ${currentTextElement.align === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Izquierda
                      </button>
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'center' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm ${currentTextElement.align === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Centro
                      </button>
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { align: 'right' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm ${currentTextElement.align === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Derecha
                      </button>
                    </div>
                  </div>
                  {/* Text Decoration and Style */}
                  <div className="col-span-1">
                    <label htmlFor="textDecoration" className="block text-sm font-medium text-gray-700">Estilo de Texto</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'bold' ? 'none' : 'bold' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm font-bold ${currentTextElement.textDecoration === 'bold' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        B
                      </button>
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { fontStyle: currentTextElement.fontStyle === 'italic' ? 'normal' : 'italic' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm italic ${currentTextElement.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        I
                      </button>
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'underline' ? 'none' : 'underline' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm underline ${currentTextElement.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        U
                      </button>
                      <button
                        onClick={() => { handleUpdateTextElement(selectedTextElementId!, { textDecoration: currentTextElement.textDecoration === 'line-through' ? 'none' : 'line-through' }); onTransformEndCommit(); }}
                        className={`px-3 py-1 rounded-md text-sm line-through ${currentTextElement.textDecoration === 'line-through' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        S
                      </button>
                    </div>
                  </div>
                  {/* Text Stroke */}
                  <div>
                    <label htmlFor="textStrokeColor" className="block text-sm font-medium text-gray-700">Color de Contorno</label>
                    <input
                      id="textStrokeColor"
                      type="color"
                      value={currentTextElement.stroke || '#000000'}
                      onChange={(e) => handleUpdateTextElement(selectedTextElementId!, { stroke: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="textStrokeWidth" className="block text-sm font-medium text-gray-700">Grosor de Contorno: {currentTextElement.strokeWidth?.toFixed(0) || 0}</label>
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
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Shape Specific Properties */}
              {isShapeSelected && currentShapeElement && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades de la Figura</h3>
                  {currentShapeElement.type === 'rect' && (
                    <>
                      <div>
                        <label htmlFor="shapeWidth" className="block text-sm font-medium text-gray-700">Ancho: {currentShapeElement.width?.toFixed(0)}</label>
                        <input
                          id="shapeWidth"
                          type="range"
                          min="10"
                          max={CANVAS_SIZE / 2}
                          value={currentShapeElement.width}
                          onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { width: Number(e.target.value) })}
                          onMouseUp={onTransformEndCommit}
                          onTouchEnd={onTransformEndCommit}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label htmlFor="shapeHeight" className="block text-sm font-medium text-gray-700">Alto: {currentShapeElement.height?.toFixed(0)}</label>
                        <input
                          id="shapeHeight"
                          type="range"
                          min="10"
                          max={CANVAS_SIZE / 2}
                          value={currentShapeElement.height}
                          onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { height: Number(e.target.value) })}
                          onMouseUp={onTransformEndCommit}
                          onTouchEnd={onTransformEndCommit}
                          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                  {currentShapeElement.type === 'circle' && (
                    <div>
                      <label htmlFor="shapeRadius" className="block text-sm font-medium text-gray-700">Radio: {currentShapeElement.radius?.toFixed(0)}</label>
                      <input
                        id="shapeRadius"
                        type="range"
                        min="5"
                        max={CANVAS_SIZE / 4}
                        value={currentShapeElement.radius}
                        onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { radius: Number(e.target.value) })}
                        onMouseUp={onTransformEndCommit}
                        onTouchEnd={onTransformEndCommit}
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                  {currentShapeElement.type !== 'line' && (
                    <div>
                      <label htmlFor="shapeFillColor" className="block text-sm font-medium text-gray-700">Color de Relleno</label>
                      <input
                        id="shapeFillColor"
                        type="color"
                        value={currentShapeElement.fill}
                        onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { fill: e.target.value })}
                        onBlur={onTransformEndCommit}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="shapeStrokeColor" className="block text-sm font-medium text-gray-700">Color de Borde</label>
                    <input
                      id="shapeStrokeColor"
                      type="color"
                      value={currentShapeElement.stroke}
                      onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { stroke: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="shapeStrokeWidth" className="block text-sm font-medium text-gray-700">Grosor de Borde: {currentShapeElement.strokeWidth.toFixed(0)}</label>
                    <input
                      id="shapeStrokeWidth"
                      type="range"
                      min="0"
                      max="10"
                      value={currentShapeElement.strokeWidth}
                      onChange={(e) => handleUpdateShapeElement(selectedShapeElementId!, { strokeWidth: Number(e.target.value) })}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Date Specific Properties */}
              {isDateSelected && currentDateElement && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades de la Fecha</h3>
                  <div>
                    <label htmlFor="dateContent" className="block text-sm font-medium text-gray-700">Contenido de la Fecha</label>
                    <input
                      id="dateContent"
                      type="text"
                      value={currentDateElement.text}
                      onChange={(e) => handleUpdateDateElement({ text: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">Formato de Fecha</label>
                    <select
                      id="dateFormat"
                      value={currentDateElement.format}
                      onChange={(e) => {
                        const newFormat = e.target.value;
                        const today = new Date();
                        handleUpdateDateElement({ format: newFormat, text: formatDate(today, newFormat) });
                      }}
                      onBlur={onTransformEndCommit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (ej. 12/07/2025)</option>
                      <option value="MMMM DD, YYYY">MMMM DD, YYYY (ej. Julio 12, 2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ej. 2025-07-12)</option>
                      <option value="DD MMMM YYYY">DD MMMM YYYY (ej. 12 Julio 2025)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dateFontSize" className="block text-sm font-medium text-gray-700">Tamaño de Fuente: {currentDateElement.fontSize.toFixed(0)}</label>
                    <input
                      id="dateFontSize"
                      type="range"
                      min="10"
                      max="100"
                      value={currentDateElement.fontSize}
                      onChange={(e) => handleUpdateDateElement({ fontSize: Number(e.target.value) })}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateTextColor" className="block text-sm font-medium text-gray-700">Color de Texto</label>
                    <input
                      id="dateTextColor"
                      type="color"
                      value={currentDateElement.fill}
                      onChange={(e) => handleUpdateDateElement({ fill: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateFontFamily" className="block text-sm font-medium text-gray-700">Familia de Fuente</label>
                    <select
                      id="dateFontFamily"
                      value={currentDateElement.fontFamily}
                      onChange={(e) => handleUpdateDateElement({ fontFamily: e.target.value })}
                      onBlur={onTransformEndCommit}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                </>
              )}

              {/* Image Specific Properties */}
              {isImageSelected && currentImageElement && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Propiedades de la Imagen</h3>
                  <p className="text-sm text-gray-500">Usa los controles de abajo para editar esta imagen.</p>
                </>
              )}

              {/* Common Properties for selected editable elements (Product, Text, Shape, Date, Image) */}
              {selectedCanvasElement && selectedCanvasElement !== 'background' && ( // Exclude fixed background from common properties
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Ajustes Comunes</h3>
                  <div>
                    <label htmlFor={`${selectedCanvasElement}Opacity`} className="block text-sm font-medium text-gray-700">Opacidad: {(currentElementProps.opacity * 100).toFixed(0)}%</label>
                    <input
                      id={`${selectedCanvasElement}Opacity`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={currentElementProps.opacity}
                      onChange={(e) => currentElementProps.setOpacity(Number(e.target.value))}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() => handleFlip('x')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 text-sm font-semibold"
                      title="Voltear Horizontal"
                    >
                      <FlipHorizontal size={16} /> Voltear Horizontal
                    </button>
                    <button
                      onClick={() => handleFlip('y')}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 text-sm font-semibold"
                      title="Voltear Vertical"
                    >
                      <FlipVertical size={16} /> Voltear Vertical
                    </button>
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`${selectedCanvasElement}Blur`} className="block text-sm font-medium text-gray-700">Radio de Desenfoque: {currentElementProps.blurRadius.toFixed(0)}</label>
                    <input
                      id={`${selectedCanvasElement}Blur`}
                      type="range"
                      min="0"
                      max="20"
                      value={currentElementProps.blurRadius}
                      onChange={(e) => currentElementProps.setBlurRadius(Number(e.target.value))}
                      onMouseUp={onTransformEndCommit}
                      onTouchEnd={onTransformEndCommit}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      Habilitar Sombras
                      <input
                        type="checkbox"
                        checked={currentElementProps.shadowEnabled}
                        onChange={(e) => currentElementProps.setShadowEnabled(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                    </h4>
                    {currentElementProps.shadowEnabled && (
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label htmlFor={`${selectedCanvasElement}ShadowColor`} className="block text-sm font-medium text-gray-700">Color de Sombra</label>
                          <input
                            id={`${selectedCanvasElement}ShadowColor`}
                            type="color"
                            value={currentElementProps.shadowColor}
                            onChange={(e) => currentElementProps.setShadowColor(e.target.value)}
                            onBlur={onTransformEndCommit}
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${selectedCanvasElement}ShadowBlur`} className="block text-sm font-medium text-gray-700">Desenfoque de Sombra: {currentElementProps.shadowBlur.toFixed(0)}</label>
                          <input
                            id={`${selectedCanvasElement}ShadowBlur`}
                            type="range"
                            min="0"
                            max="50"
                            value={currentElementProps.shadowBlur}
                            onChange={(e) => currentElementProps.setShadowBlur(Number(e.target.value))}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${selectedCanvasElement}ShadowOffsetX`} className="block text-sm font-medium text-gray-700">Desplazamiento X: {currentElementProps.shadowOffsetX.toFixed(0)}</label>
                          <input
                            id={`${selectedCanvasElement}ShadowOffsetX`}
                            type="range"
                            min="-50"
                            max="50"
                            value={currentElementProps.shadowOffsetX}
                            onChange={(e) => currentElementProps.setShadowOffsetX(Number(e.target.value))}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${selectedCanvasElement}ShadowOffsetY`} className="block text-sm font-medium text-gray-700">Desplazamiento Y: {currentElementProps.shadowOffsetY.toFixed(0)}</label>
                          <input
                            id={`${selectedCanvasElement}ShadowOffsetY`}
                            type="range"
                            min="-50"
                            max="50"
                            value={currentElementProps.shadowOffsetY}
                            onChange={(e) => currentElementProps.setShadowOffsetY(Number(e.target.value))}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${selectedCanvasElement}ShadowOpacity`} className="block text-sm font-medium text-gray-700">Opacidad de Sombra: {(currentElementProps.shadowOpacity * 100).toFixed(0)}%</label>
                          <input
                            id={`${selectedCanvasElement}ShadowOpacity`}
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={currentElementProps.shadowOpacity}
                            onChange={(e) => currentElementProps.setShadowOpacity(Number(e.target.value))}
                            onMouseUp={onTransformEndCommit}
                            onTouchEnd={onTransformEndCommit}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      Habilitar Reflejo
                      <input
                        type="checkbox"
                        checked={currentElementProps.reflectionEnabled}
                        onChange={(e) => currentElementProps.setReflectionEnabled(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                    </h4>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Filtro</label>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleApplyFilter('none')}
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${currentElementProps.filter === 'none' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Ninguno
                      </button>
                      <button
                        onClick={() => handleApplyFilter('grayscale')}
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${currentElementProps.filter === 'grayscale' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Gris
                      </button>
                      <button
                        onClick={() => handleApplyFilter('sepia')}
                        className={`px-3 py-1 rounded-md text-sm font-semibold ${currentElementProps.filter === 'sepia' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      >
                        Sepia
                      </button>
                    </div>
                  </div>

                  <CollapsibleSection title="Ajustar (No implementado)" isOpen={isAdjustOpen} setIsOpen={setIsAdjustOpen} icon={Sun} className="mt-4">
                    <p className="text-sm text-gray-500">Brillo, Contraste, Saturación (no implementado)</p>
                  </CollapsibleSection>

                  <CollapsibleSection title="Textura (No implementado)" isOpen={isTextureOpen} setIsOpen={setIsTextureOpen} icon={Layout} className="mt-4">
                    <p className="text-sm text-gray-500">Añadir texturas (no implementado)</p>
                  </CollapsibleSection>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Upload Type Modal */}
      {showImageUploadTypeModal && tempUploadedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">¿Cómo quieres usar esta imagen?</h3>
            <p className="text-sm text-gray-600 mb-6">Puedes establecerla como tu producto principal o añadirla como un elemento de imagen movible.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSetAsProduct(tempUploadedFile)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Establecer como Producto Principal
              </button>
              <button
                onClick={() => handleAddImageAsElement(tempUploadedFile)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                Añadir como Elemento de Imagen
              </button>
              <button
                onClick={() => { setShowImageUploadTypeModal(false); setTempUploadedFile(null); }}
                className="text-gray-500 hover:text-gray-700 mt-2 text-sm"
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
