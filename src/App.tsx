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
import bgImage from "./assets/images/background.png";

// Default configuration placeholders
const DEFAULT_PSICOLOGO_URL = "";
const DEFAULT_AEE_URL = "";

export default function App() {
  // Configurable URLs stored in localStorage or fallback to defaults
  const [portalPsicologoUrl, setPortalPsicologoUrl] = useState<string>(() => {
    return localStorage.getItem("SESI_PORTAL_PSICOLOGO_URL") || DEFAULT_PSICOLOGO_URL;
  });
  const [portalAeeUrl, setPortalAeeUrl] = useState<string>(() => {
    return localStorage.getItem("SESI_PORTAL_AEE_URL") || DEFAULT_AEE_URL;
  });

  // Background Image Configuration
  const [bgInputUrl, setBgInputUrl] = useState<string>(() => {
    return localStorage.getItem("SESI_PORTAL_BG_URL") || "";
  });
  const [activeBg, setActiveBg] = useState<string>(() => {
    return localStorage.getItem("SESI_PORTAL_BG_URL") || bgImage;
  });

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync temp variables when the config modal is opened
  useEffect(() => {
    if (isConfigOpen) {
      setTempPsicologoUrl(portalPsicologoUrl);
      setTempAeeUrl(portalAeeUrl);
      setTempBgUrl(bgInputUrl);
    }
  }, [isConfigOpen, portalPsicologoUrl, portalAeeUrl, bgInputUrl]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("SESI_PORTAL_PSICOLOGO_URL", tempPsicologoUrl);
    localStorage.setItem("SESI_PORTAL_AEE_URL", tempAeeUrl);
    localStorage.setItem("SESI_PORTAL_BG_URL", tempBgUrl);

    setPortalPsicologoUrl(tempPsicologoUrl);
    setPortalAeeUrl(tempAeeUrl);
    setBgInputUrl(tempBgUrl);
    setActiveBg(tempBgUrl.trim() !== "" ? tempBgUrl : bgImage);
    
    setIsConfigOpen(false);
    
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
        // Dynamic background support
        backgroundImage: `url(${activeBg}), url('/assets/bg.jpg'), url('/assets/bg.png'), linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f6fdf9 65%, #fffbf2 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
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
        className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex items-center justify-center py-6 lg:py-12"
      >
        {/* Glassmorphism content container perfectly centered on the screen */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl flex flex-col select-text"
          id="hero-floating-box"
        >
          {/* Main Card with smooth glass effect */}
          <div className="backdrop-blur-md bg-white/80 border border-white/50 shadow-[0_20px_50px_rgba(0,92,169,0.08)] rounded-3xl p-6 md:p-10 flex flex-col gap-6 relative overflow-hidden">
            
            {/* Top delicate tagline */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f26522] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f26522]"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-[#005ca9] uppercase font-display">
                Portal de Atendimento Psicopedagógico
              </span>
            </div>

            {/* HERO SECTION Content */}
            <div className="space-y-3">
              <h1 
                id="hero-title"
                className="text-4xl md:text-5xl font-display font-extrabold text-slate-800 tracking-tight leading-none"
              >
                Acesso aos <br />
                <span className="bg-gradient-to-r from-[#005ca9] to-[#014178] bg-clip-text text-transparent">
                  Portais de Atendimento
                </span>
              </h1>
              <p 
                id="hero-subtitle"
                className="text-sm md:text-base text-slate-600 font-medium leading-relaxed"
              >
                Selecione o seu perfil profissional para acessar o sistema correspondente de forma segura e ágil.
              </p>
            </div>

            {/* ACTION PROFILE BUTTONS - Stacked on Mobile, layout changes dynamically */}
            <div className="flex flex-col gap-4 py-2" id="profile-action-group">
              
              {/* BUTTON 1: PSICÓLOGO */}
              <button
                onClick={() => handlePortalRedirect("psicologo")}
                className="group relative w-full flex items-center justify-between p-5 bg-[#005ca9] hover:bg-[#004a8b] text-white rounded-2xl shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden border border-blue-400/20"
                id="btn-access-psicologo"
              >
                {/* Accent glow on hover */}
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300 text-white">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-blue-100/80 font-semibold tracking-wider uppercase">Fazer Login como</div>
                    <div className="text-lg font-bold font-display tracking-tight">Sou Psicólogo</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-2 bg-white/10 group-hover:bg-white/25 rounded-full transition-all duration-300">
                  <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* BUTTON 2: AEE (Vibrant Orange Institutional Button) */}
              <button
                onClick={() => handlePortalRedirect("aee")}
                className="group relative w-full flex items-center justify-between p-5 bg-[#f26522] hover:bg-[#d95316] text-white rounded-2xl shadow-lg shadow-orange-950/10 hover:shadow-xl hover:shadow-orange-950/20 active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden border border-orange-400/10"
                id="btn-access-aee"
              >
                {/* Accent glow on hover */}
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform duration-300 text-white">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-orange-100/80 font-semibold tracking-wider uppercase">Fazer Login como</div>
                    <div className="text-lg font-bold font-display tracking-tight">Sou Profissional do AEE</div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-2 bg-white/10 group-hover:bg-white/25 rounded-full transition-all duration-300">
                  <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

            </div>

            {/* SEÇÃO INFORMATIVA (DIFERENCIAL 1) */}
            <div className="pt-4 border-t border-slate-200/60 flex gap-3 text-slate-500 text-xs leading-relaxed" id="section-informative">
              <Info className="w-5 h-5 text-[#005ca9] shrink-0" />
              <p className="font-medium text-slate-600">
                Este portal integra os serviços de Psicologia Escolar e Atendimento Educacional Especializado (AEE), promovendo acolhimento, inclusão e desenvolvimento integral dos estudantes do SESI Pernambuco.
              </p>
            </div>

            {/* Micro badges showing institutional commitments representing the bottom values for mobile */}
            <div className="grid grid-cols-5 gap-1.5 pt-1 text-[10px] text-center font-bold text-[#005ca9]/80 lg:hidden" id="mobile-badges">
              <div className="bg-blue-50 py-1.5 px-0.5 rounded-lg border border-blue-100/50 flex flex-col items-center gap-0.5">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>Acolhimento</span>
              </div>
              <div className="bg-green-50 py-1.5 px-0.5 rounded-lg border border-green-100/50 flex flex-col items-center gap-0.5">
                <Users className="w-3.5 h-3.5 text-[#00a859]" />
                <span>Inclusão</span>
              </div>
              <div className="bg-yellow-50 py-1.5 px-0.5 rounded-lg border border-yellow-101/50 flex flex-col items-center gap-0.5">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Respeito</span>
              </div>
              <div className="bg-purple-50 py-1.5 px-0.5 rounded-lg border border-purple-100/50 flex flex-col items-center gap-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Desenvolvimento</span>
              </div>
              <div className="bg-sky-50 py-1.5 px-0.5 rounded-lg border border-sky-100/50 flex flex-col items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Potencial</span>
              </div>
            </div>

          </div>
        </motion.div>
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
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-600 tracking-wider uppercase">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#005ca9]" />
                        Link da Imagem de Fundo (URL Pública)
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Insira uma URL pública direta de qualquer imagem para substituir o fundo da landing page, ou deixe em branco para redefinir para a imagem original oficial do SESI Pernambuco:
                    </p>
                    <input
                      type="text"
                      placeholder="Ex: https://exemplo.com/imagem-fundo-sesi.jpg"
                      value={tempBgUrl}
                      onChange={(e) => setTempBgUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#005ca9] focus:outline-none text-sm transition-all font-medium placeholder-slate-400"
                      id="input-url-bg"
                    />

                    {/* Background preset choices for quick testing */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Planos de fundo pré-definidos para teste rápido:</span>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setTempBgUrl("");
                            setToastMessage("Selecionado: Imagem Oficial SESI PE");
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 justify-center transition-all ${
                            tempBgUrl === "" 
                              ? "bg-blue-50 border-[#005ca9] text-[#005ca9]" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
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
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 justify-center transition-all ${
                            tempBgUrl === "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1470&auto=format&fit=cover" 
                              ? "bg-blue-50 border-[#005ca9] text-[#005ca9]" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
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

