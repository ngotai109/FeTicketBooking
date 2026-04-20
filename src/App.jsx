
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './assets/styles/App.css';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/Common/ScrollToTop';
import { SignalRProvider } from './contexts/SignalRContext';


function App() {
  return (
    <Router>
      <ScrollToTop />
      
      <SignalRProvider>
        <AppRoutes />
      </SignalRProvider>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
