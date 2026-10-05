# HuntJobs — rapport de livraison

## État obtenu

Le frontend existant conserve son organisation en pages et sa navigation par état React. Il utilise les API Django au lieu des tableaux de démonstration pour les offres, candidatures, CV, profils, entreprises, entretiens, alertes, notifications, générations IA, administration et statistiques.

PostgreSQL est la base principale. Une instance locale isolée a été créée sur 127.0.0.1:55432 pour rendre le projet utilisable sans connaître les identifiants de l’instance existante sur 5432. Les objets utilisateurs/offres historiques ont été importés, et une migration complète les profils manquants. Le SQLite original est conservé.

Le démarrage local est fourni dans start_huntjobs.cmd et run_platform.py. Les services applicatifs utilisent 8000 et 5173. Le worker send_alerts examine les alertes périodiquement et suit les envois pour éviter les doublons.

## Backend

- JWT : connexion, inscription, rotation et révocation des refresh tokens, suspension des comptes, contrôle du changement de mot de passe.
- Comptes : profils par rôle, entreprise recruteur, changement et réinitialisation du mot de passe par email.
- Offres : création, modification, soumission, approbation avec publication effective, refus, archivage, suspension et réactivation. Référence et slug uniques. La double insertion lors de la création a été corrigée.
- Candidatures : CV obligatoire appartenant au candidat, offre publiée et non expirée, candidature unique par offre/candidat, compteurs persistants, progression et dates réelles.
- ATS : calcul serveur à partir des compétences, de l’expérience et du diplôme ; analyse du CV texte/PDF. Les résultats et notes internes sont retirés de toutes les réponses candidat. Les recruteurs ne peuvent pas modifier manuellement le score.
- Entretiens : candidature réelle obligatoire, périmètre propriétaire, dates futures à la programmation, modification, annulation, fin et questions privées. Un entretien supplémentaire ne remet pas une candidature évaluée à une étape antérieure.
- Fichiers : CV, documents et justificatifs via téléchargement authentifié. Un recruteur accède au CV joint à ses candidatures. Les chemins média privés ne sont pas publiquement servis. Les CV utilisés sont conservés.
- Administration : comptes, entreprises, vérification, déverrouillage email/NUI, demandes d’informations, modération, paramètres persistants, journal des décisions.
- Notifications : événements après validation transactionnelle, lecture et suppression selon le propriétaire.
- Messages : échanges enregistrés dans une candidature appartenant à l’utilisateur, lien de visioconférence possible.
- Alertes : critères enregistrés, correspondances réelles et envois email selon fréquence, avec suivi du dernier envoi.
- IA : service Groq réel, erreurs explicites, prompts distincts par outil, historique enregistré, CV généré réutilisable. Les images passent par transcription vision.
- Statistiques : agrégats SQL et périodes réelles, données selon le rôle. Les indicateurs sans source disponible ne doivent pas être présentés comme des résultats calculés.

## Correspondance frontend / API

Les chemins ci-dessous commencent par /api.

| Écran ou parcours | API principale |
|---|---|
| Connexion / inscription | /users/login/, /users/register/, /users/me/ |
| Session / déconnexion | /users/token/refresh/, /users/logout/ |
| Mots de passe | /users/password-change/, /users/password-reset/, /users/password-reset-confirm/ |
| Profil candidat | /users/candidate/profile/, /users/me/, /preferences/ |
| CV candidat | /users/cvs/, /users/cvs/{id}/primary/, /fichiers/cv/{id}/ |
| Offres candidat et détail | /offres/, /offres/{id}/, /favoris/ |
| Candidatures candidat / recruteur | /candidatures/, /candidatures/{id}/ |
| Offres recruteur | /offres/recruteur/mes-offres/, /offres/recruteur/create/ |
| Édition / soumission offre | /offres/recruteur/{id}/update/, /offres/recruteur/{id}/submit/ |
| Entreprise recruteur | /users/recruiter/company/, request-verification/, request-modification/ |
| CVthèque / fiche candidat | /candidats/, /candidats/{id}/ |
| Entretiens | /entretiens/, /entretiens/{id}/ |
| Questions recruteur | /ia/questions-entretien/ |
| Analyse / simulation / conseil CV | /ia/analyse-offre/, /ia/simulation-entretien/, /ia/conseiller-cv/ |
| Documents IA | /ia/generer-cv/, /ia/lettre-motivation/, /ia/portfolio/, /generations/ |
| Alertes | /alertes/ |
| Notifications / messagerie | /notifications/, /messages/ |
| Tableaux de bord | /dashboard/ |
| Utilisateurs administrateur | /administration/users/, /administration/users/{id}/ |
| Entreprises administrateur | /administration/entreprises/, /administration/entreprises/{id}/ |
| Offres administrateur | /offres/admin/all/, /offres/admin/{id}/approve/, reject/ |
| Actions administrateur offre | /administration/offres/{id}/ |
| Statistiques / paramètres admin | /administration/statistics/, /administration/settings/ |
| Santé | /health/ |

