import AuthLayout from "../../components/layout/AuthLayout";
import { Button, Form, Input } from "../../components/ui";
import { report } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";



function LoginPage({
  onLogin,
  onRegister,
  onBack,
  onForgotPassword,
  decorativeSide = "left",
}) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (onLogin) await onLogin({ ...formData, rememberMe });
    } catch(error) { report(error); } finally {
      setLoading(false);
    }
  };

  return (<AuthLayout variant="login" decorativeSide={decorativeSide} onBack={onBack}><div className="auth-form-body">

              {/* Heading */}
              <div className="mb-5">
                <div className="mb-3 inline-flex rounded-xl bg-blue-50 dark:bg-blue-950 p-2.5 text-[#2563EB] dark:text-blue-400">
                  <LockKeyhole size={20} />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#071A36] dark:text-white">
                  {t("auth.loginTitle", "Bon retour.")}
                </h1>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {t("auth.loginSubtitle", "Connectez-vous à votre compte JobConnect pour continuer.")}
                </p>
              </div>

              {/* Formulaire */}
              <Form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-[#071A36] dark:text-slate-200">
                    {t("auth.emailLabel", "Adresse email")}
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("auth.emailPlaceholder", "exemple@email.com")}
                      required
                      autoComplete="email"
                      className="h-10 w-full rounded-xl border border-[#071A36]/15 bg-white dark:bg-slate-900 dark:border-slate-800 pl-10 pr-4 text-sm font-medium text-[#071A36] dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <div className="mb-1.5 auth-password-options">
                    <label htmlFor="password" className="block text-xs font-bold text-[#071A36] dark:text-slate-200">
                      {t("auth.passwordLabel", "Mot de passe")}
                    </label>
                    <Button
                      type="button"
                      onClick={onForgotPassword}
                      className="text-xs font-bold text-[#2563EB] dark:text-blue-400 transition hover:text-blue-700"
                    >
                      {t("auth.forgotPasswordLink", "Mot de passe oublié ?")}
                    </Button>
                  </div>
                  <div className="relative">
                    <LockKeyhole size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t("auth.passwordPlaceholder", "Votre mot de passe")}
                      required
                      autoComplete="current-password"
                      className="h-10 w-full rounded-xl border border-[#071A36]/15 bg-white dark:bg-slate-900 dark:border-slate-800 pl-10 pr-10 text-sm font-medium text-[#071A36] dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
                    />
                    <Button
                      type="button"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </Button>
                  </div>
                </div>

                {/* Se souvenir */}
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-[#2563EB]"
                  />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("auth.rememberMe", "Se souvenir de moi")}</span>
                </label>

                {/* CTA */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="group flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-bold text-white shadow-lg shadow-[#2563EB]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t("auth.signingIn", "Connexion en cours...")}
                    </>
                  ) : (
                    <>
                      {t("auth.signInBtn", "Se connecter")}
                      <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </Form>


              {/* Séparateur */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs font-medium text-slate-400">{t("auth.orContinueWith", "ou continuer avec")}</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  type="button"
                  className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <LinkedInIcon />
                  LinkedIn
                </Button>
              </div>

              {/* Inscription */}
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("auth.noAccount", "Vous n'avez pas encore de compte ?")}</p>
                <Button
                  type="button"
                  onClick={onRegister}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] dark:text-blue-400 transition hover:text-blue-700"
                >
                  {t("auth.signUpBtn", "Créer un compte")}
                  <ArrowRight size={13} />
                </Button>
              </div>

              {/* Sécurité */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck size={12} />
                {t("auth.securityNote", "Vos informations sont protégées et sécurisées.")}
              </div>

            </div></AuthLayout>);
}

/* =========================================================
   GOOGLE ICON
========================================================= */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.805 12.23C21.805 11.52 21.742 10.84 21.615 10.185H12V14.05H17.345C17.115 15.295 16.405 16.405 15.205 17.115V19.62H18.435C20.325 17.88 21.805 15.315 21.805 12.23Z" fill="#4285F4" />
      <path d="M12 22C14.7 22 16.96 21.105 18.435 19.62L15.205 17.115C14.31 17.715 13.17 18.075 12 18.075C9.395 18.075 7.185 16.315 6.4 13.95H3.06V16.535C4.525 19.795 7.92 22 12 22Z" fill="#34A853" />
      <path d="M6.4 13.95C6.2 13.35 6.085 12.71 6.085 12C6.085 11.29 6.2 10.65 6.4 10.05V7.465H3.06C2.38 8.82 2 10.35 2 12C2 13.65 2.38 15.18 3.06 16.535L6.4 13.95Z" fill="#FBBC05" />
      <path d="M12 5.925C13.47 5.925 14.79 6.43 15.825 7.42L18.51 4.735C16.955 3.285 14.7 2 12 2C7.92 2 4.525 4.205 3.06 7.465L6.4 10.05C7.185 7.685 9.395 5.925 12 5.925Z" fill="#EA4335" />
    </svg>
  );
}

/* =========================================================
   LINKEDIN ICON
========================================================= */
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-[#0A66C2]">
      <path d="M20.45 20.45H16.9V14.9C16.9 13.58 16.88 11.88 15.06 11.88C13.21 11.88 12.93 13.32 12.93 14.8V20.45H9.38V9H12.79V10.56H12.84C13.31 9.66 14.47 8.71 16.2 8.71C19.8 8.71 20.45 11.08 20.45 14.16V20.45ZM5.37 7.43C4.23 7.43 3.31 6.51 3.31 5.37C3.31 4.23 4.23 3.31 5.37 3.31C6.51 3.31 7.43 4.23 7.43 5.37C7.43 6.51 6.51 7.43 5.37 7.43ZM7.15 20.45H3.59V9H7.15V20.45ZM22.22 0H1.77C0.79 0 0 0.77 0 1.73V22.27C0 23.23 0.79 24 1.77 24H22.22C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export default LoginPage;