import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Account from "./account";
import { AllProviders } from "@/src/providers";

function App() {
  // Placed before router component to ensure window is defined

  return (
    <div>
      <AllProviders>
        <Account />
      </AllProviders>
    </div>
  );
}

export default App;
