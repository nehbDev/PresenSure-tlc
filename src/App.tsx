import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./routes/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // <--- 1. IMPORT THIS

const queryClient = new QueryClient();
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <ScrollToTop></ScrollToTop>
        <AppRoutes></AppRoutes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
