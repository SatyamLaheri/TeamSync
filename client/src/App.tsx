import AppRoutes from "./routes";
import { ThemeProvider } from "./context/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="teamsync-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
