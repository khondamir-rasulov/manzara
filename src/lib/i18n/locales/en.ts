export type Translations = {
  nav: { dashboard: string; projects: string; board: string; gantt: string; workspace: string; settings: string; signOut: string };
  login: { tagline: string; welcome: string; subtitle: string; email: string; password: string; signIn: string; signingIn: string; error: string; demo: string };
  dashboard: { title: string; subtitle: string; totalProjects: string; active: string; completed: string; onHold: string; cancelled: string; pipelineFunnel: string; projectsInStage: string; bottleneckHeatmap: string; avgDaysInStage: string; deadlineRisk: string; due30: string; due60: string; overdue: string; projects: string; executorBreakdown: string; sectorDistribution: string; stageClock: string; daysInStage: string; sla: string; noData: string; clickToFilter: string; projectList: string; clearFilter: string; name: string; stage: string; status: string; executor: string; sector: string; deadline: string; days: string; urgentCount: string; slaRate: string; slaCompliance: string; slaCompliant: string; slaLate: string; slaNoData: string; priorityBreakdown: string; executorPerformance: string; execActive: string; execCompleted: string; execSlaRate: string; execNoData: string };
  projects: { title: string; subtitle: string; newProject: string; name: string; stage: string; status: string; executor: string; sector: string; deadline: string; noProjects: string; active: string; completed: string; onHold: string; cancelled: string; searchPlaceholder: string; allStatus: string; allSectors: string; daysVsNorm: string; priority: string; allPriorities: string };
  board: { title: string; noProjects: string; noPrograms: string; slaLegend: { green: string; yellow: string; red: string }; allPriorities: string; allSectors: string; allOrgs: string; overdueProjects: string; noOverdue: string; overdueBadge: string };
  project: { backToProjects: string; legalBasis: string; currentStage: string; daysInStage: string; slaTarget: string; days: string; stageTimeline: string; stageHistory: string; fieldsCompleted: string; enteredOn: string; notStarted: string; completed: string; noFields: string; deadline: string; daysElapsed: string; slaProgress: string; slaOf: string; overdueSuffix: string; stageFields: string; fieldsNotFilled: string; notFilled: string; yes: string; no: string; fields: string; editProject: string; advanceStage: string; advanceConfirmTitle: string; advanceConfirmBody: string; cancel: string; save: string; saving: string; creating: string; description: string; descriptionPlaceholder: string; priority: string; sectorPlaceholder: string; executorPlaceholder: string; stagesSection: string; stagesHint: string; stageAdd: string; stagePlaceholder: string; stageResetDefault: string; markComplete: string; cancelProject: string; deleteProject: string; deleteConfirmTitle: string; deleteConfirmBody: string; confirmDelete: string; comments: string; commentPlaceholder: string; send: string; noComments: string; notes: string; notesPlaceholder: string; notesSaved: string; tabOverview: string; tabNotes: string; status: { ACTIVE: string; COMPLETED: string; ON_HOLD: string; CANCELLED: string } };
  workspace: { title: string; subtitle: string; newDoc: string; noDocuments: string; backToWorkspace: string; save: string; saving: string; saved: string; deleteDoc: string; confirmDelete: string; cancel: string; untitled: string; docs: string; folders: { templates: string; normatives: string; legal: string; contacts: string } };
  settings: {
    title: string; subtitle: string;
    tabs: { account: string; pipeline: string; about: string };
    profile: { title: string; adminNote: string };
    roles: { ADMIN: string; MANAGER: string; VIEWER: string };
    password: { title: string; current: string; new: string; save: string; saved: string; show: string; hide: string };
    language: { title: string; subtitle: string; en: string; ru: string; uz: string };
    pipeline: { adminNote: string; projects: string; stages: string; fields: string; sla: string };
    about: { productName: string; version: string; tagline: string; description: string; version_label: string; build: string; license: string; environment: string; licenseValue: string; buildValue: string; envValue: string; techStack: string; demoCredentials: string; demoNote: string };
  };
  /** Lookup maps for DB-stored data values — unknown keys fall back to the original string */
  data: {
    stages: Record<string, string>;
    stagesShort: Record<string, string>;
    sectors: Record<string, string>;
    statusLabels: Record<string, string>;
    priorityLabels: Record<string, string>;
    projectNames: Record<string, string>;
  };
};

