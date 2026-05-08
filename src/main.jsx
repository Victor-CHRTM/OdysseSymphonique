// -- Libraries -- //
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
// ----------------- //

// -- App -- //
import Home from "./pages/Home";
import GameSelection from "./pages/GameSelection";
import Game from "./pages/Game";
// ----------------- //

// -- Css -- //
import "./index.css";
import "./styles/main.scss";
// ----------------- //

// -- Définition des routes -- //
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/selection",
    element: <GameSelection />,
  },
  {
    path: "/game/:compositionId",
    element: <Game />,
  },
]);

// -- Render -- //
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
