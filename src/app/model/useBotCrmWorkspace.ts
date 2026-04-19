import { useEffect, useMemo, useState } from 'react';
import { api, clearSession, getStoredSession, login, saveSession, type Session } from '../../shared/api/client';
import type {
  AnalyticsOverview,
  Appointment,
  AppointmentSlot,
  ClinicProfile,
  FaqItem,
  IntegrationSetting,
  NotificationItem,
  Scenario,
} from '../../shared/model/types';
import type { ChatDetail, ChatListItem } from '../../entities/chat/model/types';
import type { Client } from '../../entities/client/model/types';
import type { Lead } from '../../entities/lead/model/types';
import type { RoleItem, SessionUser, UserListItem } from '../../entities/user/model/types';

export type WorkspaceState = {
  overview: AnalyticsOverview | null;
  chats: ChatListItem[];
  chatDetail: ChatDetail | null;
  leads: Lead[];
  appointments: Appointment[];
  appointmentSlots: AppointmentSlot[];
  clients: Client[];
  faqItems: FaqItem[];
  clinicProfile: ClinicProfile | null;
  scenarios: Scenario[];
  notifications: NotificationItem[];
  integrations: IntegrationSetting[];
  users: UserListItem[];
  roles: RoleItem[];
  rolePermissions: Array<{ id: string; code: string; description: string | null }>;
};

const DEFAULT_WORKSPACE: WorkspaceState = {
  overview: null,
  chats: [],
  chatDetail: null,
  leads: [],
  appointments: [],
  appointmentSlots: [],
  clients: [],
  faqItems: [],
  clinicProfile: null,
  scenarios: [],
  notifications: [],
  integrations: [],
  users: [],
  roles: [],
  rolePermissions: []
};

