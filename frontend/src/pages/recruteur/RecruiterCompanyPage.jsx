import FormField from "../../components/ui/FormField";
import { Textarea, Input, Button } from "../../components/ui";
import { useEffect } from "react";
import { api, patch, perform, success, download } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { companyAdapter, companyPayload } from "../../services/adapters";

import { useState } from "react";
import { ArrowRight, Building2, Check, FileText, Globe, Lock, Mail, MapPin, Phone, Save, ShieldCheck, Upload, Users, BriefcaseBusiness } from "lucide-react";



function RecruiterCompanyPage({
  user = {
    firstName: "",
    lastName: "",
    companyName: "JobConnect",
  },
  onNavigate,
  onLogout,
}) {
  const companyName =
    user?.companyName ||
    user?.company?.name ||
    "JobConnect";

  const recruiterName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : "Recruteur";

  /*
   * ==========================================================
   * ETAT DE L'ENTREPRISE
   * ==========================================================
   *
   * pending = demande envoyée, attente de validation admin
   * verified = entreprise validée
   * incomplete = profil pas encore soumis
   *
   * Dans le futur ces valeurs viendront du backend Django.
   */

  const [verificationStatus, setVerificationStatus] =
    useState("incomplete");

  const [professionalEmail, setProfessionalEmail] =
    useState("");

  const [nui, setNui] = useState("");

  const [emailLocked, setEmailLocked] =
    useState(false);

  const [nuiLocked, setNuiLocked] =
    useState(false);

  const [companyForm, setCompanyForm] = useState({name:"",sector:"",description:"",website:"",phone:"",address:"",employees:""});

  const [logoPreview, setLogoPreview] =
    useState(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  const navigate = (destination, data = null) => {
    onNavigate?.(destination, data);
  };

  /*
   * ==========================================================
   * FORMULAIRE
   * ==========================================================
   */

  const [companyData,,reloadCompany]=useResource("/users/recruiter/company/",v=>v,null);
  const [logoFile,setLogoFile]=useState(null);
  useEffect(()=>{if(companyData){setCompanyForm(companyAdapter(companyData));setProfessionalEmail(companyData.email_professionnel);setNui(companyData.nui);setEmailLocked(companyData.email_professionnel_locked&&!companyData.email_modification_allowed);setNuiLocked(companyData.nui_locked&&!companyData.nui_modification_allowed);setVerificationStatus(companyData.verification_status==="VERIFIED"?"verified":companyData.verification_status==="PENDING"?"pending":"incomplete");setLogoPreview(companyData.logo);}},[companyData]);
  const handleCompanyChange = (field, value) => {
    setCompanyForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setLogoPreview(imageUrl);setLogoFile(file);
  };

  /*
   * ==========================================================
   * SAUVEGARDE
   * ==========================================================
   */

  const handleSave = () => perform(async () => {setIsSaving(true);try{const payload=companyPayload(companyForm,professionalEmail,nui);if(emailLocked)delete payload.email_professionnel;if(nuiLocked)delete payload.nui;const form=new FormData();Object.entries(payload).forEach(([key,value])=>form.append(key,value||""));if(logoFile)form.append("logo",logoFile);await api("/users/recruiter/company/",{method:"PATCH",body:form});reloadCompany();setSaved(true);}finally{setIsSaving(false);}});

  /*
   * ==========================================================
   * DEMANDE DE VERIFICATION
   * ==========================================================
   */

  const [verificationFiles,setVerificationFiles]=useState({});
  const handleVerificationRequest = () => perform(async () => {await patch("/users/recruiter/company/",companyPayload(companyForm,professionalEmail,nui));const form=new FormData();form.append("email_professionnel",professionalEmail);form.append("nui",nui);Object.entries(verificationFiles).forEach(([k,v])=>{if(v)form.append(k,v);});await api("/users/recruiter/company/request-verification/",{method:"POST",body:form});reloadCompany();success("Demande de vérification envoyée.");});

  /*
   * ==========================================================
   * SIDEBAR
   * ==========================================================
   */

  

  

  /*
   * ==========================================================
   * RENDU
   * ==========================================================
   */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fc] text-slate-900">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="">

        {/* HEADER */}

        

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <main className="px-4 pb-28 pt-6 sm:px-7 sm:pt-8 lg:px-9 lg:pb-10">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#071A36] via-[#123c88] to-[#2377dc] p-7 text-white shadow-2xl shadow-blue-900/20 sm:p-9">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur">

                  {verificationStatus ===
                  "verified" ? (
                    <>
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-blue-950">
                        <Check size={10} />
                      </span>

                      <span className="text-xs font-black uppercase tracking-[0.15em]">
                        Entreprise vérifiée
                      </span>
                    </>
                  ) : verificationStatus ===
                    "pending" ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                      <span className="text-xs font-black uppercase tracking-[0.15em]">
                        Vérification en cours
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />

                      <span className="text-xs font-black uppercase tracking-[0.15em]">
                        Profil entreprise
                      </span>
                    </>
                  )}

                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl">

                  {companyForm.name}

                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/80 sm:text-base">
                  Gérez les informations de votre entreprise,
                  complétez votre profil et suivez votre
                  statut de vérification JobConnect.
                </p>

              </div>

              <div className="hidden lg:block">

                <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-md">

                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo entreprise"
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <Building2
                      size={48}
                      className="text-cyan-200"
                    />
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* STATUS */}

          <section className="mt-7 grid gap-5 md:grid-cols-3">

            <StatusCard
              icon={<Building2 size={22} />}
              title="Profil entreprise"
              description="Informations générales"
              status="Complété"
              color="blue"
            />

            <StatusCard
              icon={<ShieldCheck size={22} />}
              title="Vérification"
              description="NUI et e-mail professionnel"
              status={
                verificationStatus ===
                "verified"
                  ? "Vérifiée"
                  : verificationStatus ===
                    "pending"
                  ? "En attente"
                  : "À vérifier"
              }
              color={
                verificationStatus ===
                "verified"
                  ? "emerald"
                  : verificationStatus ===
                    "pending"
                  ? "amber"
                  : "violet"
              }
            />

            <StatusCard
              icon={<BriefcaseBusiness size={22} />}
              title="Recrutement"
              description="Votre activité"
              status="Active"
              color="cyan"
            />

          </section>

          {/* GRID PRINCIPALE */}

          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

            {/* INFORMATIONS */}

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
                    Informations
                  </p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Informations de l'entreprise
                  </h2>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Building2 size={20} />
                </div>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <FormField
                  label="Nom de l'entreprise"
                  value={companyForm.name}
                  onChange={(value) =>
                    handleCompanyChange(
                      "name",
                      value
                    )
                  }
                  icon={<Building2 size={16} />}
                />

                <FormField
                  label="Secteur d'activité"
                  value={companyForm.sector}
                  onChange={(value) =>
                    handleCompanyChange(
                      "sector",
                      value
                    )
                  }
                  icon={<BriefcaseBusiness size={16} />}
                />

                <FormField
                  label="Site web"
                  value={companyForm.website}
                  onChange={(value) =>
                    handleCompanyChange(
                      "website",
                      value
                    )
                  }
                  icon={<Globe size={16} />}
                />

                <FormField
                  label="Téléphone"
                  value={companyForm.phone}
                  onChange={(value) =>
                    handleCompanyChange(
                      "phone",
                      value
                    )
                  }
                  icon={<Phone size={16} />}
                />

                <FormField
                  label="Adresse"
                  value={companyForm.address}
                  onChange={(value) =>
                    handleCompanyChange(
                      "address",
                      value
                    )
                  }
                  icon={<MapPin size={16} />}
                />

                <FormField
                  label="Taille de l'entreprise"
                  value={companyForm.employees}
                  onChange={(value) =>
                    handleCompanyChange(
                      "employees",
                      value
                    )
                  }
                  icon={<Users size={16} />}
                />

                <div className="md:col-span-2">

                  <label className="text-xs font-black text-slate-700">
                    Présentation de l'entreprise
                  </label>

                  <Textarea
                    value={
                      companyForm.description
                    }
                    onChange={(event) =>
                      handleCompanyChange(
                        "description",
                        event.target.value
                      )
                    }
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* LOGO */}

              <div className="border-t border-slate-100 p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600">

                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo entreprise"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2
                        size={28}
                      />
                    )}

                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-black text-slate-800">
                      Logo de l'entreprise
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Ajoutez un logo pour renforcer
                      l'identité de votre entreprise
                      sur vos offres.
                    </p>

                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">

                    <Upload size={15} />

                    Importer

                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={
                        handleLogoUpload
                      }
                    />

                  </label>

                </div>

              </div>

              {/* SAVE */}

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-5">

                <div className="flex items-center gap-2">

                  {saved && (
                    <>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check size={14} />
                      </span>

                      <span className="text-xs font-bold text-emerald-600">
                        Modifications enregistrées
                      </span>
                    </>
                  )}

                </div>

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Enregistrer
                    </>
                  )}

                </Button>

              </div>

            </section>

            {/* VERIFICATION */}

            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

              <div className="border-b border-slate-100 px-6 py-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <ShieldCheck size={22} />
                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.17em] text-violet-600">
                      Vérification
                    </p>

                    <h2 className="mt-1 text-lg font-black">
                      Identité entreprise
                    </h2>

                  </div>

                </div>

              </div>

              <div className="p-6">

                {/* MESSAGE */}

                {verificationStatus ===
                  "verified" && (

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <Check size={20} />
                      </div>

                      <div>

                        <p className="text-sm font-black text-emerald-800">
                          ✓ Entreprise vérifiée
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-700/70">
                          Votre entreprise a été
                          validée par l'administration
                          JobConnect.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {verificationStatus ===
                  "pending" && (

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <ShieldCheck size={20} />
                      </div>

                      <div>

                        <p className="text-sm font-black text-amber-800">
                          Vérification en attente
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700/70">
                          Votre demande est actuellement
                          examinée par l'administration
                          JobConnect.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {verificationStatus ===
                  "incomplete" && (

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                    <p className="text-sm font-black text-blue-900">
                      Faites vérifier votre entreprise
                    </p>

                    <p className="mt-2 text-xs leading-5 text-blue-700/70">
                      Renseignez votre e-mail professionnel
                      et votre NUI pour envoyer votre
                      demande de vérification.
                    </p>

                  </div>

                )}

                <div className="mt-6 space-y-3">{[["document_immatriculation","Document d’immatriculation"],["preuve_activite","Preuve d’activité"]].map(([key,label])=><label key={key} className="block text-xs font-bold">{label}<Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e=>setVerificationFiles(v=>({...v,[key]:e.target.files[0]}))} className="mt-2 block w-full text-xs" />{companyData?.[key]&&<Button type="button" onClick={()=>perform(()=>download(companyData[key],label+".pdf"))}>Télécharger le document enregistré</Button>}</label>)}</div>
                {/* EMAIL */}

                <div className="mt-6">

                  <label className="flex items-center justify-between text-xs font-black text-slate-700">

                    <span>
                      E-mail professionnel
                    </span>

                    {emailLocked && (
                      <span className="flex items-center gap-1 text-xs font-black text-slate-400">
                        <Lock size={11} />
                        Verrouillé
                      </span>
                    )}

                  </label>

                  <div className="relative mt-2">

                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <Input
                      type="email"
                      value={
                        professionalEmail
                      }
                      disabled={emailLocked}
                      onChange={(event) =>
                        setProfessionalEmail(
                          event.target.value
                        )
                      }
                      placeholder="contact@entreprise.com"
                      className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition ${
                        emailLocked
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      }`}
                    />

                  </div>

                </div>

                {/* NUI */}

                <div className="mt-5">

                  <label className="flex items-center justify-between text-xs font-black text-slate-700">

                    <span>
                      NUI de l'entreprise
                    </span>

                    {nuiLocked && (
                      <span className="flex items-center gap-1 text-xs font-black text-slate-400">
                        <Lock size={11} />
                        Verrouillé
                      </span>
                    )}

                  </label>

                  <div className="relative mt-2">

                    <FileText
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <Input
                      type="text"
                      value={nui}
                      disabled={nuiLocked}
                      onChange={(event) =>
                        setNui(
                          event.target.value
                        )
                      }
                      placeholder="MXXXXXXXXXXXXXX"
                      className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition ${
                        nuiLocked
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      }`}
                    />

                  </div>

                </div>

                {/* DOCUMENT */}

                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <FileText size={17} />
                    </div>

                    <div className="flex-1">

                      <p className="text-xs font-black text-slate-700">
                        Justificatif entreprise
                      </p>

                      <p className="mt-1 text-xs leading-4 text-slate-400">
                        Récépissé, registre de commerce
                        ou document officiel.
                      </p>

                    </div>

                    <Button aria-label="Importer un fichier"
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Upload size={15} />
                    </Button>

                  </div>

                </div>

                {/* IMPORTANT */}

                <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4">

                  <Lock
                    size={16}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Après l'envoi de la demande, l'e-mail
                    professionnel et le NUI ne pourront
                    plus être modifiés directement.
                    Pour effectuer une modification,
                    contactez l'administration JobConnect.
                  </p>

                </div>

                {/* UNIQUE VERIFICATION BUTTON */}

                {verificationStatus ===
                  "incomplete" && (

                  <Button
                    type="button"
                    onClick={
                      handleVerificationRequest
                    }
                    className="group mt-6 flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-4 text-xs font-black text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/30"
                  >

                    <span className="flex items-center gap-3">

                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                        <ShieldCheck size={17} />
                      </span>

                      Demander la vérification

                    </span>

                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />

                  </Button>

                )}

                {verificationStatus ===
                  "pending" && (

                  <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-center">

                    <p className="text-xs font-black text-amber-700">
                      Demande envoyée — en attente de
                      validation administrative
                    </p>

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* INFORMATIONS COMPLEMENTAIRES */}

          <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <div className="border-b border-slate-100 px-6 py-6">

              <p className="text-xs font-black uppercase tracking-[0.17em] text-cyan-600">
                Fonctionnement
              </p>

              <h2 className="mt-2 text-xl font-black">
                Processus de vérification
              </h2>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-4">

              <VerificationStep
                number="01"
                title="Créer le compte"
                text="L'entreprise peut s'inscrire et accéder à la plateforme même sans être vérifiée."
                color="blue"
                active
              />

              <VerificationStep
                number="02"
                title="Renseigner les informations"
                text="Complétez votre e-mail professionnel et votre NUI."
                color="violet"
                active={
                  verificationStatus !==
                  "incomplete"
                }
              />

              <VerificationStep
                number="03"
                title="Examen administratif"
                text="L'administration vérifie les informations fournies."
                color="cyan"
                active={
                  verificationStatus ===
                    "pending" ||
                  verificationStatus ===
                    "verified"
                }
              />

              <VerificationStep
                number="04"
                title="Entreprise vérifiée"
                text="Après validation, le badge ✓ Entreprise vérifiée est associé à l'entreprise."
                color="emerald"
                active={
                  verificationStatus ===
                  "verified"
                }
              />

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      

    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  icon,
  title,
  description,
  status,
  color,
}) {
  const styles = {
    blue: {
      icon: "bg-blue-100 text-blue-600",
      status: "text-blue-600 bg-blue-50",
    },
    violet: {
      icon: "bg-violet-100 text-violet-600",
      status:
        "text-violet-600 bg-violet-50",
    },
    cyan: {
      icon: "bg-cyan-100 text-cyan-600",
      status: "text-cyan-600 bg-cyan-50",
    },
    emerald: {
      icon:
        "bg-emerald-100 text-emerald-600",
      status:
        "text-emerald-600 bg-emerald-50",
    },
    amber: {
      icon: "bg-amber-100 text-amber-600",
      status:
        "text-amber-600 bg-amber-50",
    },
  };

  const current =
    styles[color] || styles.blue;

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">

      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-slate-50 transition duration-500 group-hover:scale-150" />

      <div className="relative flex items-center gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.icon} transition duration-500 group-hover:scale-110`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-black text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>

        </div>

        <span
          className={`rounded-lg px-2.5 py-1.5 text-xs font-black ${current.status}`}
        >
          {status}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */



/* =========================================================
   VERIFICATION STEP
========================================================= */

function VerificationStep({
  number,
  title,
  text,
  color,
  active,
}) {
  const styles = {
    blue:
      "bg-blue-100 text-blue-600",
    violet:
      "bg-violet-100 text-violet-600",
    cyan:
      "bg-cyan-100 text-cyan-600",
    emerald:
      "bg-emerald-100 text-emerald-600",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-500 ${
        active
          ? "border-slate-200 bg-white shadow-md hover:-translate-y-1 hover:shadow-xl"
          : "border-slate-100 bg-slate-50 opacity-60"
      }`}
    >

      <div className="flex items-center justify-between">

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${
            styles[color]
          }`}
        >
          {number}
        </span>

        {active && (
          <Check
            size={16}
            className="text-emerald-500"
          />
        )}

      </div>

      <h3 className="mt-5 text-sm font-black text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */



export default RecruiterCompanyPage;