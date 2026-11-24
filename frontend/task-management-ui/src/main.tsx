import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, createTheme } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'

import { AuthProvider } from './context/AuthContext'
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
});

const basename = new URL(document.baseURI).pathname.replace(/\/[^/]*$/, '') || '/';

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <Notifications position="top-right" />
    <ModalsProvider>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ModalsProvider>
  </MantineProvider>,
)
