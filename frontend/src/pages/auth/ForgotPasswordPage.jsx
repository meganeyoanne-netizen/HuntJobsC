import AuthLayout from "../../components/layout/AuthLayout";
import { Button, Form, Input } from "../../components/ui";
import { useLanguage } from "../../context/LanguageContext";
import { post, perform } from "../../services/api";
import { useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";

function ForgotPasswordPage({
  onBack,
  onLogin,
  decorativeSide = "left",
}) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await post("/users/password-reset/", { email });
      setSent(true);
    } catch (error) {
      await perform(() => Promise.reject(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="forgot" decorativeSide={decorativeSide} onBack={onBack}>
      <div className="auth-form-body">
        {!sent ? (
          <>
            <div>
              <div className="mb-5 inline-flex rounded-2xl bg-blue-50 dark:bg-blue-950 p-3 text-blue-600 dark:text-blue-400">
                <KeyRound size={24} />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {t("auth.forgotTitle", "Mot de passe oublié ?")}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("auth.forgotSubtitle", "Indiquez l'adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.")}
              </p>
            </div>

            <Form onSubmit={handleSubmit} className="mt-9 space-y-6">
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  {t("auth.emailLabel", "Adresse email")}
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder", "exemple@email.com")}
                    required
                    autoComplete="email"
                    className="h-13 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t("auth.sendingResetLink", "Envoi en cours...")}
                  </>
                ) : (
                  <>
                    {t("auth.sendResetLink", "Envoyer le lien de réinitialisation")}
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </Button>
            </Form>

            <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("auth.haveAccount", "Vous vous souvenez de votre mot de passe ?")}
              </p>
              <Button
                type="button"
                onClick={onLogin}
                className="mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 transition hover:text-blue-700"
              >
                {t("common.backToLogin", "Retour à la connexion")}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="mt-7 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {t("common.success", "Vérifiez votre boîte mail")}
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("auth.forgotSubtitle", "Si un compte JobConnect est associé à cette adresse, un lien de réinitialisation vient d'être envoyé.")}
            </p>

            <div className="mt-7 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40 p-5 text-left">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white dark:bg-slate-900 p-2 text-blue-600 dark:text-blue-400 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{email}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {t("auth.securityNote", "Consultez également vos courriers indésirables si vous ne trouvez pas le message.")}
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={onLogin}
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              {t("common.backToLogin", "Retour à la connexion")}
              <ArrowRight size={16} />
            </Button>

            <Button
              type="button"
              onClick={() => setSent(false)}
              className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400 transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              {t("common.refresh", "Utiliser une autre adresse email")}
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={13} />
          {t("auth.securityNote", "Vos données sont protégées et sécurisées.")}
        </div>
      </div>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;