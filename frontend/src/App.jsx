import { usePlatformSettings } from "./hooks/usePlatformSettings";
import { Button } from "./components/ui";
import AppShell from "./components/layout/AppShell";
import React, { useEffect, useState, lazy, Suspense } from "react";


const LandingPage = lazy(() => import("./pages/public/LandingPage"));

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));


// ==========================================================
// CANDIDAT
// ==========================================================

const CandidateDashboardPage = lazy(() => import("./pages/candidat/CandidateDashboardPage"));
const CandidateJobsPage = lazy(() => import("./pages/candidat/CandidateJobsPage"));
const CandidateJobDetailPage = lazy(() => import("./pages/candidat/CandidateJobDetailPage"));
const CandidateApplicationsPage = lazy(() => import("./pages/candidat/CandidateApplicationsPage"));
const CandidateCVPage = lazy(() => import("./pages/candidat/CandidateCVPage"));
const CandidateDocumentsPage = lazy(() => import("./pages/candidat/CandidateDocumentsPage"));
const CandidateAIPage = lazy(() => import("./pages/candidat/CandidateAIPage"));
const CandidateAlertsPage = lazy(() => import("./pages/candidat/CandidateAlertsPage"));
const CandidateProfilePage = lazy(() => import("./pages/candidat/CandidateProfilePage"));


// ==========================================================
// RECRUTEUR
// ==========================================================

const RecruiterDashboardPage = lazy(() => import("./pages/recruteur/RecruiterDashboardPage"));
const RecruiterJobsPage = lazy(() => import("./pages/recruteur/RecruiterJobsPage"));
const RecruiterApplicationsPage = lazy(() => import("./pages/recruteur/RecruiterApplicationsPage"));
const RecruiterCVthequePage = lazy(() => import("./pages/recruteur/RecruiterCVthequePage"));
const RecruiterInterviewsPage = lazy(() => import("./pages/recruteur/RecruiterInterviewsPage"));
const RecruiterCandidateProfilePage = lazy(() => import("./pages/recruteur/RecruiterCandidateProfilePage"));
const RecruiterCompanyPage = lazy(() => import("./pages/recruteur/RecruiterCompanyPage"));
const RecruiterSettingsPage = lazy(() => import("./pages/recruteur/RecruiterSettingsPage"));


