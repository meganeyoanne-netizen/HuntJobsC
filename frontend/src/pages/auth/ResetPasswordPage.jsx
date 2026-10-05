import AuthLayout from "../../components/layout/AuthLayout";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Form, Input, Button } from "../../components/ui";
import { useLanguage } from "../../context/LanguageContext";
import { useState } from "react";
import { post, perform, success } from "../../services/api";

export default function ResetPasswordPage({ onLogin }) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    perform(async () => {
      if (password !== confirmation) {
        throw Error(t("auth.passwordsMustMatch", "Les mots de passe ne correspondent pas."));
      }
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        await post("/users/password-reset-confirm/", {
          uid: params.get("reset_uid"),
          token: params.get("reset_token"),
          password,
        });
        success(t("common.saved", "Mot de passe réinitialisé."));
        onLogin();
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <AuthLayout variant="reset" onBack={onLogin} backLabel={t("common.backToLogin", "Retour à la connexion")}>
      <div className="auth-form-body">
        <div className="auth-reset-heading">
          <span className="mb-4 inline-flex rounded-xl bg-blue-50 dark:bg-blue-950 p-3 text-blue-600 dark:text-blue-400">
            <KeyRound size={22} aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("auth.resetTitle", "Nouveau mot de passe")}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("auth.resetSubtitle", "Choisissez un nouveau mot de passe pour retrouver votre espace. Il doit contenir au moins 8 caractères.")}
          </p>
        </div>

        <Form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="reset-password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("auth.passwordLabel", "Nouveau mot de passe")}
            </label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
            />
          </div>

          <div>
            <label htmlFor="reset-confirmation" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("auth.confirmPasswordLabel", "Confirmer le mot de passe")}
            </label>
            <Input
              id="reset-confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
          >
            {loading ? t("auth.resetting", "Réinitialisation en cours…") : t("auth.resetBtn", "Réinitialiser le mot de passe")}
          </Button>

          <p className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={16} aria-hidden="true" />
            {t("auth.securityNote", "Votre mot de passe reste personnel et sécurisé.")}
          </p>
        </Form>
      </div>
    </AuthLayout>
  );
}
