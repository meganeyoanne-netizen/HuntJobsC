import AdminNotificationBell from "./AdminNotificationBell";
import ResourceBoundary from "../common/ResourceBoundary";
import { AppLogoIcon } from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import LanguageToggle from "../common/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  BriefcaseBusiness,
  FileStack,
  FileBadge2,
  FolderKanban,
  Sparkles,
  BellRing,
  UserCheck,
  UsersRound,
  Building2,
  CalendarCheck2,
  SlidersHorizontal,
  TrendingUp,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
} from "lucide-react";
import { Avatar, Button, IconButton, ModalFrame } from "../ui";

const linkIcons = {
  candidate: [
    ["dashboard", LayoutGrid],
    ["jobs", BriefcaseBusiness],
    ["applications", FileStack],
    ["cv", FileBadge2],
    ["documents", FolderKanban],
    ["ai", Sparkles],
    ["alerts", BellRing],
    ["profile", UserCheck],
  ],
  recruiter: [
    ["dashboard", LayoutGrid],
    ["jobs", BriefcaseBusiness],
    ["applications", FileStack],
    ["cvtheque", UsersRound],
    ["interviews", CalendarCheck2],
    ["company", Building2],
    ["settings", SlidersHorizontal],
  ],
  admin: [
    ["dashboard", LayoutGrid],
    ["users", UsersRound],
    ["recruiters", Building2],
    ["offers", BriefcaseBusiness],
    ["statistics", TrendingUp],
    ["notifications", BellRing],
    ["settings", SlidersHorizontal],
  ],
};

export default function AppShell({ user, activePage, onNavigate, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();
  const role = user?.role || "candidate";

  const roleLabel = t(`roles.${role}`, role === "admin" ? "Administration" : role === "recruiter" ? "Espace recruteur" : "Espace candidat");
  const rawItems = linkIcons[role] || linkIcons.candidate;
  
  const items = rawItems.map(([key, Icon]) => {
    const label = t(`sidebar.${role}.${key}`, key);
    return [key, label, Icon];
  });

  const parentPages = {
    "candidate-job-detail": "candidate-jobs",
    "recruiter-candidate-detail": "recruiter-cvtheque",
    "admin-recruiter-detail": "admin-recruiters",
    "admin-offer-detail": "admin-offers",
    "admin-user-detail": "admin-users",
    "admin-candidate-detail": "admin-users",
  };

  const activeDestination = parentPages[activePage] || activePage;
  const activeItem = items.find(([key]) => activeDestination === role + "-" + key);
  const active = activePage === "notifications" ? t("common.notifications", "Notifications") : activeItem?.[1] || t("common.details", "Détails");
  const name = user?.name || [user?.firstName || user?.first_name, user?.lastName || user?.last_name].filter(Boolean).join(" ") || user?.email || t("common.account", "Mon compte");

  useEffect(() => setOpen(false), [activePage]);

  function go(key) {
    setOpen(false);
    onNavigate(role + "-" + key);
  }

  function navigation() {
    return (
      <>
        <div className="shell-brand">
          <AppLogoIcon size={38} className="shrink-0" />
          <div>
            <span className="font-extrabold tracking-tight text-slate-900 dark:text-white">
              Job<span className="text-blue-600 dark:text-blue-400">Connect</span>
            </span>
            <small>{roleLabel}</small>
          </div>
        </div>

        <nav aria-label={t("nav.features", "Navigation principale")} className="shell-links">
          {items.map(([key, label, Icon]) => (
            <Button
              key={key}
              onClick={() => go(key)}
              aria-current={activeDestination === role + "-" + key ? "page" : undefined}
              className={activeDestination === role + "-" + key ? "shell-link is-active" : "shell-link"}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Button>
          ))}
        </nav>

        <div className="shell-account">
          <Avatar src={role === "candidate" ? user?.avatar : undefined} name={name} />
          <div>
            <strong>{name}</strong>
            <small>{roleLabel}</small>
          </div>
        </div>

        <Button className="shell-logout" onClick={onLogout}>
          <LogOut size={18} />
          {t("common.logout", "Déconnexion")}
        </Button>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="shell-sidebar">{navigation()}</aside>

      {open && (
        <ModalFrame onClose={() => setOpen(false)} aria-label={t("common.menu", "Menu de navigation")} className="shell-drawer-overlay">
          <Button className="shell-drawer-backdrop" aria-label={t("common.closeMenu", "Fermer le menu")} onClick={() => setOpen(false)} />
          <aside className="shell-drawer">
            <IconButton label={t("common.closeMenu", "Fermer le menu")} className="shell-close" onClick={() => setOpen(false)}>
              <X size={22} />
            </IconButton>
            {navigation()}
          </aside>
        </ModalFrame>
      )}

      <div className="shell-workspace">
        <header className="shell-header">
          <IconButton label={t("common.menu", "Ouvrir le menu")} className="shell-menu" onClick={() => setOpen(true)}>
            <Menu size={23} />
          </IconButton>

          <div className="shell-breadcrumb">
            <span>{roleLabel}</span>
            <ChevronRight size={14} />
            <strong>{active}</strong>
          </div>

          <div className="shell-header-actions">
            <LanguageToggle variant="pill" />
            <ThemeToggle className="theme-toggle-header" />
            {role === "admin" ? (
              <AdminNotificationBell onNavigate={onNavigate} />
            ) : (
              <IconButton
                label={t("common.seeNotifications", "Voir les notifications")}
                className="shell-notification"
                onClick={() => onNavigate(role === "admin" ? "admin-notifications" : "notifications")}
              >
                <Bell size={21} />
              </IconButton>
            )}
            <Avatar src={role === "candidate" ? user?.avatar : undefined} name={name} size={36} />
          </div>
        </header>

        <div className="shell-content" key={activePage + ":" + language}>
          <ResourceBoundary key={activePage + ":" + language} page={activePage}>
            {children}
          </ResourceBoundary>
        </div>

        <nav className="shell-bottom-nav" aria-label={t("nav.home", "Navigation mobile")}>
          {items.slice(0, 3).map(([key, label, Icon]) => (
            <Button
              key={key}
              aria-current={activeDestination === role + "-" + key ? "page" : undefined}
              onClick={() => go(key)}
              className={activeDestination === role + "-" + key ? "is-active" : ""}
            >
              <Icon size={21} />
              <span>{key === "dashboard" ? t("nav.home", "Accueil") : label}</span>
            </Button>
          ))}
          <Button onClick={() => setOpen(true)} aria-label={t("common.menu", "Afficher toutes les destinations")}>
            <Menu size={21} />
            <span>{t("common.menu", "Menu")}</span>
          </Button>
        </nav>
      </div>
    </div>
  );
}