// ==========================================================
// ADMIN
// ==========================================================
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminRecruitersPage = lazy(() => import("./pages/admin/AdminRecruitersPage"));
const AdminOffersPage = lazy(() => import("./pages/admin/AdminOffersPage"));
const AdminStatisticsPage = lazy(() => import("./pages/admin/AdminStatisticsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminRecruiterDetailPage = lazy(() => import("./pages/admin/AdminRecruiterDetailPage"));
const AdminOfferDetailPage = lazy(() => import("./pages/admin/AdminOfferDetailPage"));
const AdminUserDetailPage = lazy(() => import("./pages/admin/AdminUserDetailPage"));
const AdminCandidateDetailPage = lazy(() => import("./pages/admin/AdminCandidateDetailPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));



import { api, post, clearSession, saveSession, tokenStorage, perform } from "./services/api";
import { userAdapter } from "./services/adapters";
import ApiFeedback, { LoadingPanel } from "./components/common/ApiFeedback";
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const pages = {"candidate-dashboard":CandidateDashboardPage,"candidate-jobs":CandidateJobsPage,"candidate-job-detail":CandidateJobDetailPage,"candidate-applications":CandidateApplicationsPage,"candidate-cv":CandidateCVPage,"candidate-documents":CandidateDocumentsPage,"candidate-ai":CandidateAIPage,"candidate-alerts":CandidateAlertsPage,"candidate-profile":CandidateProfilePage,"recruiter-dashboard":RecruiterDashboardPage,"recruiter-jobs":RecruiterJobsPage,"recruiter-applications":RecruiterApplicationsPage,"recruiter-cvtheque":RecruiterCVthequePage,"recruiter-interviews":RecruiterInterviewsPage,"recruiter-candidate-detail":RecruiterCandidateProfilePage,"recruiter-company":RecruiterCompanyPage,"recruiter-settings":RecruiterSettingsPage,"admin-dashboard":AdminDashboardPage,"admin-users":AdminUsersPage,"admin-recruiters":AdminRecruitersPage,"admin-offers":AdminOffersPage,"admin-statistics":AdminStatisticsPage,"admin-settings":AdminSettingsPage,"admin-recruiter-detail":AdminRecruiterDetailPage,"admin-offer-detail":AdminOfferDetailPage,"admin-user-detail":AdminUserDetailPage,"admin-candidate-detail":AdminCandidateDetailPage,"admin-notifications":AdminNotificationsPage};
function App() {
  const { settings: platform, loading: platformLoading, error: platformError, refresh: refreshPlatform } = usePlatformSettings();
  const params = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(params.has("reset_token") ? "reset-password" : "landing");
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [navigationVersion, setNavigationVersion] = useState(0);
  const [restoring, setRestoring] = useState(Boolean(tokenStorage().getItem("access_token")));
  const navigate = (destination, data = null) => {
    if (destination === "candidate-application") destination = "candidate-job-detail";
    if (destination === "recruiter-job-detail") destination = "recruiter-jobs";
    if (destination === "recruiter-profile") destination = "recruiter-settings";
    if (["candidate-analysis", "candidate-interview", "candidate-cv-advisor"].includes(destination)) destination = "candidate-ai";
    if (!["landing","login","register","forgot-password","reset-password"].includes(destination)) {
      if (!user) { setPage("login"); return; }
      if (!destination.startsWith(user.role+"-") && destination !== "notifications") return;
    }
    setNavigationVersion(v=>v+1); setSelected(data); setPage(destination); window.scrollTo({top:0});
  };
  const handleLogout = async () => {
    const refresh = tokenStorage().getItem("refresh_token");
    if (refresh) await perform(() => post("/users/logout/", {refresh}));
    clearSession(); setUser(null); setPage("landing");
  };
  const authenticated = response => {
    const current = userAdapter(response.user);
    setUser(current); setPage(current.role + "-dashboard");
  };
  const handleUserUpdated = current => {
    tokenStorage().setItem("user", JSON.stringify(current));
    setUser(userAdapter(current));
  };
  const handleLogin = async credentials => {
    const response = await post("/users/login/", {email:credentials.email, password:credentials.password});
    saveSession(response, credentials.rememberMe); authenticated(response);
  };
  const handleRegister = async data => {
    const company = data.role === "recruiter" && !data.deferCompany ? {nom:data.companyName, email_professionnel:data.companyEmail, telephone:data.companyPhone, nui:data.companyNui, description:data.companyDescription} : undefined;
    const response = await post("/users/register/", {username:data.email.slice(0,110)+"_"+crypto.randomUUID().slice(0,8), email:data.email, first_name:data.firstName,last_name:data.lastName,telephone:data.phone,role:data.role === "recruiter" ? "RECRUTEUR" : "CANDIDAT",password:data.password,password_confirm:data.confirmPassword,company});
    saveSession(response);
    if (!data.deferCompany && data.companyDocuments?.length) {
      const form = new FormData(); form.append("document_immatriculation",data.companyDocuments[0]);
      if(data.companyDocuments[1]) form.append("preuve_activite",data.companyDocuments[1]);
      await perform(() => api("/users/recruiter/company/",{method:"PATCH",body:form}));
    }
    authenticated(response);
  };
  useEffect(() => {
    let active=true;
    if(tokenStorage().getItem("access_token")) api("/users/me/").then(current => {
      if(active){const u=userAdapter(current);setUser(u);setPage(u.role+"-dashboard");}
    }).catch(() => {clearSession();}).finally(() => {if(active)setRestoring(false);});
    const expired=()=>{setUser(null);setPage("login");};
    window.addEventListener("session-expired",expired);
    return ()=>{active=false;window.removeEventListener("session-expired",expired);};
  },[]);
  let content;
  if (restoring) content = <LoadingPanel />;
  else if (page === "landing") content = <LandingPage onLogin={() => navigate("login")} onRegister={() => navigate("register")} />;
  else if (page === "login") content = <LoginPage onLogin={handleLogin} onRegister={() => navigate("register")} onForgotPassword={() => navigate("forgot-password")} onBack={() => navigate("landing")} />;
  else if (page === "register") content = <RegisterPage onRegister={handleRegister} onLogin={() => navigate("login")} onBack={() => navigate("landing")} decorativeSide="right" />;
  else if (page === "forgot-password") content = <ForgotPasswordPage onBack={() => navigate("login")} onLogin={() => navigate("login")} />;
  else if (page === "reset-password") content = <ResetPasswordPage onLogin={() => { history.replaceState(null, "", location.pathname); navigate("login"); }} />;
  else if (page === "notifications") content = <NotificationsPage user={user} onNavigate={navigate} onLogout={handleLogout} />;
  else {
    const Page = pages[page];
    content = Page && user ? <Page onUserUpdated={handleUserUpdated} key={page + ":" + navigationVersion + ":" + JSON.stringify(selected)} user={user} onNavigate={navigate} onLogout={handleLogout} jobId={typeof selected === "object" ? selected?.id : selected} candidateId={selected} selectedCandidateId={selected} selectedRecruiterId={selected} selectedOfferId={selected} selectedUserId={selected} openPublish={selected?.openPublish || false} /> : <LoadingPanel error={Error("Page indisponible.")} reload={() => setPage(user?.role + "-dashboard" || "landing")} />;
  }
  const authPages = ["login", "forgot-password", "reset-password"];
  if (!restoring && platform?.maintenanceMode && user?.role !== "admin" && !authPages.includes(page)) {
    content = <main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="text-3xl font-bold">Maintenance en cours</h1><p className="mt-4 text-slate-600">{platform.maintenanceMessage}</p><p className="mt-3 text-sm"><a href={"mailto:" + platform.platformEmail}>{platform.platformEmail}</a></p><Button onClick={() => setPage("login")} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-white">Connexion administrateur</Button><Button onClick={refreshPlatform} className="ml-3 mt-6 text-blue-600">Actualiser</Button></main>;
    return <>{content}<ApiFeedback /></>;
  }
  if (page === "register" && !platform?.allowRegistration) content = <main className="mx-auto max-w-xl p-12 text-center"><h1 className="text-2xl font-bold">Inscriptions temporairement fermées</h1><p className="mt-4">Les comptes existants peuvent toujours se connecter.</p><Button onClick={() => setPage("login")} className="mt-5 text-blue-600">Se connecter</Button></main>;
  if (page === "candidate-ai" && !platform?.aiEnabled) content = <main className="p-10"><h1 className="text-2xl font-bold">Assistant IA indisponible</h1><p className="mt-3">Ce service est désactivé par l’administrateur.</p></main>;
  return <><Suspense fallback={<LoadingPanel />}>{user && !["landing","login","register","forgot-password","reset-password"].includes(page) ? <AppShell user={user} activePage={page} onNavigate={navigate} onLogout={handleLogout}>{content}</AppShell> : content}</Suspense><ApiFeedback /></>;
}
export default App;
