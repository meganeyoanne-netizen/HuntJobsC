import CandidateDrawer from "../../components/common/CandidateDrawer";
import FormField from "../../components/ui/FormField";
import { Button, Form, Input } from "../../components/ui";

import { post, patch, remove, perform } from "../../services/api";
import { useResource } from "../../hooks/useResource";
import { dateLabel } from "../../services/adapters";

import { useMemo, useState } from "react";
import { Bell, BellOff, BriefcaseBusiness, Check, Clock3, Edit3, Mail, MapPin, Plus, Search, Settings2, Sparkles, Trash2, X } from "lucide-react";




/* =========================================================
   CONSTANTES
========================================================= */

const contractTypes = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
];

const experienceLevels = [
  "Débutant",
  "Intermédiaire",
  "Senior",
];

const frequencies = [
  "Immédiatement",
  "Quotidienne",
  "Hebdomadaire",
];


/* =========================================================
   SIDEBAR
========================================================= */




/* =========================================================
   PAGE PRINCIPALE
========================================================= */

function CandidateAlertsPage({
  user = {
    firstName: "",
    lastName: "",
  },
  onNavigate,
  onLogout,
}) {

  /* =======================================================
     ALERTES
  ======================================================= */

  const [alerts, setAlerts] = useResource("/alertes/",list=>list.map(a=>({...a,name:a.title,keywords:a.keyword,contracts:a.contracts?.length?a.contracts:a.contract?[a.contract]:[],experience:a.experience||"",domain:a.domain||"",salary:a.salary||"",frequency:a.frequency,email:a.email||false,matches:a.matches||0,createdAt:dateLabel(a.created_at)})));


  /* =======================================================
     MODAL
  ======================================================= */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);


  /* =======================================================
     SUPPRESSION
  ======================================================= */

  const [deleteId, setDeleteId] = useState(null);


  /* =======================================================
     FORMULAIRE
  ======================================================= */

  const emptyForm = {
    name: "",
    keywords: "",
    location: "",
    contracts: [],
    experience: "",
    domain: "",
    salary: "",
    frequency: "Quotidienne",
    email: true,
  };

  const [form, setForm] = useState(emptyForm);


  /* =======================================================
     OUVRIR CRÉATION
  ======================================================= */

  const openCreateModal = () => {

    setEditingAlert(null);

    setForm(emptyForm);

    setIsModalOpen(true);

  };


  /* =======================================================
     OUVRIR MODIFICATION
  ======================================================= */

  const openEditModal = (alert) => {

    setEditingAlert(alert);

    setForm({
      name: alert.name,
      keywords: alert.keywords,
      location: alert.location,
      contracts: alert.contracts,
      experience: alert.experience,
      domain: alert.domain,
      salary: alert.salary,
      frequency: alert.frequency,
      email: alert.email,
    });

    setIsModalOpen(true);

  };


  /* =======================================================
     FERMER MODAL
  ======================================================= */

  const closeModal = () => {

    setIsModalOpen(false);

    setEditingAlert(null);

    setForm(emptyForm);

  };


  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = (field, value) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };


  /* =======================================================
     CONTRAT
  ======================================================= */

  const toggleContract = (contract) => {

    setForm((previous) => {

      const exists =
        previous.contracts.includes(contract);

      return {
        ...previous,
        contracts: exists
          ? previous.contracts.filter(
              (item) => item !== contract
            )
          : [
              ...previous.contracts,
              contract,
            ],
      };

    });

  };


  /* =======================================================
     ENREGISTRER
  ======================================================= */

  const saveAlert = (event) => perform(async () => {event.preventDefault();const payload={title:form.name,keyword:form.keywords,location:form.location,contract:form.contracts[0]?.toUpperCase()||"",frequency:form.frequency,contracts:form.contracts,experience:form.experience,domain:form.domain,salary:form.salary,email:form.email};if(editingAlert)await patch("/alertes/"+editingAlert.id+"/",payload);else await post("/alertes/",payload);onNavigate("candidate-alerts");});


  /* =======================================================
     ACTIVATION
  ======================================================= */

  const toggleAlertStatus = (id) => perform(async () => {
    const current=alerts.find(a=>a.id===id); await patch("/alertes/"+id+"/",{active:!current.active});

    setAlerts((previous) =>
      previous.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              active: !alert.active,
            }
          : alert
      )
    );

  });


  /* =======================================================
     SUPPRESSION
  ======================================================= */

  const confirmDelete = (id) => perform(async () => {const target=id||deleteId;await remove("/alertes/"+target+"/");setAlerts(items=>items.filter(a=>a.id!==target));setDeleteId(null);});


  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const activeAlerts = alerts.filter(
    (alert) => alert.active
  ).length;

  const totalMatches = alerts.reduce(
    (total, alert) =>
      total + (alert.active ? alert.matches : 0),
    0
  );


  /* =======================================================
     APERÇU DYNAMIQUE
  ======================================================= */

  const estimatedMatches = useMemo(() => {

    let score = 4;

    if (form.keywords.trim()) {
      score += 5;
    }

    if (form.location.trim()) {
      score += 3;
    }

    if (form.contracts.length) {
      score += 2;
    }

    if (form.experience) {
      score += 2;
    }

    if (form.domain.trim()) {
      score += 3;
    }

    return score;

  }, [form]);


  const firstName =
    user?.firstName || "Candidat";


  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      


      {/* =====================================================
          CONTENU
      ===================================================== */}

      <div className="">

        <main className="min-h-screen">


          {/* =================================================
              TOPBAR
          ================================================= */}

          


          {/* =================================================
              CONTENU PAGE
          ================================================= */}

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

                <div className="max-w-2xl">

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-blue-100">

                    <Bell size={12} />

                    Alertes emploi

                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                    Ne manquez aucune opportunité.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                    Créez des alertes personnalisées et recevez les nouvelles offres correspondant à vos critères.
                  </p>

                </div>


                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-black text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
                >

                  <Plus size={15} />

                  Créer une alerte

                </Button>

              </div>

            </section>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <AlertStat
                icon={<Bell size={19} />}
                label="Alertes actives"
                value={activeAlerts}
                detail="Alertes actuellement activées"
              />

              <AlertStat
                icon={<BriefcaseBusiness size={19} />}
                label="Offres correspondantes"
                value={totalMatches}
                detail="Nouvelles opportunités détectées"
              />

              <AlertStat
                icon={<Mail size={19} />}
                label="Notifications"
                value="Activées"
                detail="Réception par email"
              />

            </section>


            {/* =================================================
                TITRE
            ================================================= */}

            <section className="mt-9">

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                    Mes préférences
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                    Mes alertes
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Gérez les alertes qui vous permettent de suivre les opportunités qui vous intéressent.
                  </p>

                </div>


                <Button
                  type="button"
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                >

                  <Plus size={14} />

                  Nouvelle alerte

                </Button>

              </div>


              {/* =================================================
                  LISTE ALERTES
              ================================================= */}

              <div className="mt-5 grid gap-4 xl:grid-cols-2">

                {alerts.map((alert) => (

                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onEdit={() =>
                      openEditModal(alert)
                    }
                    onToggle={() =>
                      toggleAlertStatus(
                        alert.id
                      )
                    }
                    onDelete={() =>
                      setDeleteId(alert.id)
                    }
                  />

                ))}


                {alerts.length === 0 && (

                  <div className="xl:col-span-2 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                      <Bell size={24} />

                    </div>

                    <h3 className="mt-5 text-base font-black text-slate-900">
                      Aucune alerte créée
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                      Créez votre première alerte afin de recevoir automatiquement les offres correspondant à votre profil.
                    </p>

                    <Button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                    >

                      <Plus size={14} />

                      Créer ma première alerte

                    </Button>

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                CONSEIL
            ================================================= */}

            <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Sparkles size={18} />
                </div>

                <div>

                  <h3 className="text-sm font-black text-slate-900">
                    Conseil JobConnect
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Créez plusieurs alertes avec des critères différents pour maximiser vos chances de découvrir des opportunités pertinentes.
                  </p>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>


      {/* =====================================================
          NAVIGATION MOBILE
      ===================================================== */}

      


      {/* =====================================================
          MODAL CRÉATION / MODIFICATION
      ===================================================== */}

      {isModalOpen && (

        <CandidateDrawer onClose={closeModal} className="fixed inset-0 z-[100]">

          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={closeModal}
          />


          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">

            {/* Header */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Configuration
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  {editingAlert
                    ? "Modifier l'alerte"
                    : "Créer une alerte"}
                </h2>

              </div>


              <Button aria-label="Fermer"
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
              >

                <X size={18} />

              </Button>

            </div>


            {/* Form */}

            <Form
              onSubmit={saveAlert}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7"
            >

              {/* Nom */}

              <FormField
                label="Nom de l'alerte"
                required
              >

                <Input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ex. Développeur React à Yaoundé"
                  className="form-input"
                  required
                />

              </FormField>


              {/* Mots-clés */}

              <FormField
                label="Mots-clés"
                description="Séparez les mots-clés par des virgules."
              >

                <div className="relative">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={form.keywords}
                    onChange={(event) =>
                      updateForm(
                        "keywords",
                        event.target.value
                      )
                    }
                    placeholder="React, Django, Python..."
                    className="form-input pl-10"
                  />

                </div>

              </FormField>


              {/* Localisation */}

              <FormField label="Localisation">

                <div className="relative">

                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <Input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Yaoundé, Douala..."
                    className="form-input pl-10"
                  />

                </div>

              </FormField>


              {/* Domaine */}

              <FormField label="Domaine">

                <Input
                  type="text"
                  value={form.domain}
                  onChange={(event) =>
                    updateForm(
                      "domain",
                      event.target.value
                    )
                  }
                  placeholder="Informatique, Finance, Gestion..."
                  className="form-input"
                />

              </FormField>


              {/* Contrats */}

              <FormField
                label="Types de contrat"
                description="Sélectionnez un ou plusieurs types."
              >

                <div className="flex flex-wrap gap-2">

                  {contractTypes.map(
                    (contract) => {

                      const selected =
                        form.contracts.includes(
                          contract
                        );

                      return (
                        <Button
                          key={contract}
                          type="button"
                          onClick={() =>
                            toggleContract(
                              contract
                            )
                          }
                          className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          {selected && (
                            <Check
                              size={12}
                              className="mr-1 inline"
                            />
                          )}

                          {contract}

                        </Button>
                      );

                    }
                  )}

                </div>

              </FormField>


              {/* Expérience */}

              <FormField label="Niveau d'expérience">

                <div className="grid grid-cols-3 gap-2">

                  {experienceLevels.map(
                    (level) => {

                      const selected =
                        form.experience ===
                        level;

                      return (
                        <Button
                          key={level}
                          type="button"
                          onClick={() =>
                            updateForm(
                              "experience",
                              level
                            )
                          }
                          className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {level}
                        </Button>
                      );

                    }
                  )}

                </div>

              </FormField>


              {/* Salaire */}

              <FormField
                label="Salaire minimum"
                description="Optionnel."
              >

                <Input
                  type="text"
                  value={form.salary}
                  onChange={(event) =>
                    updateForm(
                      "salary",
                      event.target.value
                    )
                  }
                  placeholder="Ex. 250 000 FCFA"
                  className="form-input"
                />

              </FormField>


              {/* Fréquence */}

              <FormField label="Fréquence des alertes">

                <div className="grid grid-cols-3 gap-2">

                  {frequencies.map(
                    (frequency) => {

                      const selected =
                        form.frequency ===
                        frequency;

                      return (
                        <Button
                          key={frequency}
                          type="button"
                          onClick={() =>
                            updateForm(
                              "frequency",
                              frequency
                            )
                          }
                          className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50"
                          }`}
                        >

                          <Clock3
                            size={13}
                            className="mx-auto mb-1"
                          />

                          {frequency}

                        </Button>
                      );

                    }
                  )}

                </div>

              </FormField>


              {/* Email */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Mail size={16} />
                    </div>

                    <div>

                      <p className="text-xs font-black text-slate-800">
                        Notifications par email
                      </p>

                      <p className="mt-1 text-xs leading-4 text-slate-400">
                        Recevoir les nouvelles offres correspondant à cette alerte.
                      </p>

                    </div>

                  </div>


                  <Button
                    type="button"
                    onClick={() =>
                      updateForm(
                        "email",
                        !form.email
                      )
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      form.email
                        ? "bg-blue-600"
                        : "bg-slate-300"
                    }`}
                  >

                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        form.email
                          ? "left-6"
                          : "left-1"
                      }`}
                    />

                  </Button>

                </div>

              </div>


              {/* Aperçu */}

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                    <Sparkles size={16} />
                  </div>

                  <div>

                    <p className="text-xs font-black text-slate-900">
                      Aperçu
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      En fonction de vos critères, JobConnect estime actuellement environ{" "}
                      <strong className="font-black text-blue-600">
                        {estimatedMatches} offres
                      </strong>{" "}
                      susceptibles de correspondre à cette alerte.
                    </p>

                  </div>

                </div>

              </div>


              {/* Boutons */}

              <div className="mt-7 flex gap-3 pb-3">

                <Button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </Button>

                <Button aria-label="Confirmer"
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >

                  <Check size={15} />

                  {editingAlert
                    ? "Enregistrer"
                    : "Créer l'alerte"}

                </Button>

              </div>

            </Form>

          </div>

        </CandidateDrawer>

      )}


      {/* =====================================================
          MODAL SUPPRESSION
      ===================================================== */}

      {deleteId && (

        <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">

          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />


          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={19} />
            </div>

            <h2 className="mt-5 text-lg font-black text-slate-900">
              Supprimer cette alerte ?
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Vous ne recevrez plus de notifications correspondant à cette alerte. Cette action est irréversible.
            </p>


            <div className="mt-6 flex gap-3">

              <Button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              >
                Annuler
              </Button>

              <Button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700"
              >
                Supprimer
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   ALERT STAT
========================================================= */

function AlertStat({
  icon,
  label,
  value,
  detail,
}) {

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/40">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs font-medium text-slate-400">
        {detail}
      </p>

    </div>
  );
}


/* =========================================================
   ALERT CARD
========================================================= */

function AlertCard({
  alert,
  onEdit,
  onToggle,
  onDelete,
}) {

  return (
    <article
      className={`group rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40 ${
        alert.active
          ? "border-slate-200 hover:border-blue-100"
          : "border-slate-200 opacity-75"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-start gap-3">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              alert.active
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >

            {alert.active ? (
              <Bell size={19} />
            ) : (
              <BellOff size={19} />
            )}

          </div>


          <div className="min-w-0">

            <h3 className="truncate text-sm font-black text-slate-900">
              {alert.name}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Créée {alert.createdAt}
            </p>

          </div>

        </div>


        <Button
          type="button"
          onClick={onToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            alert.active
              ? "bg-blue-600"
              : "bg-slate-300"
          }`}
        >

          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
              alert.active
                ? "left-6"
                : "left-1"
            }`}
          />

        </Button>

      </div>


      {/* Critères */}

      <div className="mt-5 grid gap-2 sm:grid-cols-2">

        <InfoItem
          icon={<Search size={13} />}
          label="Mots-clés"
          value={
            alert.keywords ||
            "Tous les postes"
          }
        />

        <InfoItem
          icon={<MapPin size={13} />}
          label="Localisation"
          value={
            alert.location ||
            "Toutes les villes"
          }
        />

        <InfoItem
          icon={<BriefcaseBusiness size={13} />}
          label="Contrat"
          value={
            alert.contracts.length
              ? alert.contracts.join(", ")
              : "Tous"
          }
        />

        <InfoItem
          icon={<Settings2 size={13} />}
          label="Expérience"
          value={
            alert.experience ||
            "Tous niveaux"
          }
        />

      </div>


      {/* Bottom */}

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex flex-wrap items-center gap-3">

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">

            <Clock3 size={13} />

            {alert.frequency}

          </div>


          {alert.email && (

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">

              <Mail size={13} />

              Email activé

            </div>

          )}


          <div className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-black text-blue-600">

            {alert.matches} offres

          </div>

        </div>


        <div className="flex items-center gap-2">

          <Button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
          >

            <Edit3 size={13} />

            Modifier

          </Button>


          <Button aria-label="Supprimer"
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-black text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >

            <Trash2 size={13} />

          </Button>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon,
  label,
  value,
}) {

  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">

      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-400">

        {icon}

        {label}

      </div>

      <p className="mt-1 truncate text-xs font-bold text-slate-600">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   FORM FIELD
========================================================= */




/* =========================================================
   MOBILE NAV
========================================================= */




/* =========================================================
   STYLES
========================================================= */

if (typeof document !== "undefined") {
const style = document.createElement("style");

style.innerHTML = `
  .form-input {
    width: 100%;
    border-radius: 0.75rem;
    border: 1px solid rgb(226 232 240);
    background: white;
    padding: 0.75rem 0.875rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(30 41 59);
    outline: none;
    transition: all 0.2s ease;
  }

  .form-input::placeholder {
    color: rgb(148 163 184);
    font-weight: 500;
  }

  .form-input:focus {
    border-color: rgb(37 99 235);
    box-shadow: 0 0 0 3px rgb(37 99 235 / 0.08);
  }
`;

if (
  typeof document !== "undefined" &&
  !document.head.querySelector(
    "[data-jobconnect-alerts-style]"
  )
) {
  style.setAttribute(
    "data-jobconnect-alerts-style",
    "true"
  );

  document.head.appendChild(style);
}


}
export default CandidateAlertsPage;
