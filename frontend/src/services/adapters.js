export const dateLabel = value => value ? new Date(value).toLocaleDateString("fr-FR") : "";
export const initials = (name = "") => name.split(" ").filter(Boolean).map(s => s[0]).join("").slice(0, 2).toUpperCase();
export function userAdapter(u) { return { ...u, firstName: u.first_name, lastName: u.last_name, initials: initials(u.first_name + " " + u.last_name), role: u.is_admin_role || u.is_superuser ? "admin" : ({ CANDIDAT: "candidate", RECRUTEUR: "recruiter", ADMIN: "admin" }[u.role]), roleLabel: { CANDIDAT: "Candidat", RECRUTEUR: "Recruteur", ADMIN: "Administrateur" }[u.role], status: u.is_suspended ? "Suspendu" : u.is_active ? "Actif" : "Inactif", registeredAt: dateLabel(u.created_at), lastActivity: dateLabel(u.last_login) }; }
export function jobAdapter(j) {
  const company = j.entreprise_nom || "";
  return { ...j, title: j.titre || "", company, companyShort: initials(company), companyInitials: initials(company), logo: initials(company), location: j.localisation || "", type: j.type_contrat_label || j.type_contrat, contract: j.type_contrat_label || j.type_contrat, domain: j.entreprise_secteur || "", sector: j.entreprise_secteur || "", experience: j.niveau_experience_label || "", education: j.niveau_etudes_label || "", diploma: j.diplome_requis || "", salary: j.salaire_confidentiel || !j.salaire_min ? "Selon profil" : j.salaire_min + " – " + (j.salaire_max || "") + " " + j.devise, deadline: j.date_limite, description: j.description || "", missions: (j.missions || "").split("\n").filter(Boolean), requirements: (j.profil_recherche || "").split("\n").filter(Boolean), skills: j.competences || [], benefits: j.avantages || [], applications: j.nombre_candidatures || 0, newApplications: 0, views: j.nombre_vues || 0, status: { PUBLIEE: "active", EXPIREE: "expired", ARCHIVEE: "archived", BROUILLON: "draft", EN_ATTENTE: "pending", REJETEE: "rejected", SUSPENDUE: "suspended" }[j.statut], statusLabel: j.statut_label, validated: j.moderation_status === "APPROUVEE", color: "blue", icon: null, progress: 0, postedAt: dateLabel(j.date_publication), time: dateLabel(j.date_publication), publishedAt: dateLabel(j.date_publication), createdAt: dateLabel(j.created_at) };
}
export const jobsAdapter = list => list.map(jobAdapter);
function mapEducationLevel(diploma = "") {
  const d = (diploma || "").toLowerCase();
  if (d.includes("doctorat")) return "DOCTORAT";
  if (d.includes("master") || d.includes("ingénieur") || d.includes("ingenieur") || d.includes("bac+5")) return "BAC+5";
  if (d.includes("bac+4")) return "BAC+4";
  if (d.includes("licence") || d.includes("bac+3")) return "BAC+3";
  if (d.includes("bts") || d.includes("dut") || d.includes("bac+2")) return "BAC+2";
  if (d.includes("bac") || d.includes("cap") || d.includes("bep")) return "BAC";
  if (d.includes("probatoire")) return "PROBATOIRE";
  if (d.includes("bepc")) return "BEPC";
  return "AUCUN";
}
export function offerPayload(form) {
  const diploma = form.diploma || "Selon profil";
  const fullDiploma = [form.diploma, form.specialty?.trim()].filter(Boolean).join(" — ") || diploma;
  const numbers = (form.salary || "").match(/\d[\d\s]*/g)?.map(s => Number.parseInt(s.replace(/\s+/g, ""), 10)) || [];
  const minSalary = numbers[0] || null;
  const maxSalary = numbers[1] || numbers[0] || null;
  const confidentiel = !form.salary || !form.salary.trim() || numbers.length === 0;

  return {
    titre: (form.title || "").trim(),
    localisation: (form.location || "").trim(),
    type_contrat: (form.type || "CDI").toUpperCase(),
    niveau_experience: /[2-9]|interm/i.test(form.experience) ? "INTERMEDIAIRE" : /senior/i.test(form.experience) ? "SENIOR" : "DEBUTANT",
    experience_requise: Number.parseInt(form.experience) || 0,
    niveau_etudes: mapEducationLevel(diploma),
    diplome_requis: fullDiploma,
    date_limite: form.deadline,
    description: (form.description || "").trim(),
    competences: Array.isArray(form.skills) ? form.skills : [],
    salaire_confidentiel: confidentiel,
    ...(minSalary ? { salaire_min: minSalary } : {}),
    ...(maxSalary ? { salaire_max: maxSalary } : {}),
  };
}
const statusType = { RECUE: "sent", PRESELECTION: "selection", ENTRETIEN: "interview", EVALUATION: "review", RETENU: "accepted", REFUSE: "rejected", RETIREE: "withdrawn" };
export const statusCode = label => ({ "Candidature reçue": "RECUE", "Présélection": "PRESELECTION", "Entretien": "ENTRETIEN", "Évaluation": "EVALUATION", "Retenu": "RETENU", "Refusé": "REFUSE", "Non retenue": "REFUSE", "Retirée": "RETIREE" }[label] || label);
export function applicationAdapter(a) {
  const j = jobAdapter(a.offre_detail || {}), u = a.candidat_detail || {}, p = a.profil || {};
  const stage = ["RECUE", "PRESELECTION", "ENTRETIEN", "EVALUATION", "RETENU"].indexOf(a.statut);
  const dates = [a.date_candidature, a.date_preselection, a.date_entretien, a.date_evaluation, a.date_decision];
  return { ...a, title: j.title, company: j.company, companyShort: j.companyShort, location: p.localisation || j.location, type: j.type, description: j.description, date: dateLabel(a.date_candidature), status: a.statut_label, statusType: statusType[a.statut], progress: a.progression, currentStep: stage + 1, appliedDays: dateLabel(a.date_candidature), firstName: u.first_name || "", lastName: u.last_name || "", name: (u.first_name || "") + " " + (u.last_name || ""), initials: initials((u.first_name || "") + " " + (u.last_name || "")), jobId: a.offre, candidateId: a.candidat, job: j.title, stage: a.statut_label, stageColor: "blue", score: a.score_compatibilite == null ? null : Number(a.score_compatibilite), compatibilityLabel: a.compatibilite_label || "Analyse en cours", cvId: a.cv, cvTitle: a.cv_titre || "CV", cvFileName: a.cv_nom_fichier || "cv.txt", skills: p.competences || [], experience: (p.annees_experience || 0) + " ans", education: p.formations?.map(e => e.degree || e.diplome).filter(Boolean).join(", ") || "", email: u.email || "", phone: u.telephone || "", note: a.note_interne || "", color: "blue", steps: ["Candidature envoyée", "Présélection", "Entretien", "Évaluation", a.statut === "REFUSE" ? "Non retenue" : a.statut === "RETIREE" ? "Retirée" : "Décision finale"].map((label, i) => ({ label, date: dateLabel(dates[i]), completed: Boolean(dates[i]), current: stage === i, rejected: a.statut === "REFUSE" && i === 4 })) };
}
export const applicationsAdapter = list => list.map(applicationAdapter);
export function cvAdapter(c) { return { ...c, name: c.titre, type: c.fichier ? "PDF" : "En ligne", size: "", updated: dateLabel(c.updated_at), main: c.is_primary, completeness: null, color: "blue" }; }
export const cvsAdapter = list => list.map(cvAdapter);
export function companyAdapter(c) { return { ...c, name: c.nom, company: c.nom, sector: c.secteur_activite, description: c.description, website: c.site_web, phone: c.telephone, address: c.adresse || c.localisation, location: c.localisation, city: c.localisation, employees: c.taille, email: c.email_professionnel, nui: c.nui, status: { NOT_STARTED: "Non vérifié", PENDING: "En attente", VERIFIED: "Vérifié", REJECTED: "Refusé", SUSPENDED: "Suspendu", IN_PROGRESS: "En cours" }[c.verification_status], verificationStatus: c.verification_status === "VERIFIED" ? "Approuvé" : c.verification_status === "PENDING" ? "En attente" : c.verification_status === "REJECTED" ? "Refusé" : "Non soumis", registeredAt: dateLabel(c.created_at), verifiedAt: dateLabel(c.verified_at), firstName: c.recruteur?.first_name || "", lastName: c.recruteur?.last_name || "", offers: c.offres_count || 0, applications: c.candidatures_count || 0 }; }
export const companyPayload = (form, email, nui) => ({ nom: form.name, secteur_activite: form.sector, description: form.description, site_web: form.website, telephone: form.phone, adresse: form.address, localisation: form.location || form.address, taille: form.employees, email_professionnel: email, nui });
export function candidateAdapter(c) {
  const p = c.profil || {}, apps = applicationsAdapter(c.candidatures || []);
  return { ...c, firstName: c.first_name, lastName: c.last_name, name: c.first_name + " " + c.last_name, initials: initials(c.first_name + " " + c.last_name), title: p.titre_professionnel || "", location: p.localisation || "", bio: p.bio || "", skills: p.competences || [], experiences: p.experiences || [], education: p.formations || [], languages: p.langues || [], experience: (p.annees_experience || 0) + " ans", level: p.titre_professionnel || "", availability: p.disponibilite || "", score: apps[0]?.score, compatibility: apps[0]?.score, status: apps[0]?.status || "", applications: apps, cvs: c.cvs || [], email: apps[0]?.email || "", phone: apps[0]?.phone || "", color: "blue" };
}
export const candidatesAdapter = list => list.map(candidateAdapter);
export function interviewAdapter(i) {
  const date = new Date(i.date);
  const app=applicationAdapter(i.candidature_detail||{});
  return { ...i, candidate: i.candidat_nom, candidateId: i.candidat, applicationId: i.candidature, job: i.offre_titre, jobId: i.offre, type: i.type_label, status: i.statut_label, time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), date: dateLabel(i.date), dateValue: date.toISOString().slice(0, 10), rawDate: i.date, duration: i.duree + " min", candidateInitials: initials(i.candidat_nom), initials: initials(i.candidat_nom), company: "", color: "blue", skills:app.skills,contract:app.type,location:i.lieu||"Visioconférence",applicationDate:app.date,compatibility:app.score, candidateProfile: { level: "", experience: "", skills: [] }, offerDetails: { title: i.offre_titre, skills: [] } };
}
export const interviewsAdapter = list => list.map(interviewAdapter);
export const notificationAdapter = n => ({ ...n, title: n.titre, description: n.message, read: n.is_read, date: dateLabel(n.created_at), time: dateLabel(n.created_at), type: "system", priority: "normal", actionLabel: "Consulter", route: n.destination, targetId: n.resource_id });
export const notificationsAdapter = list => list.map(notificationAdapter);
export const generationAdapter = d => ({ ...d, title: d.titre, type: d.outil === "generer-cv" ? "CV" : d.outil === "portfolio" ? "Portfolio" : "Lettre de motivation", format: "PDF · DOCX", date: dateLabel(d.created_at), size: "", status: "Prêt", icon: null });
export const generationsAdapter = list => list.map(generationAdapter);
