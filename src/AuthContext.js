import React, { createContext, useState, useEffect, useCallback } from "react";
// import api from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authInfo, setAuthInfo] = useState({ nickname: "", type: "" });

  return (
    <AuthContext.Provider value={{ authInfo, setAuthInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
