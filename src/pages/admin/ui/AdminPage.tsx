import { Card, Chip } from '@heroui/react';
import { AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type {
  AnalyticsOverview,
  ClinicProfile,
  FaqItem,
  IntegrationSetting,
  Lead,
  NotificationItem,
  RoleItem,
  Scenario,
  SectionKey,
  SessionUser,
  UserListItem
} from '../../../shared/model/types';
import type { ChatDetail, ChatListItem } from '../../../entities/chat/model/types';
import type { Client } from '../../../entities/client/model/types';
import { NAVIGATION_ITEMS, SECTION_TITLES } from '../../../shared/config/navigation';
import { Sidebar } from '../../../widgets/layout/ui/Sidebar';
import { DashboardPage } from '../../dashboard/ui/DashboardPage';
import { ChatsPage } from '../../chats/ui/ChatsPage';
import { LeadsPage } from '../../leads/ui/LeadsPage';
import { AppointmentsPage } from '../../appointments/ui/AppointmentsPage';
import { ClientsPage } from '../../clients/ui/ClientsPage';
import { KnowledgePage } from '../../knowledge/ui/KnowledgePage';
import { UsersPage } from '../../users/ui/UsersPage';
import { IntegrationsPage } from '../../integrations/ui/IntegrationsPage';
import { ReportsPage } from '../../reports/ui/ReportsPage';
import { SettingsPage } from '../../settings/ui/SettingsPage';

type WorkspaceState = {
  overview: AnalyticsOverview | null;
  chats: ChatListItem[];
  chatDetail: ChatDetail | null;
  leads: Lead[];
  appointments: import('../../../entities/appointment/model/types').Appointment[];
  appointmentSlots: import('../../../entities/appointment/model/types').AppointmentSlot[];
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

type AdminPageProps = {
  sessionUser: SessionUser;
  currentSection: SectionKey;
  onLogout: () => void;
  workspace: WorkspaceState;
  workspaceLoading: boolean;
  workspaceError: string | null;
  connectedChannels: Array<{ key: string; label: string; isEnabled: boolean }>;
  selectedClientId: string | null;
  chatMessage: string;
  setChatMessage: (value: string) => void;
  internalNote: string;
  setInternalNote: (value: string) => void;
  onSelectChat: (value: string) => void;
  onSendChatMessage: () => Promise<void>;
  onAddInternalNote: () => Promise<void>;
  onUpdateChatStatus: (value: string) => Promise<void>;
  onUpdateChatMode: (value: string) => Promise<void>;
  onAssignChat: (value: string) => Promise<void>;
  onSelectClient: (value: string) => void;
  clinicDraft: ClinicProfile | null;
  setClinicDraft: (value: ClinicProfile | null) => void;
  onSaveClinicProfile: () => Promise<void>;
  faqQuestion: string;
  setFaqQuestion: (value: string) => void;
  faqAnswer: string;
  setFaqAnswer: (value: string) => void;
  scenarioCode: string;
  setScenarioCode: (value: string) => void;
  scenarioTitle: string;
  setScenarioTitle: (value: string) => void;
  scenarioDescription: string;
  setScenarioDescription: (value: string) => void;
  onCreateFaqItem: () => Promise<void>;
  onCreateScenario: () => Promise<void>;
  onSaveClient: (id: string, payload: Partial<import('../../../shared/model/types').Client>) => Promise<void>;
  onSaveRole: (id: string, payload: { name?: string; description?: string | null; permissions?: string[] }) => Promise<void>;
  onSaveIntegration: (key: string, payload: { isEnabled: boolean; payload?: unknown }) => Promise<void>;
  onCreateAppointment: (payload: {
    service: string;
    doctor?: string;
    scheduledAt: string;
    comment?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    source?: string;
    createLead?: boolean;
  }) => Promise<void>;
  onConfirmAppointment: (id: string) => Promise<void>;
  onCancelAppointment: (id: string) => Promise<void>;
  onRescheduleAppointment: (id: string, scheduledAt: string) => Promise<void>;
  onUpdateReportPeriod: (from: string, to: string) => Promise<void>;
  reportFrom: string;
  reportTo: string;
  leadsCsvUrl: string;
};

export function AdminPage({
  sessionUser,
  currentSection,
  onLogout,
  workspace,
  workspaceLoading,
  workspaceError,
  connectedChannels,
  selectedClientId,
  chatMessage,
  setChatMessage,
  internalNote,
  setInternalNote,
  onSelectChat,
  onSendChatMessage,
  onAddInternalNote,
  onUpdateChatStatus,
  onUpdateChatMode,
  onAssignChat,
  onSelectClient,
  clinicDraft,
  setClinicDraft,
  onSaveClinicProfile,
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
  onCreateFaqItem,
  onCreateScenario,
  onSaveClient,
  onSaveRole,
  onSaveIntegration,
  onCreateAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  onUpdateReportPeriod,
  reportFrom,
  reportTo,
  leadsCsvUrl
}: AdminPageProps) {
  const currentChat = workspace.chatDetail;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <Sidebar
          userName={sessionUser.name}
          userRole={sessionUser.role}
          permissions={sessionUser.permissions}
          onLogout={onLogout}
        />

        <main className="flex-1 pb-6">
          <Card>
            <Card.Content>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase">Управление обращениями</p>
                  <h1 className="text-2xl font-semibold">{SECTION_TITLES[currentSection]}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {connectedChannels.map((channel) => (
                    <Chip key={channel.key} variant="soft" color={channel.isEnabled ? 'success' : 'default'}>
                      {channel.label}: {channel.isEnabled ? 'активен' : 'неактивен'}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:hidden">
                {NAVIGATION_ITEMS.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        'rounded-full px-4 py-2 text-sm font-medium transition',
                        isActive ? 'ring-1' : ''
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </Card.Content>
          </Card>

          {workspaceError ? (
            <Card>
              <Card.Content>
                <AlertCircle className="h-5 w-5" />
                <span>{workspaceError}</span>
              </Card.Content>
            </Card>
          ) : null}

          {workspaceLoading ? (
            <Card>
              <Card.Content>Загружаю данные панели...</Card.Content>
            </Card>
          ) : null}

          {currentSection === 'dashboard' ? (
            <DashboardPage overview={workspace.overview} chats={workspace.chats} leads={workspace.leads} notifications={workspace.notifications} />
          ) : null}

          {currentSection === 'chats' ? (
            <ChatsPage
              chats={workspace.chats}
              chat={currentChat}
              users={workspace.users}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              internalNote={internalNote}
              setInternalNote={setInternalNote}
              onSelectChat={onSelectChat}
              onSendMessage={onSendChatMessage}
              onAddNote={onAddInternalNote}
              onStatusChange={onUpdateChatStatus}
              onModeChange={onUpdateChatMode}
              onAssignChat={onAssignChat}
            />
          ) : null}

          {currentSection === 'leads' ? <LeadsPage leads={workspace.leads} /> : null}
          {currentSection === 'appointments' ? (
            <AppointmentsPage
              appointments={workspace.appointments}
              appointmentSlots={workspace.appointmentSlots}
              overview={workspace.overview}
              onCreateAppointment={onCreateAppointment}
              onConfirmAppointment={onConfirmAppointment}
              onCancelAppointment={onCancelAppointment}
              onRescheduleAppointment={onRescheduleAppointment}
            />
          ) : null}
          {currentSection === 'clients' ? <ClientsPage clients={workspace.clients} onSaveClient={onSaveClient} selectedClientId={selectedClientId} onSelectClient={onSelectClient} /> : null}

          {currentSection === 'knowledge' ? (
            <KnowledgePage
              faqItems={workspace.faqItems}
              scenarios={workspace.scenarios}
              faqQuestion={faqQuestion}
              setFaqQuestion={setFaqQuestion}
              faqAnswer={faqAnswer}
              setFaqAnswer={setFaqAnswer}
              scenarioCode={scenarioCode}
              setScenarioCode={setScenarioCode}
              scenarioTitle={scenarioTitle}
              setScenarioTitle={setScenarioTitle}
              scenarioDescription={scenarioDescription}
              setScenarioDescription={setScenarioDescription}
              onCreateFaqItem={onCreateFaqItem}
              onCreateScenario={onCreateScenario}
            />
          ) : null}

          {currentSection === 'users' ? (
            <UsersPage users={workspace.users} roles={workspace.roles} rolePermissions={workspace.rolePermissions} onSaveRole={onSaveRole} />
          ) : null}

          {currentSection === 'integrations' ? (
            <IntegrationsPage integrations={workspace.integrations} onSaveIntegration={onSaveIntegration} />
          ) : null}

          {currentSection === 'reports' ? (
            <ReportsPage
              overview={workspace.overview}
              chats={workspace.chats}
              leads={workspace.leads}
              users={workspace.users}
              from={reportFrom}
              to={reportTo}
              onPeriodChange={onUpdateReportPeriod}
              leadsCsvUrl={leadsCsvUrl}
            />
          ) : null}

          {currentSection === 'settings' ? (
            <SettingsPage
              profile={clinicDraft}
              setProfile={setClinicDraft}
              onSaveProfile={onSaveClinicProfile}
              notifications={workspace.notifications}
              integrations={workspace.integrations}
              roles={workspace.roles}
              users={workspace.users}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
