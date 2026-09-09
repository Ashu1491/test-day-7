import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { createGeminiChatService } from './services/geminiChatService';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App service={createGeminiChatService()} />
  </StrictMode>,
);
