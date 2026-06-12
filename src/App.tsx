import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Settings, 
  X, 
  ExternalLink, 
  HelpCircle, 
  Check, 
  Info, 
  Heart, 
  Users, 
  GraduationCap, 
  ShieldAlert, 
  ArrowRight,
  RefreshCw,
  Lock,
  Compass,
  Image as ImageIcon,
  LogIn
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import bgImage from "./assets/images/sesi_bg_original_1781023275603.png";

// Default configuration placeholders
const DEFAULT_PSICOLOGO_URL = "https://new-psc.vercel.app/login";
const DEFAULT_AEE_URL = "https://sge-aee.vercel.app/login";

// Simple IndexedDB Helper to persist background image safely without hitting localStorage 5MB size limits
const DB_NAME = "SesiPortalDB";
const STORE_NAME = "settings";
const BG_KEY = "SESI_PORTAL_BG_DATA";

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
    } catch (err) {
      reject(err);
    }
  });
}

function saveBgToIndexedDB(base64Data: string): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(base64Data, BG_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error("Failed to write to IndexedDB"));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function getBgFromIndexedDB(): Promise<string> {
  return initDB().then((db) => {
    return new Promise<string>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(BG_KEY);
        request.onsuccess = () => resolve(request.result || "");
        request.onerror = () => reject(request.error || new Error("Failed to read from IndexedDB"));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function clearBgFromIndexedDB(): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(BG_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error("Failed to delete from IndexedDB"));
      } catch (err) {
        reject(err);
      }
    });
  });
}

