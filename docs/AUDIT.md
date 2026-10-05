# Audit initial HuntJobs
Le frontend comporte 3 pages d'authentification, 9 pages candidat, 8 pages recruteur, 12 pages administrateur et une landing page. React/Vite/Tailwind, navigation par état dans App.jsx, pas de router. Le design et les composants existants sont conservés.
Aucun service API ni contexte partagé : App.jsx crée un utilisateur fictif pour toute connexion/inscription, ne restaure pas la session ; déconnexions divergentes. Le détail d'offre attend `job` mais reçoit `jobId` ; Postuler navigue vers une page absente. Les données métiers sont des tableaux locaux, les mutations ne survivent pas au rechargement et les délais simulent des requêtes.
Le backend possède users (User, profils, entreprise, CV, documents, JWT, permissions) et offres (publication/modération/archivage). Candidature existe mais son application n'est pas activée, sans migration/API. Entretiens, IA, administration REST, notifications, alertes et messages manquent. SQLite est configurée. .env est vide. python-dotenv et Pillow sont absents du manifeste bien que requis. Refresh JWT n'a pas de route. Le propriétaire du CV est ProfilCandidat alors que Candidature.clean compare ce profil à User : incompatibilité.
## Correspondance
|Page|Données/actions|API|Existant / action|
|---|---|---|---|
|Login/Register/ForgotPassword|Compte, tokens, récupération|users/login, register, token/refresh, password-reset|Brancher JWT, ajouter récupération|
|CandidateDashboard|Statistiques, offres, candidatures, entretiens|dashboard/, offres/, candidatures/, entretiens/|Ajouter agrégats|
|CandidateJobs / JobDetail|Recherche, favoris, détail, candidature avec CV|offres/, favoris/, candidatures/|Brancher offres, ajouter favoris et candidature|
|CandidateApplications|Suivi, retrait, historique|candidatures/|Créer API sans ATS ni notes|
|CandidateProfile|Identité, compétences, formations, expériences, visibilité|users/me, candidate/profile|Brancher profils|
|CandidateCV|Upload, principal, suppression, consultation|users/cvs|Brancher et sécuriser fichiers|
|CandidateDocuments|Générer CV/lettre/portfolio, télécharger/historique|ia/, users/documents|Créer IA et historique persistant|
|CandidateAI|Analyse offre, simulation, conseil CV|ia/analyse-offre, simulation-entretien, conseiller-cv|Prompts distincts|
|CandidateAlerts|CRUD alertes et notifications|alertes/, notifications/|Créer|
|RecruiterDashboard|Statistiques/offres/candidats/entretiens|dashboard/|Créer agrégats|
|RecruiterJobs|Créer/modifier/soumettre/archiver/réactiver|offres/recruteur/|Brancher les actions existantes|
|RecruiterApplications|Filtrer, ATS, statuts, notes|candidatures/|Créer API avec ownership|
|RecruiterCVtheque / CandidateProfile|Profils, CV autorisés, contact|candidats/, fichiers/, messages/|Créer accès limité|
|RecruiterInterviews|Planifier/modifier, questions IA|entretiens/, ia/questions-entretien/|Créer lien obligatoire à candidature|
|RecruiterCompany|Profil, logo, vérification/verrouillage|users/recruiter/company|Brancher workflow existant|
|RecruiterSettings|Compte, mot de passe, préférences|users/me, password-change, preferences/|Compléter|
|AdminDashboard / Statistics|Indicateurs réels|administration/statistics|Créer|
|AdminUsers / UserDetail / CandidateDetail|Rechercher, suspendre/réactiver, détail|administration/users|Créer|
|AdminRecruiters / RecruiterDetail|Vérifier/rejeter/suspendre/déverrouiller|administration/entreprises|Créer|
|AdminOffers / OfferDetail|Modérer/suspendre/archiver|offres/admin, administration/offres|Compléter|
|AdminNotifications|Lire/supprimer, marquer lues|notifications/|Créer|
|AdminSettings|Paramètres persistants|administration/settings|Créer|
|LandingPage|Offres publiques|offres/|Remplacer les offres fictives|
## Validation
Checks Django, migrations, tests d'intégration API (3 rôles, ownership, fichiers, ATS, workflow), build/lint frontend et vérification visuelle quand disponible.
Les appels Groq réels nécessitent GROQ_API_KEY ; l'envoi d'email nécessite SMTP. Aucune réponse fictive ne doit masquer leur absence.
