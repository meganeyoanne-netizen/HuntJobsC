# Audit UI initial — HuntJobs

49 fichiers source lus : React, services, hooks, CSS et layout. Le frontend comprend 33 pages : 9 candidat, 8 recruteur, 11 administrateur, 4 authentification et 1 page publique, plus la page de notifications transversale.

## Architecture et navigation

App.jsx conserve 28 destinations métier principales, les pages d’authentification et les notifications communes. La navigation est basée sur page/selected/navigationVersion, avec garde par rôle. Les API sont déjà connectées via services/api.js et useResource ; aucune substitution par des données simulées n’est prévue.

La référence visuelle pertinente est RecruiterDashboardPage : sidebar navy, bleu principal, petites touches cyan/violet/emerald.

## Composants et duplications

Les composants partagés existants sont Logo, ApiFeedback, LoadingPanel, AIResult, CVOnlineEditor, MessagesPanel et InterviewActions. CandidatLayout n’est qu’un wrapper ; les autres layouts sont incorporés aux pages.

Les pages candidat et recruteur contiennent chacune leur sidebar, header et navigation mobile. L’administration répète AdminSidebar/AdminNavbar, parfois comme fonctions locales. Les menus mobile se limitent souvent à 4–5 destinations et n’offrent pas d’accès complet aux autres pages.

StatCard, InfoCard, SectionHeader, FormField, EmptyState, Modal, badges, sélecteurs et navigations sont redéclarés sous des noms identiques avec des styles différents. Les détails métier restent propres à chaque page et doivent être conservés.

## Incohérences visuelles et UX

- Textes fréquents en 8–11 px ; pages denses difficiles à lire, particulièrement sur mobile.
- Navy divergent, multiples fonds #f4f7fc/#f6f8fc/#f5f8fc et rayons jusqu’à 32 px.
- Inter est déclaré mais aucun fichier de police n’est livré.
- Les formulaires d’authentification utilisent zoom 0.62–0.86 et overflow hidden, ce qui réduit la lisibilité ou coupe de longs formulaires.
- Les skeletons administrateur sont locaux, parfois déclenchés par une temporisation plutôt que par les requêtes. Les pages métier n’exploitent généralement pas loading/error retournés par useResource.
- Les états vides sont inégaux ; dashboards et listes annexes peuvent rester blancs lorsqu’aucune donnée n’existe.
- Modales sans structure commune, gestion du focus ou fermeture clavier systématique.
- Certains boutons icônes n’ont pas de nom accessible ; tailles tactiles souvent insuffisantes.
- Les actions API utilisent perform mais n’offrent pas systématiquement de protection contre les doubles clics.
- Le toast est unique et remplace le précédent, sans gestion de file, durée ou affichage adapté au mobile.
- Les pages sont importées immédiatement ; le bundle principal dépasse 1 Mo.
- Le helper download a une signature différente de plusieurs appels existants ; ce point frontend nécessite correction.

## Plan d’application

1. Tokens et police Inter locale, composants de base, skeletons, modale accessible et toasts.
2. Layout commun avec variations par rôle : sidebar navy, header, recherche/navigation, drawer mobile et bottom navigation.
3. Retrait des seules duplications de navigation, conservation des sections métier et API.
4. Harmonisation typographique, cartes, badges, formulaires, états vides et boutons.
5. Skeletons liés aux requêtes réelles, feedback des mutations, animations réduites quand demandé.
6. Vérification des destinations, imports, rendu vide/rempli et compilation.
7. Contrôle navigateur aux largeurs demandées : 320, 375, 390, 430, tablette, 1024, desktop et grand écran.

Les données de présentation existantes de la page publique seront conservées et identifiées comme un aperçu si nécessaire.
