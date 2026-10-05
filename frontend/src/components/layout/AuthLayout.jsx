import { ArrowLeft, ArrowUpRight, Check, ShieldCheck, Compass } from "lucide-react";
import { AppLogoIcon } from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import LanguageToggle from "../common/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { Button } from "../ui";
import "../../auth-design.css";

export default function AuthLayout({
  children,
  variant = "login",
  decorativeSide = "left",
  onBack,
  backLabel,
}) {
  const { t } = useLanguage();

  const copy = {
    login: {
      tag: t("auth.storyLoginTitle", "Votre carrière, votre prochain chapitre"),
      title: t("auth.storyLoginTitle", "Les bonnes opportunités commencent par vous."),
      description: t("auth.storyLoginDesc", "Retrouvez vos offres, vos candidatures et vos outils de préparation dans un espace pensé pour avancer."),
      feature: t("auth.storyFeature1", "Un espace pour chaque ambition"),
    },
    register: {
      tag: t("auth.registerTitle", "Bienvenue dans votre prochain chapitre"),
      title: t("auth.storyRegisterTitle", "Du talent. Des opportunités. Une rencontre."),
      description: t("auth.storyRegisterDesc", "Que vous recherchiez votre prochain poste ou votre prochain talent, construisez la suite avec JobConnect."),
      feature: t("auth.storyFeature2", "Candidats et recruteurs, au même endroit"),
    },
    forgot: {
      tag: t("auth.forgotTitle", "Retrouvez votre espace"),
      title: t("auth.storyForgotTitle", "Un nouveau départ, en toute simplicité."),
      description: t("auth.storyForgotDesc", "Réinitialisez votre mot de passe pour retrouver vos opportunités et reprendre votre parcours."),
      feature: t("auth.storyFeature3", "Votre compte reste entre vos mains"),
    },
    reset: {
      tag: t("auth.resetTitle", "Sécurité de votre compte"),
      title: t("auth.storyResetTitle", "La suite de votre parcours vous attend."),
      description: t("auth.storyResetDesc", "Choisissez votre nouveau mot de passe et retrouvez votre espace JobConnect."),
      feature: t("auth.storyFeature3", "Un accès personnel et sécurisé"),
    },
  };

  const content = copy[variant] || copy.login;
  const defaultBackLabel = backLabel || t("common.backToHome", "Retour à l’accueil");

  return (
    <div className={"auth-redesign auth-redesign-" + variant + (decorativeSide === "right" ? " auth-redesign-reversed" : "")}>
      <aside className="auth-story" aria-label="JobConnect">
        <div className="auth-story-brand">
          <div className="auth-wordmark">
            <AppLogoIcon size={34} className="shrink-0" />
            <strong className="tracking-tight text-white">
              Job<span className="text-blue-400">Connect</span>
            </strong>
          </div>
          <span>JobConnect</span>
        </div>

        <div className="auth-story-content">
          <p className="auth-story-tag">
            <Compass size={16} aria-hidden="true" />
            {content.tag}
          </p>
          <h2>{content.title}</h2>
          <p className="auth-story-description">{content.description}</p>

          <div className="auth-story-preview">
            <div className="auth-preview-top">
              <span className="auth-preview-icon">
                <AppLogoIcon size={26} />
              </span>
              <span className="auth-preview-label">
                JOBCONNECT
                <span>{content.feature}</span>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>
            <div className="auth-preview-line">
              <Check size={16} aria-hidden="true" />
              <span>{t("auth.storyFeature1", "Des opportunités à explorer")}</span>
            </div>
            <div className="auth-preview-line">
              <Check size={16} aria-hidden="true" />
              <span>{t("auth.storyFeature2", "Un suivi clair à chaque étape")}</span>
            </div>
            <div className="auth-preview-line">
              <Check size={16} aria-hidden="true" />
              <span>{t("auth.storyFeature3", "Des outils IA pour vous préparer")}</span>
            </div>
          </div>
        </div>

        <div className="auth-story-footer">
          <span>
            <ShieldCheck size={16} aria-hidden="true" />
            {t("auth.storyFooter", "Un espace personnel, une nouvelle perspective.")}
          </span>
          <small>© {new Date().getFullYear()} JobConnect</small>
        </div>
      </aside>

      <main className="auth-main">
        <header className="auth-main-header">
          <div className="auth-wordmark auth-mobile-brand">
            <AppLogoIcon size={30} className="shrink-0" />
            <strong className="tracking-tight">
              Job<span className="text-blue-600">Connect</span>
            </strong>
          </div>

          {onBack && (
            <Button className="auth-back" onClick={onBack}>
              <ArrowLeft size={17} aria-hidden="true" />
              {defaultBackLabel}
            </Button>
          )}

          <div className="auth-header-right flex items-center gap-2.5">
            <LanguageToggle variant="pill" />
            <ThemeToggle />
          </div>
        </header>

        <div className="auth-stage">
          <div className="auth-form-card">{children}</div>
          <p className="auth-bottom-note">
            JobConnect · {t("auth.storyRegisterTitle", "Du talent. Des opportunités. Une rencontre.")}
          </p>
        </div>
      </main>
    </div>
  );
}
