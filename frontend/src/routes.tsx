import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import User from './layouts/user';
import Integrations from './pages/integrations';
import SignUp from './pages/sign-up';
import SignIn from './pages/sign-in';
import Guest from './layouts/guest';
import RootRouter from './components/root-router';
import NotFound from './pages/not-found';

const Project = lazy(() => import('./pages/project'));

export const routes: RouteObject[] = [
  {
    element: <Guest />,
    children: [
      { path: '/sign_up', element: <SignUp /> },
    ],
  },
  {
    element: <Guest />,
    children: [
      { path: '/sign_in', element: <SignIn /> },
    ],
  },
  {
    element: <User />,
    children: [
      { path: '/projects/:projectId', element: <Project /> },
    ],
  },
  {
    element: <User />,
    children: [
      { path: '/projects/:projectId/threads/:threadId', element: <Project /> },
    ],
  },
  {
    element: <User />,
    children: [
      { path: '/projects', element: <Project /> },
    ],
  },
  {
    element: <User/>,
    children: [
      { path: '/integrations', element: <Integrations /> },
    ],
  },
  {
    path: '/',
    element: <RootRouter />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