export function useBotCrmWorkspace() {
  const storedSession = useMemo(() => getStoredSession(), []);
  const leadsCsvUrl = api.exportLeadsCsv();
  const [session, setSession] = useState<Session | null>(storedSession);
  const [authLoading, setAuthLoading] = useState(Boolean(storedSession));
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@local.dev');
  const [password, setPassword] = useState('admin12345');
  const [workspace, setWorkspace] = useState<WorkspaceState>(DEFAULT_WORKSPACE);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [clinicDraft, setClinicDraft] = useState<ClinicProfile | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [scenarioCode, setScenarioCode] = useState('');
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  async function loadWorkspace(targetChatId?: string, fromOverride?: string, toOverride?: string) {
    setWorkspaceLoading(true);
    setWorkspaceError(null);

    try {
      const [
        overview,
        chats,
        leads,
        appointments,
        appointmentSlots,
        clients,
        faqItems,
        clinicProfile,
        scenarios,
        notifications,
        integrations,
        users,
        roles,
        permissions
      ] = await Promise.all([
        api.overview((fromOverride ?? reportFrom) || undefined, (toOverride ?? reportTo) || undefined),
        api.chats(),
        api.leads(),
        api.appointments(),
        api.appointmentAvailability({ limit: 10 }).catch(() => [] as AppointmentSlot[]),
        api.clients(),
        api.faqItems(),
        api.clinicProfile(),
        api.scenarios(),
        api.notifications(),
        api.integrations(),
        api.users().catch(() => [] as UserListItem[]),
        api.roles().catch(() => [] as RoleItem[]),
        api.rolePermissions().catch(() => [] as Array<{ id: string; code: string; description: string | null }>)
      ]);

      const chatIdToLoad = targetChatId ?? selectedChatId ?? chats[0]?.id ?? null;
      const chatDetail = chatIdToLoad ? await api.chat(chatIdToLoad).catch(() => null) : null;

      setWorkspace({
        overview,
        chats,
        chatDetail,
        leads,
        appointments,
        clients,
        appointmentSlots,
        faqItems,
        clinicProfile,
        scenarios,
        notifications,
        integrations,
        users,
        roles,
        rolePermissions: permissions
      });

      setSelectedChatId(chatDetail?.id ?? chatIdToLoad);
      setClinicDraft(clinicProfile);
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : 'Не удалось загрузить данные');
    } finally {
      setWorkspaceLoading(false);
    }
  }

  useEffect(() => {
    if (!session) {
      setAuthLoading(false);
      return;
    }

    api
      .me()
      .then((user) => {
        const updatedSession: Session = {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user
        };

        saveSession(updatedSession);
        setSession(updatedSession);
        return loadWorkspace();
      })
      .catch((error) => {
        clearSession();
        setSession(null);
        setAuthError(error instanceof Error ? error.message : 'Сессия устарела');
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (session && !workspace.overview && !workspaceLoading) {
      void loadWorkspace();
    }
  }, [session, workspace.overview, workspaceLoading]);

  useEffect(() => {
    if (!session || !selectedChatId) return;
    void api.chat(selectedChatId).then((detail) => {
      setWorkspace((prev) => ({ ...prev, chatDetail: detail }));
    });
  }, [session, selectedChatId]);

  useEffect(() => {
    if (!session?.accessToken) return undefined;

    const eventSource = new EventSource(`/api/live/stream?token=${encodeURIComponent(session.accessToken)}`);

    const handleUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as { chatId?: string };
        void loadWorkspace(data.chatId ?? selectedChatId ?? undefined);
      } catch {
        void loadWorkspace(selectedChatId ?? undefined);
      }
    };

    eventSource.addEventListener('workspace:update', handleUpdate as EventListener);
    eventSource.onerror = () => {
      eventSource.close();
    };

    const fallbackTimer = window.setInterval(() => {
      void loadWorkspace(selectedChatId ?? undefined);
    }, 60000);

    return () => {
      eventSource.removeEventListener('workspace:update', handleUpdate as EventListener);
      eventSource.close();
      window.clearInterval(fallbackTimer);
    };
  }, [session?.accessToken, selectedChatId, reportFrom, reportTo]);

  async function handleLogin() {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const auth = await login(email, password);
      saveSession(auth);
      setSession(auth);
      await loadWorkspace();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Не удалось войти');
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setWorkspace(DEFAULT_WORKSPACE);
  }

  async function refreshAfterAction(chatId?: string) {
    await loadWorkspace(chatId ?? selectedChatId ?? undefined);
  }

  async function handleSendChatMessage() {
    if (!selectedChatId || !chatMessage.trim()) return;
    await api.sendChatMessage(selectedChatId, chatMessage.trim());
    setChatMessage('');
    await refreshAfterAction(selectedChatId);
  }

  async function handleAddInternalNote() {
    if (!selectedChatId || !internalNote.trim()) return;
    await api.addChatNote(selectedChatId, internalNote.trim());
    setInternalNote('');
    await refreshAfterAction(selectedChatId);
  }

  async function handleUpdateChatStatus(value: string) {
    if (!selectedChatId) return;
    await api.updateChatStatus(selectedChatId, value);
    await refreshAfterAction(selectedChatId);
  }

  async function handleUpdateChatMode(value: string) {
    if (!selectedChatId) return;
    await api.updateChatMode(selectedChatId, value);
    await refreshAfterAction(selectedChatId);
  }

  async function handleAssignChat(value: string) {
    if (!selectedChatId) return;
    await api.assignChat(selectedChatId, value || null);
    await refreshAfterAction(selectedChatId);
  }

  async function handleSaveClinicProfile() {
    if (!clinicDraft) return;
    await api.updateClinicProfile(clinicDraft);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleCreateFaqItem() {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    await api.createFaqItem({
      question: faqQuestion.trim(),
      answer: faqAnswer.trim()
    });
    setFaqQuestion('');
    setFaqAnswer('');
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleCreateScenario() {
    if (!scenarioCode.trim() || !scenarioTitle.trim()) return;
    await api.createScenario({
      code: scenarioCode.trim(),
      title: scenarioTitle.trim(),
      description: scenarioDescription.trim() || undefined
    });
    setScenarioCode('');
    setScenarioTitle('');
    setScenarioDescription('');
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleUpdateReportPeriod(from: string, to: string) {
    setReportFrom(from);
    setReportTo(to);
    await loadWorkspace(selectedChatId ?? undefined, from, to);
  }

  async function handleSaveClient(id: string, payload: Partial<Client>) {
    await api.updateClient(id, payload);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleSaveRole(id: string, payload: { name?: string; description?: string | null; permissions?: string[] }) {
    await api.updateRole(id, payload);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleSaveIntegration(key: string, payload: { isEnabled: boolean; payload?: unknown }) {
    await api.updateIntegration(key, payload);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleCreateAppointment(payload: Parameters<typeof api.createAppointment>[0]) {
    await api.createAppointment(payload);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleConfirmAppointment(id: string) {
    await api.confirmAppointment(id);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleCancelAppointment(id: string) {
    await api.cancelAppointment(id);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  async function handleRescheduleAppointment(id: string, scheduledAt: string) {
    await api.rescheduleAppointment(id, scheduledAt);
    await loadWorkspace(selectedChatId ?? undefined);
  }

  return {
    session,
    authLoading,
    authError,
    email,
    setEmail,
    password,
    setPassword,
    workspace,
    workspaceLoading,
    workspaceError,
    selectedChatId,
    setSelectedChatId,
    chatMessage,
    setChatMessage,
    internalNote,
    setInternalNote,
    clinicDraft,
    setClinicDraft,
    faqQuestion,
    setFaqQuestion,
    faqAnswer,
    setFaqAnswer,
    scenarioCode,
    setScenarioCode,
    scenarioTitle,
    setScenarioTitle,
    scenarioDescription,
    setScenarioDescription,
    reportFrom,
    reportTo,
    setReportFrom,
    setReportTo,
    handleLogin,
    handleLogout,
    handleSendChatMessage,
    handleAddInternalNote,
    handleUpdateChatStatus,
    handleUpdateChatMode,
    handleAssignChat,
    handleSaveClinicProfile,
    handleCreateFaqItem,
    handleCreateScenario,
    handleUpdateReportPeriod,
    handleSaveClient,
    handleSaveRole,
    handleSaveIntegration,
    handleCreateAppointment,
    handleConfirmAppointment,
    handleCancelAppointment,
    handleRescheduleAppointment,
    loadWorkspace,
    refreshAfterAction,
    setWorkspace,
    leadsCsvUrl
  };
}
