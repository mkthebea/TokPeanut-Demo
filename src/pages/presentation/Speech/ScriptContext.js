import React, { createContext, useState } from "react";

const ScriptContext = createContext(null);

export const ScriptProvider = ({ children }) => {
  const [scriptContext, setScriptContext] = useState({
    cursor: "BASIC",
    isDone: false,
  });

  return (
    <ScriptContext.Provider value={{ scriptContext, setScriptContext }}>
      {children}
    </ScriptContext.Provider>
  );
};

export default ScriptContext;
