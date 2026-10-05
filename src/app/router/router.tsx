import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { AppLayout } from '@/app/layout/AppLayout';
import { RequireAuth, RedirectIfAuth } from './guards';
import { WorkspaceGate } from './WorkspaceGate';

/**
 * Router raíz (Cap. 2.5 / 6.2). Las páginas se cargan de forma diferida (code-splitting,
 * Cap. 2.18 / 7.11): cada módulo entra en su propio chunk y baja el peso inicial.
 * El <Suspense> vive en App.tsx (fallback = Splash).
 */
const load = <T extends Record<string, ComponentType>>(factory: () => Promise<T>, name: keyof T) =>
  lazy(() => factory().then((m) => ({ default: m[name] })));

const LoginPage = load(() => import('@/modules/auth/pages/LoginPage'), 'LoginPage');
const RegisterPage = load(() => import('@/modules/auth/pages/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = load(
  () => import('@/modules/auth/pages/ForgotPasswordPage'),
  'ForgotPasswordPage',
);
const ResetPasswordPage = load(
  () => import('@/modules/auth/pages/ResetPasswordPage'),
  'ResetPasswordPage',
);
const PrivacyPolicyPage = load(
  () => import('@/modules/legal/pages/PrivacyPolicyPage'),
  'PrivacyPolicyPage',
);
const TermsPage = load(() => import('@/modules/legal/pages/TermsPage'), 'TermsPage');
const ProfilePage = load(() => import('@/modules/auth/pages/ProfilePage'), 'ProfilePage');
const CreateWorkspacePage = load(
  () => import('@/modules/workspace/pages/CreateWorkspacePage'),
  'CreateWorkspacePage',
);
const WorkspaceSettingsPage = load(
  () => import('@/modules/workspace/pages/WorkspaceSettingsPage'),
  'WorkspaceSettingsPage',
);
const MembersPage = load(() => import('@/modules/workspace/pages/MembersPage'), 'MembersPage');
const HistoryPage = load(() => import('@/modules/workspace/pages/HistoryPage'), 'HistoryPage');
const AcceptInvitationPage = load(
  () => import('@/modules/workspace/pages/AcceptInvitationPage'),
  'AcceptInvitationPage',
);
const AccountsPage = load(() => import('@/modules/accounts/pages/AccountsPage'), 'AccountsPage');
const CategoriesPage = load(
  () => import('@/modules/categories/pages/CategoriesPage'),
  'CategoriesPage',
);
const TransactionsPage = load(
  () => import('@/modules/transactions/pages/TransactionsPage'),
  'TransactionsPage',
);
const CalendarPage = load(() => import('@/modules/calendar/pages/CalendarPage'), 'CalendarPage');
const BudgetsPage = load(() => import('@/modules/budgets/pages/BudgetsPage'), 'BudgetsPage');
const GoalsPage = load(() => import('@/modules/goals/pages/GoalsPage'), 'GoalsPage');
const ReportsPage = load(() => import('@/modules/reports/pages/ReportsPage'), 'ReportsPage');
const NotificationsPage = load(
  () => import('@/modules/notifications/pages/NotificationsPage'),
  'NotificationsPage',
);
const RemindersPage = load(
  () => import('@/modules/notifications/pages/RemindersPage'),
  'RemindersPage',
);
const DashboardPage = load(
  () => import('@/modules/dashboard/pages/DashboardPage'),
  'DashboardPage',
);

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuth />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
  { path: ROUTES.privacy, element: <PrivacyPolicyPage /> },
  { path: ROUTES.terms, element: <TermsPage /> },
  {
    element: <RequireAuth />,
    children: [
      { element: <AppLayout />, children: [{ path: ROUTES.profile, element: <ProfilePage /> }] },
      { path: ROUTES.createWorkspace, element: <CreateWorkspacePage /> },
      { path: `${ROUTES.invite}/:token`, element: <AcceptInvitationPage /> },
      {
        element: <WorkspaceGate />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.home, element: <DashboardPage /> },
              { path: ROUTES.transactions, element: <TransactionsPage /> },
              { path: ROUTES.calendar, element: <CalendarPage /> },
              { path: ROUTES.reports, element: <ReportsPage /> },
              { path: ROUTES.accounts, element: <AccountsPage /> },
              { path: ROUTES.categories, element: <CategoriesPage /> },
              { path: ROUTES.budgets, element: <BudgetsPage /> },
              { path: ROUTES.goals, element: <GoalsPage /> },
              { path: ROUTES.notifications, element: <NotificationsPage /> },
              { path: ROUTES.reminders, element: <RemindersPage /> },
              { path: ROUTES.workspaceSettings, element: <WorkspaceSettingsPage /> },
              { path: ROUTES.members, element: <MembersPage /> },
              { path: ROUTES.history, element: <HistoryPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
]);
