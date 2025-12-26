import { createRoot } from 'react-dom/client'
import 'src/index.css'
import App from 'app/App.tsx'

createRoot(document.getElementById('app-root')!).render(
    <App />
)
