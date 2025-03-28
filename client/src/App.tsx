import "./App.css";
import { HomePage } from "./components/HomePage";
import { AuthenticationProvider } from "./hooks/useAuthentication";

function App() {
  return (
    <AuthenticationProvider>
      <HomePage />
    </AuthenticationProvider>
  );
}

export default App;