export default function App() {
  // Configurable URLs stored in localStorage or fallback to defaults
  const [portalPsicologoUrl, setPortalPsicologoUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SESI_PORTAL_PSICOLOGO_URL");
      if (saved && saved.trim() !== "" && saved.trim() !== "undefined" && saved.trim() !== "null") {
        return saved.trim();
      }
      return DEFAULT_PSICOLOGO_URL;
    } catch {
      return DEFAULT_PSICOLOGO_URL;
    }
  });
  const [portalAeeUrl, setPortalAeeUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SESI_PORTAL_AEE_URL");
      if (saved && saved.trim() !== "" && saved.trim() !== "undefined" && saved.trim() !== "null") {
        return saved.trim();
      }
      return DEFAULT_AEE_URL;
    } catch {
      return DEFAULT_AEE_URL;
    }
  });

  // Background Image Configuration
  const [bgInputUrl, setBgInputUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SESI_PORTAL_BG_URL");
      if (saved && saved.trim() !== "" && saved.trim() !== "undefined" && saved.trim() !== "null") {
        return saved.trim();
      }
      return "";
    } catch {
      return "";
    }
  });
  const [activeBg, setActiveBg] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SESI_PORTAL_BG_URL");
      if (saved && saved.trim() !== "" && saved.trim() !== "undefined" && saved.trim() !== "null") {
        return saved.trim();
      }
      return bgImage;
    } catch {
      return bgImage;
    }
  });
  const [bgSize, setBgSize] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("SESI_PORTAL_BG_SIZE");
      if (saved && saved.trim() !== "" && saved.trim() !== "undefined" && saved.trim() !== "null") {
        return saved.trim();
      }
      return "contain";
    } catch {
      return "contain";
    }
  });

  const [isDraggingBg, setIsDraggingBg] = useState(false);

  // High-fidelity clientside canvas compressor to fit background under 5MB localStorage limits smoothly
  const processBgFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToastMessage("Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          } else {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            // Compress to JPEG at 0.75 quality for visual crispness at extreme lightweight footprint
            const compressed = canvas.toDataURL("image/jpeg", 0.75);
            setTempBgUrl(compressed);
            setToastMessage("Nova imagem carregada e otimizada!");
          } catch (err) {
            console.error(err);
            setToastMessage("Erro ao otimizar a imagem.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Google Login and Security states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("SESI_AUTH_STATUS") === "true";
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem("SESI_AUTH_EMAIL") || "";
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // UI State Managers
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [warningModal, setWarningModal] = useState<{ isOpen: boolean; role: "psicologo" | "aee" | null }>({
    isOpen: false,
    role: null
  });
  const [tempPsicologoUrl, setTempPsicologoUrl] = useState("");
  const [tempAeeUrl, setTempAeeUrl] = useState("");
  const [tempBgUrl, setTempBgUrl] = useState("");
  const [tempBgSize, setTempBgSize] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync temp variables when the config modal is opened
  useEffect(() => {
    if (isConfigOpen) {
      setTempPsicologoUrl(portalPsicologoUrl);
      setTempAeeUrl(portalAeeUrl);
      setTempBgUrl(bgInputUrl);
      setTempBgSize(bgSize);
    }
  }, [isConfigOpen, portalPsicologoUrl, portalAeeUrl, bgInputUrl, bgSize]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Restore background image from IndexedDB on initial load if saved there
  useEffect(() => {
    try {
      const storageType = localStorage.getItem("SESI_PORTAL_BG_URL_STORAGE_TYPE");
      if (storageType === "indexeddb") {
        getBgFromIndexedDB()
          .then((storedBg) => {
            if (storedBg && storedBg.trim() !== "") {
              setActiveBg(storedBg);
              setBgInputUrl(storedBg);
            }
          })
          .catch((err) => {
            console.error("Erro ao recuperar plano de fundo do IndexedDB:", err);
          });
      }
    } catch (err) {
      console.warn("Storage API error on initialization:", err);
    }
  }, []);

  // Handle click on Config - Prompt Google Sign-In if not authenticated
  const handleOpenConfig = () => {
    if (isAuthenticated) {
      setIsConfigOpen(true);
    } else {
      setTypedEmail("");
      setAuthError(null);
      setIsAuthModalOpen(true);
    }
  };

  // Google Simulated High Fidelity Sign In
  const handleGoogleSignIn = (selectedEmail: string) => {
    if (!selectedEmail || !selectedEmail.includes("@")) {
      setAuthError("Por favor, digite um e-mail válido.");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    // High fidelity auth simulation
    setTimeout(() => {
      setIsAuthenticating(false);
      setIsAuthenticated(true);
      setCurrentUserEmail(selectedEmail);
      localStorage.setItem("SESI_AUTH_STATUS", "true");
      localStorage.setItem("SESI_AUTH_EMAIL", selectedEmail);
      setIsAuthModalOpen(false);
      setIsConfigOpen(true);
      setToastMessage(`Bem-vindo, ${selectedEmail}!`);
    }, 1200);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail("");
    localStorage.removeItem("SESI_AUTH_STATUS");
    localStorage.removeItem("SESI_AUTH_EMAIL");
    setIsConfigOpen(false);
    setToastMessage("Sessão encerrada com sucesso.");
  };

  // Handle URL Redirection or validation
  const handlePortalRedirect = (role: "psicologo" | "aee") => {
    const targetUrl = role === "psicologo" ? portalPsicologoUrl : portalAeeUrl;
    
    if (!targetUrl || targetUrl.trim() === "") {
      // Show custom accessible dialog if URL is unconfigured
      setWarningModal({
        isOpen: true,
        role: role
      });
    } else {
      // Ensure absolute URLs have protocols
      let formattedUrl = targetUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      // Navigate/Redirect cleanly
      window.open(formattedUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Save Config to storage
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update React memory state instantly for immediate application response
    setPortalPsicologoUrl(tempPsicologoUrl);
    setPortalAeeUrl(tempAeeUrl);
    setBgInputUrl(tempBgUrl);
    setActiveBg(tempBgUrl.trim() !== "" ? tempBgUrl : bgImage);
    setBgSize(tempBgSize);
    setIsConfigOpen(false);

    // 2. Safely perform durable storage modifications wrapper by wrapper so none of them can block each other.
    try {
      localStorage.setItem("SESI_PORTAL_PSICOLOGO_URL", tempPsicologoUrl);
    } catch (err) {
      console.warn("Could not save portal psicologo URL to localStorage:", err);
    }

    try {
      localStorage.setItem("SESI_PORTAL_AEE_URL", tempAeeUrl);
    } catch (err) {
      console.warn("Could not save portal AEE URL to localStorage:", err);
    }

    try {
      localStorage.setItem("SESI_PORTAL_BG_SIZE", tempBgSize);
    } catch (err) {
      console.warn("Could not save background size mode to localStorage:", err);
    }

    // Safely save background to storage (IndexedDB for base64 uploads, normal string for URLs)
    if (tempBgUrl.startsWith("data:")) {
      try {
        await saveBgToIndexedDB(tempBgUrl);
        
        // Save flag in localStorage so it persists correctly
        localStorage.setItem("SESI_PORTAL_BG_URL_STORAGE_TYPE", "indexeddb");
        
        // Remove from localStorage to keep storage clean and under 5MB limits
        localStorage.removeItem("SESI_PORTAL_BG_URL");
      } catch (err) {
        console.warn("Failed to store background in IndexedDB, attempting localStorage fallback:", err);
        try {
          localStorage.setItem("SESI_PORTAL_BG_URL", tempBgUrl);
          localStorage.removeItem("SESI_PORTAL_BG_URL_STORAGE_TYPE");
        } catch (storageErr) {
          console.error("Critical: Could not store base64 in either storage:", storageErr);
          setToastMessage("Aviso: Imagem de fundo é muito pesada e ficará disponível apenas nesta sessão.");
        }
      }
    } else {
      // Direct Web URL or Empty default
      try {
        localStorage.setItem("SESI_PORTAL_BG_URL", tempBgUrl);
        localStorage.removeItem("SESI_PORTAL_BG_URL_STORAGE_TYPE");
        await clearBgFromIndexedDB().catch(() => {});
      } catch (err) {
        console.warn("Could not save background URL to localStorage:", err);
      }
    }

    // Show premium toast feedback
    setToastMessage("Configurações salvas com sucesso!");
  };

  // Pre-configure demo URLs for quick testing
  const handleLoadDemoUrls = () => {
    setTempPsicologoUrl("https://pe.sesi.org.br");
    setTempAeeUrl("https://pe.sesi.org.br");
    setToastMessage("URLs demo preenchidas! Clique em Salvar.");
  };

  const handleClearUrls = () => {
    setTempPsicologoUrl("");
    setTempAeeUrl("");
    setToastMessage("Campos limpos. Lembre-se de salvar!");
  };

  return (
    <div 
      id="sesi-landing-root"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none bg-[#f1f8fc]"
      style={{
        // Dynamic background support with safe quotes wrapping and seamless color matching
        backgroundImage: `url("${activeBg}"), linear-gradient(to bottom, #f1f8fc 0%, #ffffff 50%, #f1f8fc 100%)`,
        backgroundSize: bgSize,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "#ffffff"
      }}
    >
      {/* Soft gradient overall overlay to ensure absolute readability and gentle focus on content */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-[#ffffff]/15 pointer-events-none" />

      {/* FIXED AND LIGHT HEADER
          Note: Since the background image already contains the SESI Pernambuco Logo in the top-left,
          we avoid duplicating it visually. We write clean modern typography. */}
      <header 
        id="sesi-main-header"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 md:pt-8 flex justify-between items-center"
      >
        {/* Empty left branding placeholder to let the background logo shine unobstructedly on Desktop */}
        <div className="hidden lg:block w-48 h-12" aria-hidden="true" />
        
        {/* Mobile Header Branding (appears when background image logo is scaled/shifted on mobile) */}
        <div className="lg:hidden flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold tracking-tight text-xl text-[#005ca9]">SESI</span>
            <span className="w-1.5 h-1.5 bg-[#f26522] rounded-full" />
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Pernambuco</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Serviço Social da Indústria</span>
        </div>

        {/* Quick Config Button & Status Tracker */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium font-sans">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="max-w-[120px] truncate">{currentUserEmail}</span>
            </div>
          )}
          <button
            onClick={handleOpenConfig}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md bg-white/70 hover:bg-white/95 border border-slate-200/60 hover:border-slate-300 shadow-sm text-xs font-semibold text-slate-700 transition-all duration-300 cursor-pointer"
            id="btn-settings-toggle"
            title="Configurar links e tema"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 group-hover:rotate-45 transition-transform duration-500" />
            <span>Configurar Portais</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main 
        id="sesi-content-grid"
        className="relative z-10 w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col items-center justify-center py-6 md:py-10 animate-fade-in"
      >
        {/* Title area, perfectly centered, matching the sketch */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2 mb-12 select-text"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-[#003c80] font-sans tracking-tight">
            Acesso aos
          </h2>
          <div className="text-4xl md:text-5xl font-extrabold text-[#00a859] tracking-tight font-display animate-pulse" style={{ color: "#005ca9" }}>
            Portais de Atendimento
          </div>
          
          {/* Green and Blue Split Line under the title */}
          <div className="flex justify-center items-center my-4 h-[3px]">
            <div className="w-12 h-full bg-[#00a859] rounded-l-full" />
            <div className="w-12 h-full bg-[#005ca9] rounded-r-full" />
          </div>
          
          <p className="text-slate-600 text-sm md:text-base font-semibold max-w-lg mx-auto">
            Selecione o seu perfil para acessar o sistema correspondente.
          </p>
        </motion.div>

        {/* Dynamic Two Cards Configuration - Center Aligned & Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 w-full max-w-4xl select-text pt-6 mb-10">
          
          {/* CARD 1: PSICÓLOGO */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border-2 border-[#005ca9]/60 hover:border-[#005ca9] hover:shadow-[0_20px_45px_rgba(0,92,169,0.12)] shadow-[0_10px_35px_rgba(0,92,169,0.03)] rounded-[2.5rem] pt-16 pb-8 px-6 relative flex flex-col items-center text-center justify-between min-h-[300px] transition-all duration-300"
            id="card-portal-psicologo"
          >
            {/* Top Floating Circular Icon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#005ca9] border-[6px] border-[#f1f8fc] shadow-md flex items-center justify-center text-white">
              <Brain className="w-10 h-10" />
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-2xl font-extrabold text-[#005ca9] font-display">
                Sou Psicólogo
              </h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-[240px] mx-auto">
                Acesse o sistema de atendimento psicológico escolar.
              </p>
            </div>

            <button
              onClick={() => handlePortalRedirect("psicologo")}
              className="w-full max-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 bg-[#005ca9] hover:bg-[#00417a] text-white font-extrabold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              id="btn-access-portal-psicologo"
            >
              <span>Acessar Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* CARD 2: PROFISSIONAL DO AEE (Styled Laranja directly per user preference) */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border-2 border-[#f26522]/60 hover:border-[#f26522] hover:shadow-[0_20px_45px_rgba(242,101,34,0.12)] shadow-[0_10px_35px_rgba(242,101,34,0.03)] rounded-[2.5rem] pt-16 pb-8 px-6 relative flex flex-col items-center text-center justify-between min-h-[300px] transition-all duration-300"
            id="card-portal-aee"
          >
            {/* Top Floating Circular Icon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#f26522] border-[6px] border-[#f1f8fc] shadow-md flex items-center justify-center text-white">
              <Users className="w-9 h-9" />
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-2xl font-extrabold text-[#f26522] font-display">
                Sou Profissional do AEE
              </h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-[240px] mx-auto">
                Acesse o sistema de Atendimento Educacional Especializado.
              </p>
            </div>

            <button
              onClick={() => handlePortalRedirect("aee")}
              className="w-full max-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 bg-[#f26522] hover:bg-[#d95316] text-white font-extrabold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              id="btn-access-portal-aee"
            >
              <span>Acessar Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

        </div>
      </main>

      {/* FOOTER */}
      <footer 
        id="sesi-footer"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col sm:flex-row justify-between items-center bg-transparent border-t border-slate-200/20 text-slate-500/80 text-xs sm:text-xs tracking-wide"
      >
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 mb-2 sm:mb-0 text-center sm:text-left">
          <span className="font-bold text-slate-800 font-display">SESI Pernambuco</span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="font-medium">Serviço Social da Indústria</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="font-semibold text-[#005ca9]">SESI PE</span>
          <span className="text-slate-400">&#8226; Todos os direitos reservados.</span>
        </div>
      </footer>

      {/* REMAINDER COMPONENT: CONFIGURATION AND WARNING MODALS (GLASS UI) */}
      <AnimatePresence>
        
        {/* PREMIUM SUCCESS TOAST */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/50 text-sm font-medium"
            id="toast-notification"
          >
            <div className="p-1 bg-[#00a859] rounded-full text-white">
              <Check className="w-4 h-4" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}

        {/* GOOGLE SIGN IN MODAL (REQUIRES USER'S EMAIL) */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              id="auth-modal-backdrop"
            />

            {/* Google Authentication Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 md:p-8 z-10 text-slate-800 flex flex-col gap-6"
              id="google-auth-box"
            >
              {/* Google Brand Header */}
              <div className="flex flex-col items-center text-center gap-3 mt-2">
                {/* Simulated Google Logo */}
                <div className="flex items-center gap-1 text-2xl font-semibold tracking-tight">
                  <span className="text-blue-500 font-bold">G</span>
                  <span className="text-red-500 font-bold">o</span>
                  <span className="text-yellow-500 font-bold">o</span>
                  <span className="text-blue-500 font-bold">g</span>
                  <span className="text-green-500 font-bold">l</span>
                  <span className="text-red-500 font-bold">e</span>
                </div>
                <h3 className="font-display font-extrabold text-xl tracking-tight text-slate-800">
                  Fazer login com o Google
                </h3>
                <p className="text-xs text-slate-500">
                  Para acessar o painel administrativo do SESI Pernambuco
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 font-medium leading-relaxed">
                  {authError}
                </div>
              )}

              {/* AUTH LIST */}
              <div className="space-y-4">
                
                {/* Authorized Administrator Account (Pre-configured from metadata) */}
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={() => handleGoogleSignIn("maykon.euro@gmail.com")}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* User Profile Avatar with Initials */}
                    <div className="w-10 h-10 rounded-full bg-[#005ca9] text-white flex items-center justify-center font-bold text-sm tracking-widest shadow-sm">
                      ME
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <span>Maykon Euro</span>
                        <span className="text-[10px] bg-blue-100 text-[#005ca9] font-extrabold px-1.5 py-0.5 rounded-full uppercase">Administrador</span>
                      </div>
                      <div className="text-xs text-slate-550">maykon.euro@gmail.com</div>
                    </div>
                  </div>
                  <div className="mr-1 text-slate-400 group-hover:text-slate-600 transition-colors">
                    {isAuthenticating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#005ca9]" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Custom Google Email input */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">ou use outro e-mail</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-500 font-bold uppercase block tracking-wider">E-mail do Google</label>
                  <div className="flex gap-2">
                    <input 
                      type="email"
                      placeholder="seu.email@gmail.com"
                      value={typedEmail}
                      onChange={(e) => setTypedEmail(e.target.value)}
                      disabled={isAuthenticating}
                      className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 focus:outline-none font-medium text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      disabled={isAuthenticating}
                      onClick={() => handleGoogleSignIn(typedEmail)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Acessar
                    </button>
                  </div>
                </div>

              </div>

              {/* Close Button or Back */}
              <div className="flex justify-center border-t border-slate-100 pt-4">
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  Cancelar login
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* WARNING DIALOG (PORTAL NOT CONFIGURED) */}
        {warningModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWarningModal({ isOpen: false, role: null })}
              className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm"
              id="warning-modal-backdrop"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 z-10 overflow-hidden text-slate-800"
              id="warning-modal-box"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setWarningModal({ isOpen: false, role: null })}
                  className="p-1.5 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center gap-5 pt-3">
                <div className={`p-4 rounded-2xl ${warningModal.role === "psicologo" ? "bg-blue-50 text-[#005ca9]" : "bg-orange-50 text-[#f26522]"}`}>
                  <ShieldAlert className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
                    Portal não configurado
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                    O link de redirecionamento para o portal do <strong className="font-semibold text-slate-700">{warningModal.role === "psicologo" ? "Psicólogo" : "Profissional do AEE"}</strong> ainda não foi definido pelo administrador de sistemas.
                  </p>
                </div>

                {/* Instant Quick Setup Helper direct within warning to make testing frictionless */}
                <div className="w-full bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Acesso Administrativo</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Você pode fazer login com sua conta Google configurada (<strong className="text-slate-700">maykon.euro@gmail.com</strong>) para cadastrar e definir os links reais dos portais.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 w-full pt-1">
                  <button
                    onClick={() => {
                      setWarningModal({ isOpen: false, role: null });
                      handleOpenConfig();
                    }}
                    className="flex-1 py-3 text-xs font-bold text-slate-100 bg-slate-900 hover:bg-slate-950 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Fazer Login Google
                  </button>
                  <button
                    onClick={() => setWarningModal({ isOpen: false, role: null })}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* SYSTEM SETUP / CONFIGURATION DRAWER MODAL */}
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              id="config-modal-backdrop"
            />

            {/* Config Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 z-10 text-slate-800 max-h-[92vh] overflow-y-auto"
              id="config-modal-box"
            >
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsConfigOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-xl tracking-tight text-slate-800">
                        Configuração do Sistema
                      </h3>
                      <p className="text-xs text-slate-400">
                        Ajuste as URLs de redirecionamento e a imagem de fundo
                      </p>
                    </div>
                  </div>
                </div>

                {/* User info & Signout */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                      Adm
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-700">Sessão Ativa com Google</div>
                      <div className="text-[11px] text-slate-500">{currentUserEmail}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Encerrar
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-5">
                  
                  {/* FIELD 1: PSICÓLOGO */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-600 tracking-wider uppercase">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-[#005ca9]" />
                        URL - Portal Psicólogo
                      </span>
                      {portalPsicologoUrl ? (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-100">
                          <Check className="w-3 h-3" /> Configurado
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          Vazio
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex: https://psicologia.pe.sesi.org.br"
                        value={tempPsicologoUrl}
                        onChange={(e) => setTempPsicologoUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#005ca9] focus:outline-none text-sm transition-all font-medium placeholder-slate-400"
                        id="input-url-psicologo"
                      />
                    </div>
                  </div>

                  {/* FIELD 2: AEE */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-600 tracking-wider uppercase">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#f26522]" />
                        URL - Portal AEE
                      </span>
                      {portalAeeUrl ? (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-100">
                          <Check className="w-3 h-3" /> Configurado
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          Vazio
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ex: https://aee.pe.sesi.org.br"
                        value={tempAeeUrl}
                        onChange={(e) => setTempAeeUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-[#f26522] focus:outline-none text-sm transition-all font-medium placeholder-slate-400"
                        id="input-url-aee"
                      />
                    </div>
                  </div>

                  {/* CUSTOM LANDING PAGE BACKGROUND SELECTION / LINK */}
                  <div className="space-y-4 border-t border-slate-100 pt-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-600 tracking-wider uppercase">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#005ca9]" />
                          Personalizar Plano de Fundo
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Você pode fazer upload de uma imagem do seu computador ou colar um link direto de imagem.
                      </p>
                    </div>

                    {/* LIVE BACKGROUND PREVIEW THUMBNAIL */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 flex-shrink-0 relative shadow-inner">
                        <img 
                          src={tempBgUrl.trim() !== "" ? tempBgUrl : bgImage} 
                          alt="Prévia do Fundo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = bgImage;
                          }}
                        />
                      </div>
                      <div className="text-left overflow-hidden flex-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fundo Ativo na Prévia</div>
                        <div className="text-[11px] text-slate-700 font-semibold truncate max-w-[240px]">
                          {tempBgUrl.startsWith("data:") 
                            ? "✨ Imagem carregada do computador" 
                            : tempBgUrl.trim() !== "" 
                              ? tempBgUrl 
                              : "Imagem Oficial SESI PE (Original)"
                          }
                        </div>
                      </div>
                      {tempBgUrl.trim() !== "" && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgUrl("");
                            setToastMessage("Redefinido para o fundo oficial do SESI!");
                          }}
                          className="px-2.5 py-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-lg font-bold transition-all cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* BACKGROUND SIZE MODE CONTROLLER */}
                    <div className="space-y-2 bg-slate-50/50 border border-slate-150 p-3 rounded-2xl">
                      <span className="text-[10px] text-slate-600 font-bold block uppercase tracking-wider font-sans">Como ajustar a imagem de fundo:</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgSize("contain");
                            setToastMessage("Modo: Proporcional (Sem esticar)");
                          }}
                          className={`p-2 py-3 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                            tempBgSize === "contain"
                              ? "bg-white border-[#005ca9] text-[#005ca9] shadow-sm ring-2 ring-blue-100"
                              : "bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="font-bold">Proporcional</span>
                          <span className="text-[8px] text-slate-400 font-medium leading-none">Sem esticar / Sem cortes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgSize("cover");
                            setToastMessage("Modo: Preencher Tela (Pode cortar)");
                          }}
                          className={`p-2 py-3 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                            tempBgSize === "cover"
                              ? "bg-white border-[#005ca9] text-[#005ca9] shadow-sm ring-2 ring-blue-100"
                              : "bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="font-bold">Preencher</span>
                          <span className="text-[8px] text-slate-400 font-medium leading-none">Mantém a proporção</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgSize("100% 100%");
                            setToastMessage("Modo: Forçado (Pode esticar)");
                          }}
                          className={`p-2 py-3 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                            tempBgSize === "100% 100%"
                              ? "bg-white border-[#005ca9] text-[#005ca9] shadow-sm ring-2 ring-blue-100"
                              : "bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="font-bold">Esticar</span>
                          <span className="text-[8px] text-slate-400 font-medium leading-none">Cobre tudo (Distorce)</span>
                        </button>
                      </div>
                    </div>

                    {/* DRAG-AND-DROP FILE UPLOADER */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingBg(true);
                      }}
                      onDragLeave={() => setIsDraggingBg(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingBg(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          processBgFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById("file-upload-bg")?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                        isDraggingBg 
                          ? "border-[#005ca9] bg-blue-50/70 shadow-inner scale-[0.99]" 
                          : "border-slate-300 hover:border-[#005ca9] hover:bg-slate-50/70"
                      }`}
                    >
                      <input 
                        type="file" 
                        id="file-upload-bg" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processBgFile(e.target.files[0]);
                          }
                        }}
                      />
                      <div className="p-2.5 bg-blue-50 text-[#005ca9] rounded-full">
                        <ImageIcon className="w-5 h-5 text-[#005ca9]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">Fazer Upload do Computador</p>
                        <p className="text-[10px] text-slate-400 font-medium">Arraste e solte ou clique para selecionar (PNG, JPG, WEBP)</p>
                      </div>
                    </div>

                    {/* LINK INPUT FIELD */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Ou insira uma URL de imagem pública:</span>
                      {tempBgUrl.startsWith("data:") ? (
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-left text-xs text-blue-800 font-semibold flex items-center justify-between animate-fade-in">
                          <span>Imagem carregada ativa</span>
                          <span className="text-[10px] text-slate-400 font-normal italic">(use o botão limpar acima para voltar para URL)</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Ex: https://imagens.com/meu-fundo-sesi.jpg"
                          value={tempBgUrl}
                          onChange={(e) => setTempBgUrl(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#005ca9] focus:outline-none text-sm transition-all font-medium placeholder-slate-400 w-full"
                          id="input-url-bg"
                        />
                      )}
                    </div>

                    {/* Background preset choices for quick testing */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-sans">Planos de fundo pré-definidos para teste rápido:</span>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgUrl("");
                            setToastMessage("Selecionado: Imagem Oficial SESI PE");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                            tempBgUrl === "" 
                              ? "bg-blue-50 border-[#005ca9] text-[#005ca9] shadow-sm" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Compass className="w-4 h-4 text-[#005ca9]" />
                          <span>Imagem Oficial SESI PE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setTempBgUrl("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1470&auto=format&fit=cover");
                            setToastMessage("Selecionando: Gradiente abstrato calmo");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 justify-center transition-all cursor-pointer ${
                            tempBgUrl === "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1470&auto=format&fit=cover" 
                              ? "bg-blue-50 border-[#005ca9] text-[#005ca9] shadow-sm" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-[#f26522]" />
                          <span>Gradiente Abstrato SESI</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SYSTEM PRESETS BOX */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <HelpCircle className="w-4 h-4 text-[#005ca9]" />
                        <span>Ações Rápidas</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Configure os links reais do SESI Pernambuco automaticamente para teste de fluxo direto:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLoadDemoUrls}
                        className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-[#005ca9]" />
                        Simular links SESI PE
                      </button>
                      <button
                        type="button"
                        onClick={handleClearUrls}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-650 transition-all cursor-pointer"
                      >
                        Limpar links
                      </button>
                    </div>
                  </div>

                  {/* MODAL BOTTOM BUTTONS */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsConfigOpen(false)}
                      className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#0a2540] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer text-center"
                      id="btn-save-settings"
                    >
                      Salvar Configuração
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}