Les adaptateurs frontend traduisent les champs Django vers les noms attendus par les composants existants. La sélection d’offre est transmise au détail. Une navigation vers la même page renouvelle son chargement après mutation.

La page notifications donne accès à la messagerie et aux entretiens ; le recruteur peut y modifier les dates, messages, lieux, liens et statuts. Un candidat peut créer un CV en ligne sans dépendre de l’IA.

## Validation

- 31 tests backend réussis sur PostgreSQL : JWT, droits des rôles, suspension, candidatures, confidentialité ATS, workflow, fichiers, profils, notifications, messagerie, alertes, email, imports IA, publication.
- django check : aucun problème détecté.
- Migrations appliquées ; contrôle sans migration manquante.
- Compilation frontend réussie.
- Rendu initial des 28 pages candidat/recruteur/admin vérifié.
- Rendu des mêmes 28 pages avec réponses API réelles issues d’une transaction de validation vérifié.
- HTTP local : frontend, santé backend, santé via proxy Vite et liste des offres répondent en 200 ; l’API confirme PostgreSQL.

Les tests IA simulent le transport fournisseur pour vérifier le contexte, les droits et la persistance. Ils ne prouvent pas le bon fonctionnement d’un compte Groq réel.

## Configuration externe et limites

GROQ_API_KEY est encore vide sur cette machine : les appels IA réels ne sont pas activés. Le modèle texte et le modèle vision sont configurables. Les formats multimodaux suivent la [documentation Groq](https://console.groq.com/docs/vision), et le client texte son [API de chat](https://console.groq.com/docs/api-reference).

Les emails utilisent actuellement le backend console ; SMTP doit être renseigné pour délivrer les réinitialisations et alertes aux utilisateurs. Les notifications dans l’application fonctionnent indépendamment de SMTP.

La visioconférence accepte un vrai lien fourni par le recruteur ; aucun serveur vidéo externe n’a été provisionné.

Le navigateur intégré n’était pas disponible. La validation visuelle, les clics et la navigation complète dans un navigateur restent à contrôler manuellement. Le contrôle de rendu et les tests API couvrent les erreurs techniques vérifiées, pas chaque interaction de formulaire.

Le build signale la taille du bundle ; le lint conserve des avertissements de code inutilisé provenant des composants existants. Aucun avertissement de composant non défini ou de dépendance React manquante n’était présent au dernier contrôle.

Aucun hébergement public n’a été déployé. Les valeurs des paramètres administrateur sont persistées ; seuls les réglages explicitement utilisés par le backend ont un effet opérationnel, les autres restent des préférences enregistrées.

## Utilisation

Ouvrir http://127.0.0.1:5173/. Créer vos comptes par inscription. Créer votre administrateur avec manage.py createsuperuser. Publier une offre côté recruteur, l’approuver côté administrateur, puis candidater avec un CV côté candidat.

Les identifiants sensibles restent dans backend/.env, exclu des fichiers de livraison versionnables. Les journaux, données locales PostgreSQL et fichiers utilisateurs restent dans leurs dossiers et sont exclus via .gitignore. Voir README.md pour les commandes et configurations.
