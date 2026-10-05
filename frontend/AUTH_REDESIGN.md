# Refonte visuelle des pages d’authentification

Les pages de connexion, inscription, récupération et réinitialisation utilisent désormais un layout commun : panneau navy sur desktop, formulaire sur fond clair et défilement naturel de toute la page. Aucun formulaire n’est contraint à la hauteur de l’écran. Les tailles de champs, labels, cartes et actions sont uniformisées.

La logique des handlers, des validations, des étapes recruteur et des appels API reste conservée. Les contrôles natifs de checkbox et d’upload transmettent leurs props existantes ; le bouton de réinitialisation soumet le formulaire existant. Les champs de mot de passe disposent de contrôles nommés et correctement alignés.

Contrôles navigateur réalisés à 320, 375, 390, 430, 768, 1024 et 1440 px : connexion, inscription candidat, étape entreprise recruteur, récupération et réinitialisation. Aucun débordement horizontal constaté. Tous les champs affichés sont accessibles dans le défilement. La transition vers l’étape entreprise et l’upload multiple ont été vérifiés sans création de compte ni envoi de données au backend. L’affichage du mot de passe a également été vérifié.

Fichiers :

- src/components/layout/AuthLayout.jsx
- src/auth-design.css
- src/pages/auth/LoginPage.jsx
- src/pages/auth/RegisterPage.jsx
- src/pages/auth/ForgotPasswordPage.jsx
- src/pages/auth/ResetPasswordPage.jsx

Les fichiers temporaires de prévisualisation et de transformation ont été supprimés. App.jsx et le backend n’ont pas été modifiés.
