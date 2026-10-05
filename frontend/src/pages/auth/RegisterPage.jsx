import AuthLayout from "../../components/layout/AuthLayout";
import { Button, Form, Textarea, Input as NativeInput } from "../../components/ui";
import { useLanguage } from "../../context/LanguageContext";
import { report } from "../../services/api";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, FileUp, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";



function RegisterPage({
  onRegister,
  onLogin,
  onBack,
  decorativeSide = "left",
}) {
  const { t } = useLanguage();
  const [role, setRole] = useState("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Candidat
    phone: "",

    // Recruteur
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    position: "",
    companyNui: "",
    companyDescription: "",
    companyDocuments: [],

    acceptTerms: false,
  });

  const recruiterSteps = 2;
  const currentStep = role === "recruiter" ? step : 1;

  const isStepValid = (deferCompany = false) => {
    if (role !== "recruiter") {
      return true;
    }

    if (currentStep === 1 || deferCompany) {
      if (!formData.firstName.trim()) {
        alert("Veuillez renseigner votre prénom.");
        return false;
      }

      if (!formData.lastName.trim()) {
        alert("Veuillez renseigner votre nom.");
        return false;
      }

      if (!formData.email.trim()) {
        alert("Veuillez renseigner votre adresse email.");
        return false;
      }

      if (formData.password.length < 8) {
        alert("Le mot de passe doit contenir au moins 8 caractères.");
        return false;
      }

      if (!/[A-Z]/.test(formData.password)) {
        alert("Le mot de passe doit contenir au moins une majuscule.");
        return false;
      }

      if (!/[0-9]/.test(formData.password)) {
        alert("Le mot de passe doit contenir au moins un chiffre.");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return false;
      }

      return true;
    }

    if (!formData.companyName.trim()) {
      alert("Veuillez renseigner le nom de l'entreprise.");
      return false;
    }

    if (!formData.companyEmail.trim()) {
      alert("Veuillez renseigner l'email professionnel de l'entreprise.");
      return false;
    }

    if (!formData.companyNui.trim()) {
      alert("Veuillez renseigner le NUI de l'entreprise.");
      return false;
    }

    if (!formData.companyDescription.trim()) {
      alert("Veuillez ajouter une description de l'entreprise.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setStep(1);
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!isStepValid()) {
      return;
    }

    if (role === "recruiter" && currentStep < recruiterSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (role === "recruiter" && step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      companyDocuments: files,
    }));
  };

  const handleSubmit = async (e, deferCompany = false) => {
    e.preventDefault();
    if (loading) return;

    if (role === "recruiter" && currentStep !== recruiterSteps) {
      return;
    }

    if (!isStepValid(deferCompany)) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!formData.acceptTerms) {
      alert("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);

    try {
      if (onRegister) {
        await onRegister({
          ...formData,
          companyDocuments: deferCompany ? [] : formData.companyDocuments,
          deferCompany,
          role,
        });
      }
    } catch(error) { report(error); } finally {
      setLoading(false);
    }
  };

  return (<AuthLayout variant="register" decorativeSide={decorativeSide} onBack={onBack}><div className="auth-form-body">

            {/* Retour */}

            


            {/* Titre */}

            <div>

              <div className="mb-5 inline-flex rounded-2xl bg-blue-50 dark:bg-blue-950 p-3 text-blue-600 dark:text-blue-400">
                <UserRound size={24} />
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {t("auth.registerTitle", "Créer votre compte")}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t("auth.registerSubtitle", "Rejoignez JobConnect et accédez à un espace adapté à votre profil.")}
              </p>

            </div>


            {/* =================================================
                CHOIX DU ROLE
            ================================================= */}

            <div className="mt-8">

              <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                {t("auth.roleChoice", "Je souhaite utiliser JobConnect en tant que")}
              </p>


              <div className="grid gap-3 sm:grid-cols-2">

                <RoleCard
                  active={role === "candidate"}
                  icon={<UserRound size={22} />}
                  title={t("auth.roleCandidateBadge", "Candidat")}
                  description={t("nav.candidateDesc", "Trouver un emploi ou un stage")}
                  onClick={() => handleRoleChange("candidate")}
                />

                <RoleCard
                  active={role === "recruiter"}
                  icon={<Building2 size={22} />}
                  title={t("auth.roleRecruiterBadge", "Recruteur")}
                  description={t("nav.recruiterDesc", "Publier des offres et trouver des talents")}
                  onClick={() => handleRoleChange("recruiter")}
                />

              </div>

            </div>

            {role === "recruiter" && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  <span>Étape {currentStep} / {recruiterSteps}</span>
                  <span>{currentStep === 1 ? "Informations personnelles" : "Entreprise"}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className={`h-2 rounded-full ${
                        item <= currentStep ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}


            {/* =================================================
                FORMULAIRE
            ================================================= */}

            <Form
              onSubmit={role === "recruiter" && currentStep < recruiterSteps ? handleNextStep : handleSubmit}
              className="mt-8 space-y-7"
            >

              {role !== "recruiter" || currentStep === 1 ? (
                <>
                  <Section
                    title="Informations personnelles"
                    description="Ces informations seront associées à votre compte."
                  >

                    <div className="grid gap-5 sm:grid-cols-2">

                      <Input
                        label="Prénom"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Michel"
                        required
                      />

                      <Input
                        label="Nom"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Bonyomo"
                        required
                      />

                    </div>


                    <div className="mt-5 grid gap-5 sm:grid-cols-2">

                      <Input
                        label="Adresse email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="vous@email.com"
                        required
                      />

                      <Input
                        label="Téléphone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+237 ..."
                      />

                    </div>

                  </Section>


                  <Section
                    title="Sécurité du compte"
                    description="Choisissez un mot de passe suffisamment sécurisé."
                  >

                    <div className="grid gap-5 sm:grid-cols-2">

                      <PasswordInput
                        label="Mot de passe"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        show={showPassword}
                        setShow={setShowPassword}
                        required
                      />

                      <PasswordInput
                        label="Confirmer le mot de passe"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        show={showConfirmPassword}
                        setShow={setShowConfirmPassword}
                        required
                      />

                    </div>


                    <div className="mt-4 rounded-xl bg-slate-50 p-4">

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

                        <PasswordRule
                          valid={formData.password.length >= 8}
                          text="8 caractères minimum"
                        />

                        <PasswordRule
                          valid={/[A-Z]/.test(formData.password)}
                          text="Une majuscule"
                        />

                        <PasswordRule
                          valid={/[0-9]/.test(formData.password)}
                          text="Un chiffre"
                        />

                      </div>

                    </div>

                  </Section>
                </>
              ) : (
                <Section
                  title="Informations de l'entreprise"
                  description="Complétez votre entreprise maintenant ou renseignez ces informations plus tard dans votre espace recruteur."
                >

                  <div className="space-y-5">

                    <Input
                      label="Nom de l'entreprise"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Nom de votre entreprise"
                      required
                    />


                    <div className="grid gap-5 sm:grid-cols-2">

                      <Input
                        label="Email professionnel"
                        name="companyEmail"
                        type="email"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        placeholder="contact@entreprise.com"
                        required
                      />

                      <Input
                        label="Téléphone professionnel"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        placeholder="+237 ..."
                      />

                    </div>


                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="NUI"
                        name="companyNui"
                        value={formData.companyNui}
                        onChange={handleChange}
                        placeholder="Numéro d'identification unique"
                        required
                      />

                      <Input
                        label="Votre fonction"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="Responsable RH, Directeur, Manager..."
                      />
                    </div>


                    <div>

                      <label htmlFor="companyDescription" className="mb-2 block text-sm font-bold text-slate-700">
                        Description de l'entreprise
                      </label>

                      <Textarea
                        id="companyDescription"
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Présentez brièvement votre entreprise, son activité et ses besoins..."
                        required
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>


                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Importer des documents
                      </label>

                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <FileUp size={18} />
                          </div>
                          <NativeInput
                            aria-label="Documents de l’entreprise" type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                            onChange={handleDocumentsChange}
                            className="w-full max-w-xs text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
                          />
                        </div>

                        {formData.companyDocuments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.companyDocuments.map((file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-slate-700"
                              >
                                <span className="truncate">{file.name}</span>
                                <span className="text-slate-500">{Math.round(file.size / 1024)} KB</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                      <div className="flex gap-3">

                        <div className="mt-0.5 rounded-lg bg-blue-100 p-2 text-blue-600">
                          <ShieldCheck size={17} />
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-800">
                            Profil recruteur vérifié
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Après votre inscription, votre compte pourra être
                            vérifié par l'équipe JobConnect. Un badge pourra alors
                            être affiché sur votre profil et vos offres.
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </Section>
              )}


              {/* =================================================
                  CONDITIONS
              ================================================= */}

              <label className="flex cursor-pointer items-start gap-3">

                <NativeInput
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
                />

                <span className="text-sm leading-6 text-slate-500">

                  J'accepte les conditions d'utilisation et la politique
                          de confidentialité de JobConnect.

                </span>

              </label>


              {/* =================================================
                  BOUTON
              ================================================= */}

              {role === "recruiter" && currentStep < recruiterSteps ? (
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="group flex h-13 flex-1 items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30"
                  >
                    Suivant
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (

                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Création du compte...

                    </>

                  ) : (

                    <>
                      Créer mon compte

                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />

                    </>

                  )}

                </Button>
              )}

              {role === "recruiter" && currentStep === recruiterSteps && (
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  <ArrowLeft size={16} />
                  Étape précédente
                </Button>
              )}

              {role === "recruiter" && currentStep === recruiterSteps && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                  <Button type="button" disabled={loading}
                    onClick={(event) => handleSubmit(event, true)}
                    className="w-full whitespace-normal text-sm font-bold text-blue-700 disabled:opacity-60">
                    Renseigner mon entreprise plus tard
                    <ArrowRight size={16} className="shrink-0" />
                  </Button>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Votre compte sera créé. Vous pourrez compléter ces informations dans la rubrique Entreprise de la plateforme.
                  </p>
                </div>
              )}


              {/* Connexion */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">

                <p className="text-sm text-slate-500">
                  Vous avez déjà un compte ?
                </p>

                <Button
                  type="button"
                  onClick={onLogin}
                  className="mt-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Se connecter
                </Button>

              </div>


              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

                <LockKeyhole size={13} />

                Vos données sont protégées et sécurisées.

              </div>

            </Form>

          </div></AuthLayout>);
}


/* =========================================================
   FEATURE
========================================================= */




/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({
  active,
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
        active
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
      }`}
    >

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
        }`}
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>


      {active && (

        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">

          <Check size={12} />

        </div>

      )}

    </Button>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">

      <div className="mb-6">

        <h3 className="text-base font-extrabold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

      {children}

    </section>
  );
}


/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        {type === "email" && (
          <Mail
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <NativeInput
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            type === "email" ? "pl-11 pr-4" : "px-4"
          }`}
        />

      </div>

    </div>
  );
}


/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  name,
  value,
  onChange,
  show,
  setShow,
  required = false,
}) {
  return (
    <div>

      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        <LockKeyhole
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <NativeInput
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <Button
          type="button"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </Button>

      </div>

    </div>
  );
}


/* =========================================================
   PASSWORD RULE
========================================================= */

function PasswordRule({ valid, text }) {
  return (
    <div className="flex items-center gap-1.5">

      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        <Check size={10} />
      </span>

      {text}

    </div>
  );
}


export default RegisterPage;
