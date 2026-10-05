import FormField from "../../components/ui/FormField";
import { Button, Textarea, Input, Form, ModalFrame } from "../../components/ui";
import { api } from "../../services/api";
import { useEffect } from "react";
import { patch, perform, success } from "../../services/api";
import { useResource } from "../../hooks/useResource";


import { useMemo, useRef, useState } from "react";

import { BriefcaseBusiness, Camera, CalendarDays, Check, FileText, Globe2, GraduationCap, Mail, MapPin, Pencil, Phone, Plus, Save, Search, Settings2, Sparkles, Trash2, UserRound, X, Eye, EyeOff, Building2 } from "lucide-react";




/* =========================================================
   CANDIDATE PROFILE PAGE
========================================================= */

function CandidateProfilePage({
  user = {
    firstName: "",
    lastName: "",
    email: "michel@example.com",
  },
  onNavigate,
  onLogout,
  onUserUpdated,
}) {
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  /* =======================================================
     STATE
  ======================================================= */

  const [activeSection, setActiveSection] = useState("personal");

  const [saved, setSaved] = useState(false);

  const [profileVisible, setProfileVisible] = useState(true);

  /* -------------------------------------------------------
     PHOTO
  ------------------------------------------------------- */

  const [profilePhoto, setProfilePhoto] = useState(user.avatar || null);

  const [photoModal, setPhotoModal] = useState(false);

  const fileInputRef = useRef(null);

  /* -------------------------------------------------------
     INFORMATIONS PERSONNELLES
  ------------------------------------------------------- */

  const [personal, setPersonal] = useState({firstName,lastName,email:user?.email||"",phone:"",location:"",website:"",bio:"",title:"",availability:"",yearsExperience:0,languages:""});

  /* -------------------------------------------------------
     COMPÉTENCES
  ------------------------------------------------------- */

  const [skills, setSkills] = useState([]);

  const [newSkill, setNewSkill] = useState("");

  /* -------------------------------------------------------
     EXPÉRIENCES
  ------------------------------------------------------- */

  const [experiences, setExperiences] = useState([]);

  const [experienceModal, setExperienceModal] = useState(false);

  const [editingExperience, setEditingExperience] = useState(null);

  const [experienceForm, setExperienceForm] = useState({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  /* -------------------------------------------------------
     FORMATIONS
  ------------------------------------------------------- */

  const [education, setEducation] = useState([]);

  const [educationModal, setEducationModal] = useState(false);

  const [editingEducation, setEditingEducation] = useState(null);

  const [educationForm, setEducationForm] = useState({
    school: "",
    degree: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  /* -------------------------------------------------------
     PRÉFÉRENCES
  ------------------------------------------------------- */

  const [preferences, setPreferences] = useState({contracts:[],domains:[],locations:[],remote:false});

  const [newDomain, setNewDomain] = useState("");

  const [newLocation, setNewLocation] = useState("");

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const [profileData] = useResource("/users/candidate/profile/",v=>v,null);
  const [preferenceData]=useResource("/preferences/",v=>v,null);
  useEffect(()=>{if(profileData){setPersonal(v=>({...v,phone:user.telephone||"",location:profileData.localisation,website:profileData.portfolio_url,bio:profileData.bio,title:profileData.titre_professionnel,availability:profileData.disponibilite,yearsExperience:profileData.annees_experience,languages:profileData.langues.map(l=>typeof l==="string"?l:l.name).join(", ")}));setSkills(profileData.competences);setExperiences(profileData.experiences);setEducation(profileData.formations);setProfileVisible(profileData.is_profile_public);}},[profileData,user.telephone]);
  useEffect(() => { setProfilePhoto(user.avatar || null); }, [user.avatar]);
  useEffect(()=>{if(preferenceData?.candidate)setPreferences(preferenceData.candidate);},[preferenceData]);
  

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const completion = useMemo(() => {
    let score = 0;

    if (personal.firstName && personal.lastName) score += 15;
    if (personal.email) score += 10;
    if (personal.phone) score += 10;
    if (personal.location) score += 10;
    if (personal.bio) score += 15;
    if (skills.length >= 3) score += 15;
    if (experiences.length > 0) score += 10;
    if (education.length > 0) score += 10;
    if (preferences.contracts.length > 0) score += 5;

    return Math.min(score, 100);
  }, [
    personal,
    skills,
    experiences,
    education,
    preferences,
  ]);

  /* =======================================================
     PERSONAL
  ======================================================= */

  const handlePersonalChange = (field, value) => {
    setPersonal((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  /* =======================================================
     SKILLS
  ======================================================= */

  const handleAddSkill = () => {
    const value = newSkill.trim();

    if (!value) return;

    if (
      !skills.some(
        (skill) =>
          skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSkills((prev) => [...prev, value]);
    }

    setNewSkill("");
    setSaved(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) =>
      prev.filter((skill) => skill !== skillToRemove)
    );

    setSaved(false);
  };

  /* =======================================================
     EXPERIENCE
  ======================================================= */

  const openExperienceModal = (experience = null) => {
    if (experience) {
      setEditingExperience(experience.id);

      setExperienceForm({
        company: experience.company,
        position: experience.position,
        location: experience.location,
        startDate: experience.startDate,
        endDate: experience.endDate,
        current: experience.current,
        description: experience.description,
      });
    } else {
      setEditingExperience(null);

      setExperienceForm({
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    }

    setExperienceModal(true);
  };

  const closeExperienceModal = () => {
    setExperienceModal(false);
    setEditingExperience(null);
  };

  const handleExperienceSubmit = (event) => {
    event.preventDefault();

    if (
      !experienceForm.company.trim() ||
      !experienceForm.position.trim()
    ) {
      return;
    }

    if (editingExperience) {
      setExperiences((prev) =>
        prev.map((experience) =>
          experience.id === editingExperience
            ? {
                ...experience,
                ...experienceForm,
              }
            : experience
        )
      );
    } else {
      setExperiences((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...experienceForm,
        },
      ]);
    }

    setSaved(false);
    closeExperienceModal();
  };

  const handleDeleteExperience = (id) => {
    setExperiences((prev) =>
      prev.filter((experience) => experience.id !== id)
    );

    setSaved(false);
  };

  /* =======================================================
     EDUCATION
  ======================================================= */

  const openEducationModal = (educationItem = null) => {
    if (educationItem) {
      setEditingEducation(educationItem.id);

      setEducationForm({
        school: educationItem.school,
        degree: educationItem.degree,
        location: educationItem.location,
        startDate: educationItem.startDate,
        endDate: educationItem.endDate,
      });
    } else {
      setEditingEducation(null);

      setEducationForm({
        school: "",
        degree: "",
        location: "",
        startDate: "",
        endDate: "",
      });
    }

    setEducationModal(true);
  };

  const closeEducationModal = () => {
    setEducationModal(false);
    setEditingEducation(null);
  };

  const handleEducationSubmit = (event) => {
    event.preventDefault();

    if (
      !educationForm.school.trim() ||
      !educationForm.degree.trim()
    ) {
      return;
    }

    if (editingEducation) {
      setEducation((prev) =>
        prev.map((item) =>
          item.id === editingEducation
            ? {
                ...item,
                ...educationForm,
              }
            : item
        )
      );
    } else {
      setEducation((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...educationForm,
        },
      ]);
    }

    setSaved(false);
    closeEducationModal();
  };

  const handleDeleteEducation = (id) => {
    setEducation((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setSaved(false);
  };

  /* =======================================================
     PREFERENCES
  ======================================================= */

  const toggleContract = (contract) => {
    setPreferences((prev) => ({
      ...prev,
      contracts: prev.contracts.includes(contract)
        ? prev.contracts.filter(
            (item) => item !== contract
          )
        : [...prev.contracts, contract],
    }));

    setSaved(false);
  };

  const handleAddDomain = () => {
    const value = newDomain.trim();

    if (!value) return;

    if (
      !preferences.domains.some(
        (domain) =>
          domain.toLowerCase() === value.toLowerCase()
      )
    ) {
      setPreferences((prev) => ({
        ...prev,
        domains: [...prev.domains, value],
      }));
    }

    setNewDomain("");
    setSaved(false);
  };

  const handleRemoveDomain = (domainToRemove) => {
    setPreferences((prev) => ({
      ...prev,
      domains: prev.domains.filter(
        (domain) => domain !== domainToRemove
      ),
    }));

    setSaved(false);
  };

  const handleAddLocation = () => {
    const value = newLocation.trim();

    if (!value) return;

    if (
      !preferences.locations.some(
        (location) =>
          location.toLowerCase() === value.toLowerCase()
      )
    ) {
      setPreferences((prev) => ({
        ...prev,
        locations: [...prev.locations, value],
      }));
    }

    setNewLocation("");
    setSaved(false);
  };

  const handleRemoveLocation = (locationToRemove) => {
    setPreferences((prev) => ({
      ...prev,
      locations: prev.locations.filter(
        (location) => location !== locationToRemove
      ),
    }));

    setSaved(false);
  };

  /* =======================================================
     PHOTO
  ======================================================= */

  const handlePhotoSelected = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    event.target.value = "";
    return perform(async () => {
      const form = new FormData();
      form.append("avatar", file);
      const updatedUser = await api("/users/me/", { method: "PATCH", body: form });
      setProfilePhoto(updatedUser.avatar);
      onUserUpdated?.(updatedUser);
      setPhotoModal(false);
      success("Photo sauvegardée.");
    });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCamera = () => {
    /*
     * Sur navigateur desktop/mobile, capture="user" permet
     * au système de proposer la caméra lorsque disponible.
     */
    openFilePicker();
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = () => perform(async () => {await patch("/users/me/",{first_name:personal.firstName,last_name:personal.lastName,email:personal.email,telephone:personal.phone});await patch("/users/candidate/profile/",{localisation:personal.location,portfolio_url:personal.website,bio:personal.bio,titre_professionnel:personal.title,disponibilite:personal.availability,annees_experience:Number(personal.yearsExperience)||0,langues:personal.languages.split(",").map(l=>l.trim()).filter(Boolean),competences:skills,experiences,formations:education,is_profile_public:profileVisible});await patch("/preferences/",{candidate:preferences});setSaved(true);success("Profil sauvegardé.");});

  /* =======================================================
     SECTIONS
  ======================================================= */

  const profileSections = [
    {
      id: "personal",
      label: "Informations personnelles",
      description: "Vos coordonnées et présentation",
      icon: <UserRound size={17} />,
    },
    {
      id: "skills",
      label: "Compétences",
      description: "Vos compétences professionnelles",
      icon: <Sparkles size={17} />,
    },
    {
      id: "experience",
      label: "Expériences",
      description: "Votre parcours professionnel",
      icon: <BriefcaseBusiness size={17} />,
    },
    {
      id: "education",
      label: "Formation",
      description: "Votre parcours académique",
      icon: <GraduationCap size={17} />,
    },
    {
      id: "preferences",
      label: "Préférences",
      description: "Les opportunités recherchées",
      icon: <Settings2 size={17} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="">

        <main className="min-h-screen">

          {/* TOPBAR */}

          


          {/* CONTENT */}

          <div className="mx-auto max-w-[1500px] px-5 py-7 pb-28 sm:px-8 sm:py-9 lg:px-10">

            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a41] via-[#0b2d68] to-blue-600 p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

                <div className="flex items-center gap-5">

                  {/* PHOTO */}

                  <div className="relative">

                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Photo de profil"
                        className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/20 sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white ring-1 ring-white/20 sm:h-24 sm:w-24">
                        {firstName.charAt(0).toUpperCase()}
                        {lastName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={() => setPhotoModal(true)}
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#0b2d68] bg-white text-blue-600 shadow-lg transition hover:bg-blue-50"
                    >
                      <Camera size={15} />
                    </Button>

                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
                      Profil candidat
                    </p>

                    <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                      {personal.firstName} {personal.lastName}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-blue-100/75">

                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {personal.location}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Mail size={13} />
                        {personal.email}
                      </span>

                    </div>

                  </div>

                </div>


                {/* COMPLETION */}

                <div className="min-w-[240px]">

                  <div className="flex items-center justify-between">

                    <span className="text-xs font-bold text-blue-100">
                      Profil complété
                    </span>

                    <span className="text-lg font-black">
                      {completion}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">

                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{
                        width: `${completion}%`,
                      }}
                    />

                  </div>

                  <p className="mt-2 text-xs text-blue-100/60">
                    Complétez votre profil pour améliorer la
                    pertinence des offres recommandées.
                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                VISIBILITY
            ================================================= */}

            <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {profileVisible ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </div>

                <div>

                  <p className="text-sm font-black text-slate-900">
                    Profil visible par les recruteurs
                  </p>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                    Les recruteurs pourront découvrir votre profil
                    lorsqu'ils recherchent des candidats correspondant
                    à leurs offres.
                  </p>

                </div>

              </div>

              <Button
                type="button"
                onClick={() => {
                  setProfileVisible((prev) => !prev);
                  setSaved(false);
                }}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  profileVisible
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                    profileVisible
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </Button>

            </section>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="mt-7 grid gap-7 xl:grid-cols-[280px_minmax(0,1fr)]">

              {/* PROFILE MENU */}

              <aside>

                <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-3">

                  <p className="px-3 pb-3 pt-2 text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                    Mon profil
                  </p>

                  <div className="space-y-1">

                    {profileSections.map((section) => (

                      <Button
                        key={section.id}
                        type="button"
                        onClick={() =>
                          setActiveSection(section.id)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >

                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            activeSection === section.id
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {section.icon}
                        </span>

                        <span className="min-w-0 flex-1">

                          <span className="block text-xs font-black">
                            {section.label}
                          </span>

                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {section.description}
                          </span>

                        </span>

                      </Button>

                    ))}

                  </div>

                </div>

              </aside>


              {/* CONTENT */}

              <div className="min-w-0">

                {/* =================================================
                    PERSONAL
                ================================================= */}

                {activeSection === "personal" && (

                  <ProfileSection
                    eyebrow="Informations personnelles"
                    title="Parlez-nous de vous"
                    description="Ces informations permettent aux recruteurs et à JobConnect de mieux comprendre votre profil."
                  >

                    <div className="grid gap-5 sm:grid-cols-2">
                      {[["title","Titre professionnel"],["availability","Disponibilité"],["yearsExperience","Années d’expérience"],["languages","Langues (séparées par une virgule)"]].map(([key,label])=><FormField key={key} label={label} type={key==="yearsExperience"?"number":"text"} value={personal[key]} onChange={value=>handlePersonalChange(key,value)} />)}

                      <FormField
                        label="Prénom"
                        value={personal.firstName}
                        onChange={(value) =>
                          handlePersonalChange(
                            "firstName",
                            value
                          )
                        }
                        placeholder="Votre prénom"
                      />

                      <FormField
                        label="Nom"
                        value={personal.lastName}
                        onChange={(value) =>
                          handlePersonalChange(
                            "lastName",
                            value
                          )
                        }
                        placeholder="Votre nom"
                      />

                      <FormField
                        label="Adresse email"
                        type="email"
                        value={personal.email}
                        onChange={(value) =>
                          handlePersonalChange(
                            "email",
                            value
                          )
                        }
                        placeholder="vous@example.com"
                        icon={<Mail size={15} />}
                      />

                      <FormField
                        label="Téléphone"
                        value={personal.phone}
                        onChange={(value) =>
                          handlePersonalChange(
                            "phone",
                            value
                          )
                        }
                        placeholder="+237 ..."
                        icon={<Phone size={15} />}
                      />

                      <FormField
                        label="Localisation"
                        value={personal.location}
                        onChange={(value) =>
                          handlePersonalChange(
                            "location",
                            value
                          )
                        }
                        placeholder="Ville, pays"
                        icon={<MapPin size={15} />}
                      />

                      <FormField
                        label="Site web / LinkedIn"
                        value={personal.website}
                        onChange={(value) =>
                          handlePersonalChange(
                            "website",
                            value
                          )
                        }
                        placeholder="https://..."
                        icon={<Globe2 size={15} />}
                      />

                    </div>

                    <div className="mt-5">

                      <label className="mb-2 block text-xs font-black text-slate-700">
                        Présentation professionnelle
                      </label>

                      <Textarea
                        value={personal.bio}
                        onChange={(event) =>
                          handlePersonalChange(
                            "bio",
                            event.target.value
                          )
                        }
                        rows={6}
                        placeholder="Présentez votre parcours..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />

                    </div>

                  </ProfileSection>

                )}


                {/* =================================================
                    SKILLS
                ================================================= */}

                {activeSection === "skills" && (

                  <ProfileSection
                    eyebrow="Compétences"
                    title="Vos compétences"
                    description="Ajoutez les compétences techniques et professionnelles que vous maîtrisez."
                  >

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">

                      <div className="flex flex-col gap-3 sm:flex-row">

                        <div className="relative flex-1">

                          <Sparkles
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                          />

                          <Input
                            value={newSkill}
                            onChange={(event) =>
                              setNewSkill(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="Ex : Git, Figma, SQL..."
                            className="w-full rounded-xl border border-blue-100 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                          />

                        </div>

                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          <Plus size={15} />
                          Ajouter
                        </Button>

                      </div>

                    </div>


                    <div className="mt-6">

                      <div className="flex items-center justify-between">

                        <h3 className="text-sm font-black text-slate-900">
                          Compétences ajoutées
                        </h3>

                        <span className="text-xs font-bold text-slate-400">
                          {skills.length} compétences
                        </span>

                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">

                        {skills.map((skill) => (

                          <div
                            key={skill}
                            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                          >

                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                            {skill}

                            <Button aria-label="Fermer"
                              type="button"
                              onClick={() =>
                                handleRemoveSkill(skill)
                              }
                              className="ml-1 text-slate-300 transition hover:text-red-500"
                            >
                              <X size={13} />
                            </Button>

                          </div>

                        ))}

                      </div>

                    </div>

                  </ProfileSection>

                )}


                {/* =================================================
                    EXPERIENCE
                ================================================= */}

                {activeSection === "experience" && (

                  <ProfileSection
                    eyebrow="Expériences professionnelles"
                    title="Votre parcours professionnel"
                    description="Présentez vos expériences afin de permettre aux recruteurs de mieux évaluer votre parcours."
                    action={
                      <Button
                        type="button"
                        onClick={() => openExperienceModal()}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
                      >
                        <Plus size={15} />
                        Ajouter
                      </Button>
                    }
                  >

                    {experiences.length === 0 ? (

                      <EmptyState
                        icon={<BriefcaseBusiness size={22} />}
                        title="Aucune expérience ajoutée"
                        description="Ajoutez votre première expérience professionnelle."
                        action="Ajouter une expérience"
                        onClick={() => openExperienceModal()}
                      />

                    ) : (

                      <div className="space-y-4">

                        {experiences.map((experience) => (

                          <article
                            key={experience.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-100 hover:shadow-lg hover:shadow-slate-200/40"
                          >

                            <div className="flex flex-col gap-5 sm:flex-row">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Building2 size={20} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-col justify-between gap-3 sm:flex-row">

                                  <div>

                                    <h3 className="text-sm font-black text-slate-900">
                                      {experience.position}
                                    </h3>

                                    <p className="mt-1 text-xs font-bold text-blue-600">
                                      {experience.company}
                                    </p>

                                  </div>

                                  <div className="flex items-center gap-2">

                                    <Button aria-label="Modifier"
                                      type="button"
                                      onClick={() =>
                                        openExperienceModal(
                                          experience
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Pencil size={14} />
                                    </Button>

                                    <Button aria-label="Supprimer"
                                      type="button"
                                      onClick={() =>
                                        handleDeleteExperience(
                                          experience.id
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </Button>

                                  </div>

                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">

                                  <span className="flex items-center gap-1.5">
                                    <CalendarDays size={12} />
                                    {experience.startDate} —{" "}
                                    {experience.current
                                      ? "Aujourd'hui"
                                      : experience.endDate}
                                  </span>

                                  {experience.location && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin size={12} />
                                      {experience.location}
                                    </span>
                                  )}

                                </div>

                                {experience.description && (
                                  <p className="mt-4 text-xs leading-6 text-slate-500">
                                    {experience.description}
                                  </p>
                                )}

                              </div>

                            </div>

                          </article>

                        ))}

                      </div>

                    )}

                  </ProfileSection>

                )}


                {/* =================================================
                    EDUCATION
                ================================================= */}

                {activeSection === "education" && (

                  <ProfileSection
                    eyebrow="Formation"
                    title="Votre parcours académique"
                    description="Ajoutez vos diplômes, formations et établissements."
                    action={
                      <Button
                        type="button"
                        onClick={() => openEducationModal()}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-blue-700"
                      >
                        <Plus size={15} />
                        Ajouter
                      </Button>
                    }
                  >

                    {education.length === 0 ? (

                      <EmptyState
                        icon={<GraduationCap size={22} />}
                        title="Aucune formation"
                        description="Ajoutez votre première formation académique."
                        action="Ajouter une formation"
                        onClick={() => openEducationModal()}
                      />

                    ) : (

                      <div className="space-y-4">

                        {education.map((item) => (

                          <article
                            key={item.id}
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-100 hover:shadow-lg hover:shadow-slate-200/40"
                          >

                            <div className="flex gap-4">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <GraduationCap size={21} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-col justify-between gap-3 sm:flex-row">

                                  <div>

                                    <h3 className="text-sm font-black text-slate-900">
                                      {item.degree}
                                    </h3>

                                    <p className="mt-1 text-xs font-bold text-blue-600">
                                      {item.school}
                                    </p>

                                  </div>

                                  <div className="flex items-center gap-2">

                                    <Button aria-label="Modifier"
                                      type="button"
                                      onClick={() =>
                                        openEducationModal(item)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Pencil size={14} />
                                    </Button>

                                    <Button aria-label="Supprimer"
                                      type="button"
                                      onClick={() =>
                                        handleDeleteEducation(
                                          item.id
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                      <Trash2 size={14} />
                                    </Button>

                                  </div>

                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">

                                  <span className="flex items-center gap-1.5">
                                    <CalendarDays size={12} />
                                    {item.startDate} — {item.endDate}
                                  </span>

                                  {item.location && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin size={12} />
                                      {item.location}
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>

                          </article>

                        ))}

                      </div>

                    )}

                  </ProfileSection>

                )}


                {/* =================================================
                    PREFERENCES
                ================================================= */}

                {activeSection === "preferences" && (

                  <ProfileSection
                    eyebrow="Préférences professionnelles"
                    title="Quel type d'opportunité recherchez-vous ?"
                    description="Ces préférences permettent de personnaliser les offres qui vous sont proposées."
                  >

                    {/* CONTRACTS */}

                    <PreferenceGroup
                      title="Types de contrat"
                      description="Sélectionnez les types de contrats qui vous intéressent."
                    >

                      <div className="flex flex-wrap gap-2">

                        {[
                          "CDI",
                          "CDD",
                          "Stage",
                          "Alternance",
                          "Freelance",
                        ].map((contract) => (

                          <PreferenceButton
                            key={contract}
                            active={preferences.contracts.includes(
                              contract
                            )}
                            onClick={() =>
                              toggleContract(contract)
                            }
                          >
                            {contract}
                          </PreferenceButton>

                        ))}

                      </div>

                    </PreferenceGroup>


                    {/* DOMAINES LIBRES */}

                    <PreferenceGroup
                      title="Domaines recherchés"
                      description="Saisissez librement les domaines, métiers ou secteurs dans lesquels vous souhaitez évoluer."
                    >

                      <div className="flex flex-col gap-3 sm:flex-row">

                        <div className="relative flex-1">

                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <Input
                            value={newDomain}
                            onChange={(event) =>
                              setNewDomain(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddDomain();
                              }
                            }}
                            placeholder="Ex : Développement web, Finance, Gestion de projet..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                          />

                        </div>

                        <Button
                          type="button"
                          onClick={handleAddDomain}
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          <Plus size={15} />
                          Ajouter
                        </Button>

                      </div>


                      <div className="mt-4 flex flex-wrap gap-2">

                        {preferences.domains.map((domain) => (

                          <div
                            key={domain}
                            className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                          >

                            {domain}

                            <Button aria-label="Fermer"
                              type="button"
                              onClick={() =>
                                handleRemoveDomain(domain)
                              }
                              className="text-blue-300 transition hover:text-red-500"
                            >
                              <X size={13} />
                            </Button>

                          </div>

                        ))}

                      </div>

                    </PreferenceGroup>


                    {/* LOCALISATION LIBRE */}

                    <PreferenceGroup
                      title="Localisation recherchée"
                      description="Saisissez librement les villes, régions ou pays dans lesquels vous souhaitez travailler."
                    >

                      <div className="flex flex-col gap-3 sm:flex-row">

                        <div className="relative flex-1">

                          <MapPin
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <Input
                            value={newLocation}
                            onChange={(event) =>
                              setNewLocation(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                handleAddLocation();
                              }
                            }}
                            placeholder="Ex : Yaoundé, Douala, Bafoussam, Cameroun..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                          />

                        </div>

                        <Button
                          type="button"
                          onClick={handleAddLocation}
                          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          <Plus size={15} />
                          Ajouter
                        </Button>

                      </div>


                      <div className="mt-4 flex flex-wrap gap-2">

                        {preferences.locations.map((location) => (

                          <div
                            key={location}
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                          >

                            <MapPin size={13} className="text-blue-600" />

                            {location}

                            <Button aria-label="Fermer"
                              type="button"
                              onClick={() =>
                                handleRemoveLocation(location)
                              }
                              className="text-slate-300 transition hover:text-red-500"
                            >
                              <X size={13} />
                            </Button>

                          </div>

                        ))}

                      </div>

                    </PreferenceGroup>


                    {/* TELETRAVAIL */}

                    <PreferenceGroup
                      title="Télétravail"
                      description="Indiquez si vous êtes ouvert aux opportunités à distance."
                    >

                      <Button
                        type="button"
                        onClick={() => {
                          setPreferences((prev) => ({
                            ...prev,
                            remote: !prev.remote,
                          }));

                          setSaved(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                          preferences.remote
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >

                        <div>

                          <p className="text-xs font-black text-slate-800">
                            Opportunités en télétravail
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Afficher également les offres compatibles
                            avec le travail à distance.
                          </p>

                        </div>

                        <div
                          className={`relative h-7 w-12 rounded-full transition ${
                            preferences.remote
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        >

                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                              preferences.remote
                                ? "left-6"
                                : "left-1"
                            }`}
                          />

                        </div>

                      </Button>

                    </PreferenceGroup>

                  </ProfileSection>

                )}


                {/* SAVE */}

                <div className="sticky bottom-4 z-20 mt-6">

                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:flex-row sm:items-center">

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          saved
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {saved ? (
                          <Check size={17} />
                        ) : (
                          <Save size={17} />
                        )}
                      </div>

                      <div>

                        <p className="text-xs font-black text-slate-800">
                          {saved
                            ? "Modifications enregistrées"
                            : "Profil non enregistré"}
                        </p>

                        <p className="text-xs text-slate-400">
                          Pensez à enregistrer vos modifications.
                        </p>

                      </div>

                    </div>

                    <Button
                      type="button"
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      <Save size={15} />
                      Enregistrer les modifications
                    </Button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      


      {/* =====================================================
          PHOTO MODAL
      ===================================================== */}

      {photoModal && (

        <ModalOverlay onClose={() => setPhotoModal(false)}>

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Photo de profil
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  Modifier votre photo
                </h2>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={() => setPhotoModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={17} />
              </Button>

            </div>

            <div className="p-6">

              <div className="flex justify-center">

                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Prévisualisation"
                    className="h-28 w-28 rounded-3xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-blue-50 text-3xl font-black text-blue-600">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </div>
                )}

              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <Button
                  type="button"
                  onClick={handleCamera}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-blue-200 hover:bg-blue-50"
                >

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Camera size={19} />
                  </span>

                  <span>

                    <span className="block text-xs font-black text-slate-800">
                      Prendre une photo
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      Utiliser la caméra
                    </span>

                  </span>

                </Button>


                <Button
                  type="button"
                  onClick={openFilePicker}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center transition hover:border-blue-200 hover:bg-blue-50"
                >

                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <FileText size={19} />
                  </span>

                  <span>

                    <span className="block text-xs font-black text-slate-800">
                      Importer une photo
                    </span>

                    <span className="mt-1 block text-xs text-slate-400">
                      Depuis votre appareil
                    </span>

                  </span>

                </Button>

              </div>

              {profilePhoto && (

                <Button
                  type="button"
                  onClick={() => perform(async () => {
                    const updatedUser = await patch("/users/me/", { avatar: null });
                    setProfilePhoto(null);
                    onUserUpdated?.(updatedUser);
                    setPhotoModal(false);
                    success("Photo supprimée.");
                  })}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={14} />
                  Supprimer la photo
                </Button>

              )}

            </div>

          </div>

        </ModalOverlay>

      )}


      {/* =====================================================
          HIDDEN PHOTO INPUT
      ===================================================== */}

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handlePhotoSelected}
        className="hidden"
      />


      {/* =====================================================
          EDUCATION MODAL
      ===================================================== */}

      {educationModal && (

        <ModalOverlay onClose={closeEducationModal}>

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-xl">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Parcours académique
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  {editingEducation
                    ? "Modifier la formation"
                    : "Ajouter une formation"}
                </h2>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={closeEducationModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={17} />
              </Button>

            </div>


            <Form
              onSubmit={handleEducationSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="Établissement"
                  value={educationForm.school}
                  onChange={(value) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      school: value,
                    }))
                  }
                  placeholder="Ex : IAI Cameroun"
                />

                <FormField
                  label="Diplôme / Formation"
                  value={educationForm.degree}
                  onChange={(value) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      degree: value,
                    }))
                  }
                  placeholder="Ex : Licence en Informatique"
                />

                <FormField
                  label="Localisation"
                  value={educationForm.location}
                  onChange={(value) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                  placeholder="Ex : Yaoundé, Cameroun"
                  icon={<MapPin size={15} />}
                />

                <FormField
                  label="Année de début"
                  value={educationForm.startDate}
                  onChange={(value) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      startDate: value,
                    }))
                  }
                  placeholder="Ex : 2024"
                />

                <FormField
                  label="Année de fin"
                  value={educationForm.endDate}
                  onChange={(value) =>
                    setEducationForm((prev) => ({
                      ...prev,
                      endDate: value,
                    }))
                  }
                  placeholder="Ex : 2027 ou En cours"
                />

              </div>


              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  onClick={closeEducationModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </Button>

                <Button aria-label="Confirmer"
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                >
                  <Check size={15} />
                  {editingEducation
                    ? "Enregistrer"
                    : "Ajouter la formation"}
                </Button>

              </div>

            </Form>

          </div>

        </ModalOverlay>

      )}


      {/* =====================================================
          EXPERIENCE MODAL
      ===================================================== */}

      {experienceModal && (

        <ModalOverlay onClose={closeExperienceModal}>

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-xl">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Expérience professionnelle
                </p>

                <h2 className="mt-1 text-lg font-black text-slate-900">
                  {editingExperience
                    ? "Modifier l'expérience"
                    : "Ajouter une expérience"}
                </h2>

              </div>

              <Button aria-label="Fermer"
                type="button"
                onClick={closeExperienceModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <X size={17} />
              </Button>

            </div>


            <Form
              onSubmit={handleExperienceSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <FormField
                  label="Entreprise"
                  value={experienceForm.company}
                  onChange={(value) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      company: value,
                    }))
                  }
                  placeholder="Nom de l'entreprise"
                />

                <FormField
                  label="Poste occupé"
                  value={experienceForm.position}
                  onChange={(value) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      position: value,
                    }))
                  }
                  placeholder="Ex : Développeur web"
                />

                <FormField
                  label="Localisation"
                  value={experienceForm.location}
                  onChange={(value) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                  placeholder="Yaoundé, Cameroun"
                  icon={<MapPin size={15} />}
                />

                <FormField
                  label="Date de début"
                  value={experienceForm.startDate}
                  onChange={(value) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      startDate: value,
                    }))
                  }
                  placeholder="Ex : Janvier 2025"
                />

                <FormField
                  label="Date de fin"
                  value={experienceForm.endDate}
                  disabled={experienceForm.current}
                  onChange={(value) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      endDate: value,
                    }))
                  }
                  placeholder="Ex : Juin 2025"
                />

              </div>


              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <Input
                  type="checkbox"
                  checked={experienceForm.current}
                  onChange={(event) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      current: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-blue-600"
                />

                <span>

                  <span className="block text-xs font-black text-slate-800">
                    Je travaille actuellement dans cette entreprise
                  </span>

                  <span className="mt-1 block text-xs text-slate-400">
                    La date de fin sera automatiquement remplacée
                    par « Aujourd'hui ».
                  </span>

                </span>

              </label>


              <div>

                <label className="mb-2 block text-xs font-black text-slate-700">
                  Description
                </label>

                <Textarea
                  value={experienceForm.description}
                  onChange={(event) =>
                    setExperienceForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Décrivez vos principales missions..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

              </div>


              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <Button
                  type="button"
                  onClick={closeExperienceModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </Button>

                <Button aria-label="Confirmer"
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-700"
                >
                  <Check size={15} />
                  {editingExperience
                    ? "Enregistrer"
                    : "Ajouter l'expérience"}
                </Button>

              </div>

            </Form>

          </div>

        </ModalOverlay>

      )}

    </div>
  );
}


/* =========================================================
   PROFILE SECTION
========================================================= */

function ProfileSection({
  eyebrow,
  title,
  description,
  action,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

        <div>

          <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h2>

          {description && (
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}

        </div>

        {action}

      </div>

      <div className="mt-7">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   FORM FIELD
========================================================= */




/* =========================================================
   PREFERENCE GROUP
========================================================= */

function PreferenceGroup({
  title,
  description,
  children,
}) {
  return (
    <div className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">

      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>

      <div className="mt-4">
        {children}
      </div>

    </div>
  );
}


/* =========================================================
   PREFERENCE BUTTON
========================================================= */

function PreferenceButton({
  active,
  onClick,
  children,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600"
      }`}
    >

      {active && <Check size={13} />}

      {children}

    </Button>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
  action,
  onClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-black text-slate-800">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

      {action && (

        <Button aria-label="Ajouter"
          type="button"
          onClick={onClick}
          className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white transition hover:bg-blue-700"
        >
          <Plus size={14} />
          {action}
        </Button>

      )}

    </div>
  );
}


/* =========================================================
   MODAL OVERLAY
========================================================= */

function ModalOverlay({
  children,
  onClose,
}) {
  return (
    <ModalFrame onClose={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {children}

    </ModalFrame>
  );
}


/* =========================================================
   MOBILE NAV
========================================================= */




export default CandidateProfilePage;