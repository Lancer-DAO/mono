import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Account from "./account";
import { LancerProvider } from "@/src/providers/lancerProvider";

function App() {
  // Placed before router component to ensure window is defined

  return (
    <div>
      <LancerProvider>
        <Account />
      </LancerProvider>
    </div>
  );
}

export default App;