export const en: Translations = {
  // Nav
  nav: {
    dashboard: "Dashboard",
    projects: "Projects",
    board: "Stage Board",
    gantt: "Gantt Chart",
    workspace: "Workspace",
    settings: "Settings",
    signOut: "Sign out",
  },

  // Login
  login: {
    tagline: "Project Pipeline Tracker",
    welcome: "Welcome back",
    subtitle: "Enter your credentials to continue",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    error: "Invalid email or password",
    demo: "Demo",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    subtitle: "Portfolio overview",
    totalProjects: "Total Projects",
    active: "Active",
    completed: "Completed",
    onHold: "On Hold",
    cancelled: "Cancelled",
    pipelineFunnel: "Projects by Stage",
    projectsInStage: "projects in stage",
    bottleneckHeatmap: "Delayed Projects",
    avgDaysInStage: "avg days in stage",
    deadlineRisk: "Deadline Risk",
    due30: "Due in 30 days",
    due60: "Due in 30–60 days",
    overdue: "Overdue",
    projects: "projects",
    executorBreakdown: "Executor Breakdown",
    sectorDistribution: "Sector Distribution",
    stageClock: "Longest-Running Projects",
    daysInStage: "days in stage",
    sla: "SLA",
    noData: "No data",
    clickToFilter: "Click any metric to filter projects",
    projectList: "Projects",
    clearFilter: "Clear filter",
    name: "Name",
    stage: "Stage",
    status: "Status",
    executor: "Executor",
    sector: "Sector",
    deadline: "Deadline",
    days: "days",
    urgentCount: "Urgent",
    slaRate: "On-Time Completion",
    slaCompliance: "On-Time Completion by Stage",
    slaCompliant: "Compliant",
    slaLate: "Late",
    slaNoData: "No completed stage transitions yet",
    priorityBreakdown: "Priority Breakdown",
    executorPerformance: "Executor Performance",
    execActive: "Active",
    execCompleted: "Completed",
    execSlaRate: "On-Time Rate",
    execNoData: "—",
  },

  // Projects
  projects: {
    title: "Projects",
    subtitle: "All pipeline projects",
    newProject: "New Project",
    name: "Name",
    stage: "Stage",
    status: "Status",
    executor: "Executor",
    sector: "Sector",
    deadline: "Deadline",
    noProjects: "No projects found.",
    active: "Active",
    completed: "Completed",
    onHold: "On Hold",
    cancelled: "Cancelled",
    searchPlaceholder: "Search projects…",
    allStatus: "All",
    allSectors: "All sectors",
    daysVsNorm: "Days / Norm",
    priority: "Priority",
    allPriorities: "All priorities",
  },

  // Board
  board: {
    title: "Stage Board",
    noProjects: "No projects",
    noPrograms: "No programs found.",
    slaLegend: {
      green: "On schedule",
      yellow: "Approaching deadline",
      red: "Overdue",
    },
    allPriorities: "All priorities",
    allSectors: "All sectors",
    allOrgs: "All executors",
    overdueProjects: "Overdue projects",
    noOverdue: "No overdue projects",
    overdueBadge: "Overdue",
  },

  // Project detail
  project: {
    backToProjects: "Back to Projects",
    legalBasis: "Legal basis",
    currentStage: "Current Stage",
    daysInStage: "days in this stage",
    slaTarget: "SLA target",
    days: "days",
    stageTimeline: "Stage Timeline",
    stageHistory: "Stage History",
    fieldsCompleted: "fields completed",
    enteredOn: "Entered",
    notStarted: "Not started",
    completed: "Completed",
    noFields: "No fields for this stage.",
    deadline: "Deadline",
    daysElapsed: "days elapsed",
    slaProgress: "Timeline Progress",
    slaOf: "of",
    overdueSuffix: "overdue",
    stageFields: "Stage Fields",
    fieldsNotFilled: "fields defined — not yet filled",
    notFilled: "Not filled",
    yes: "Yes",
    no: "No",
    fields: "field",
    editProject: "Edit",
    advanceStage: "Advance to Next Stage",
    advanceConfirmTitle: "Advance to next stage?",
    advanceConfirmBody: "The current stage will be marked as completed.",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    creating: "Creating…",
    description: "Description",
    descriptionPlaceholder: "Project description…",
    priority: "Priority",
    sectorPlaceholder: "e.g. Healthcare, Finance, Education…",
    executorPlaceholder: "Organization name…",
    stagesSection: "Stages",
    stagesHint: "Define the stages this project will go through",
    stageAdd: "Add",
    stagePlaceholder: "New stage name…",
    stageResetDefault: "Reset to defaults",
    comments: "Comments",
    commentPlaceholder: "Add a comment…",
    send: "Send",
    markComplete: "Mark as Complete",
    cancelProject: "Cancel Project",
    deleteProject: "Delete Project",
    deleteConfirmTitle: "Delete this project?",
    deleteConfirmBody: "This action cannot be undone.",
    confirmDelete: "Delete",
    noComments: "No comments yet.",
    notes: "Notes",
    notesPlaceholder: "Write notes about this project…",
    notesSaved: "Saved",
    tabOverview: "Overview",
    tabNotes: "Notes",
    status: {
      ACTIVE: "Active",
      COMPLETED: "Completed",
      ON_HOLD: "On Hold",
      CANCELLED: "Cancelled",
    },
  },

  // Workspace
  workspace: {
    title: "Workspace",
    subtitle: "Documents, templates, and resources",
    newDoc: "New Document",
    noDocuments: "No documents yet.",
    backToWorkspace: "Back to Workspace",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    deleteDoc: "Delete Document",
    confirmDelete: "Delete",
    cancel: "Cancel",
    untitled: "Untitled",
    docs: "documents",
    folders: {
      templates: "Templates",
      normatives: "Normatives",
      legal: "Legal Documents",
      contacts: "Contacts",
    },
  },

  // Data lookup maps (DB-stored values)
  data: {
    stages: {
      "TZ Development": "TZ Development",
      "Ministry Approvals": "Ministry of Digital Technologies Approval",
      "ЦКБ Review": "Cybersecurity Center (TsKB) Review",
      "НАПП Review": "Nat. Agency for Prospective Projects (NAPP) Review",
      "Reestr.uz": "Reestr.uz Registration",
      "Procurement": "Procurement",
      "ЦКЭ Review": "Center for Comprehensive Expertise (TsKE) Review",
    },
    stagesShort: {
      "TZ Development": "TZ Dev.",
      "Ministry Approvals": "Ministry",
      "ЦКБ Review": "TsKB Review",
      "НАПП Review": "NAPP Review",
      "Reestr.uz": "Reestr.uz",
      "Procurement": "Procurement",
      "ЦКЭ Review": "TsKE Review",
    },
    sectors: {
      "Aerospace monitoring": "Aerospace monitoring",
      "Healthcare": "Healthcare",
      "Research": "Research",
      "Economy": "Economy",
      "Security": "Security",
      "Environment": "Environment",
      "Education": "Education",
      "Media": "Media",
      "Social": "Social",
      "E-Government": "E-Government",
      "Other": "Other",
    },
    statusLabels: {
      ACTIVE: "Active",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      ON_HOLD: "On Hold",
      NOT_STARTED: "Not started",
      IN_PROGRESS: "In progress",
      RETURNED: "Returned for rework",
      SKIPPED: "Skipped",
    },
    priorityLabels: {
      URGENT: "Urgent",
      HIGH: "High",
      NORMAL: "Normal",
      LOW: "Low",
    },
    projectNames: {},
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Manage your account and application preferences",
    tabs: {
      account: "Account",
      pipeline: "Pipeline",
      about: "About",
    },
    profile: {
      title: "Profile",
      adminNote: "Account settings are managed by your administrator. Contact them to update your profile or permissions.",
    },
    roles: {
      ADMIN: "Administrator",
      MANAGER: "Manager",
      VIEWER: "Viewer",
    },
    password: {
      title: "Change Password",
      current: "Current password",
      new: "New password",
      save: "Save Password",
      saved: "Password saved!",
      show: "Show password",
      hide: "Hide password",
    },
    language: {
      title: "Language",
      subtitle: "Choose the display language for the interface.",
      en: "English",
      ru: "Русский",
      uz: "Oʻzbekcha",
    },
    pipeline: {
      adminNote: "Pipeline configuration is managed by system administrators. Contact your admin to add, reorder, or modify stages and fields.",
      projects: "projects",
      stages: "stages",
      fields: "fields",
      sla: "SLA",
    },
    about: {
      productName: "Manzara",
      version: "v0.1.0 (demo)",
      tagline: "Project Pipeline Management",
      description: "Built for organizations managing approval-heavy project portfolios. Manzara provides a structured pipeline view, SLA tracking, and stage-level document management to keep every project on track through its approval lifecycle.",
      version_label: "Version",
      build: "Build",
      license: "License",
      environment: "Environment",
      licenseValue: "Internal use",
      buildValue: "2025-01",
      envValue: "Production",
      techStack: "Tech Stack",
      demoCredentials: "Demo Credentials",
      demoNote: "These are demo credentials for evaluation purposes only. Do not use in production.",
    },
  },
};
