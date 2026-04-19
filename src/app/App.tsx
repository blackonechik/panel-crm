import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminPage } from '../pages/admin/ui/AdminPage';
import { LoginPage } from '../pages/login/ui/LoginPage';
import { useBotCrmWorkspace } from './model/useBotCrmWorkspace';
import { NAVIGATION_ITEMS, getSectionPath } from '../shared/config/navigation';

export default function App() {
  const state = useBotCrmWorkspace();
  const navigate = useNavigate();
  const chatRouteMatch = useMatch('/chats/:chatId');
  const clientRouteMatch = useMatch('/clients/:clientId');
  const selectedChatId = state.selectedChatId;
  const setSelectedChatId = state.setSelectedChatId;
  const selectedClientId = clientRouteMatch?.params.clientId ?? null;

  useEffect(() => {
    const chatId = chatRouteMatch?.params.chatId;
    if (chatId && chatId !== selectedChatId) {
      setSelectedChatId(chatId);
    }
  }, [chatRouteMatch?.params.chatId, selectedChatId, setSelectedChatId]);

  const connectedChannels = [
    {
      key: 'telegram',
      label: 'Telegram',
      isEnabled: state.workspace.integrations.find((item) => item.key === 'telegram')?.isEnabled ?? false
    },
    {
      key: 'max',
      label: 'MAX',
      isEnabled: state.workspace.integrations.find((item) => item.key === 'max')?.isEnabled ?? false
    }
  ];

  if (!state.session) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              email={state.email}
              password={state.password}
              loading={state.authLoading}
              error={state.authError}
              onEmailChange={state.setEmail}
              onPasswordChange={state.setPassword}
              onSubmit={state.handleLogin}
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  const renderAdminPage = (currentSection: (typeof NAVIGATION_ITEMS)[number]['key']) => (
    <AdminPage
      sessionUser={state.session!.user}
      currentSection={currentSection}
      onLogout={state.handleLogout}
      workspace={state.workspace}
      workspaceLoading={state.workspaceLoading}
      workspaceError={state.workspaceError}
      connectedChannels={connectedChannels}
      selectedClientId={selectedClientId}
      chatMessage={state.chatMessage}
      setChatMessage={state.setChatMessage}
      internalNote={state.internalNote}
      setInternalNote={state.setInternalNote}
      onSelectChat={(value) => {
        navigate(`/chats/${value}`);
      }}
      onSendChatMessage={state.handleSendChatMessage}
      onAddInternalNote={state.handleAddInternalNote}
      onUpdateChatStatus={state.handleUpdateChatStatus}
      onUpdateChatMode={state.handleUpdateChatMode}
      onAssignChat={state.handleAssignChat}
      onSelectClient={(value) => {
        navigate(`/clients/${value}`);
      }}
      clinicDraft={state.clinicDraft}
      setClinicDraft={state.setClinicDraft}
      onSaveClinicProfile={state.handleSaveClinicProfile}
      faqQuestion={state.faqQuestion}
      setFaqQuestion={state.setFaqQuestion}
      faqAnswer={state.faqAnswer}
      setFaqAnswer={state.setFaqAnswer}
      scenarioCode={state.scenarioCode}
      setScenarioCode={state.setScenarioCode}
      scenarioTitle={state.scenarioTitle}
      setScenarioTitle={state.setScenarioTitle}
      scenarioDescription={state.scenarioDescription}
      setScenarioDescription={state.setScenarioDescription}
      onCreateFaqItem={state.handleCreateFaqItem}
      onCreateScenario={state.handleCreateScenario}
      onSaveClient={state.handleSaveClient}
      onSaveRole={state.handleSaveRole}
      onSaveIntegration={state.handleSaveIntegration}
      onCreateAppointment={state.handleCreateAppointment}
      onConfirmAppointment={state.handleConfirmAppointment}
      onCancelAppointment={state.handleCancelAppointment}
      onRescheduleAppointment={state.handleRescheduleAppointment}
      onUpdateReportPeriod={state.handleUpdateReportPeriod}
      reportFrom={state.reportFrom}
      reportTo={state.reportTo}
      leadsCsvUrl={state.leadsCsvUrl}
    />
  );

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={getSectionPath('dashboard')} replace />} />
      <Route path="/" element={<Navigate to={getSectionPath('dashboard')} replace />} />
      {NAVIGATION_ITEMS.map((item) => (
        <Route key={item.key} path={`${item.path}/*`} element={renderAdminPage(item.key)} />
      ))}
      <Route path="*" element={<Navigate to={getSectionPath('dashboard')} replace />} />
    </Routes>
  );
}
