import { ThinkwebScope } from './ThinkwebScope';
import AdminPortalScreen from './AdminPortalScreen';
import TestPage from './pages/TestPage';

export const routes = {
  'admin': () => <ThinkwebScope><AdminPortalScreen /></ThinkwebScope>,
  'test': () => <ThinkwebScope><TestPage /></ThinkwebScope>,
};
