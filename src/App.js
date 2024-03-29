import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import GlobalStyle from "./style/GlobalStyle";
import Topbar from "./component/layout/Nav";

import LandingPage from "./pages/LandingPage";

import PresentationList from "./pages/presentation/PresentationList/PresentationList";
import Summary from "./pages/presentation/Summary/Summary";
// import Speech from "./pages/presentation/Speech/Speech";
import SpeechTest from "./pages/presentation/Speech/SpeechTest";

import Practice from "./pages/presentation/Practice/Practice";
import NewPresentation from "./pages/presentation/NewPresentation/NewPresentation";

import CoachList from "./pages/coach/CoachList";
import Portfolio from "./pages/coach/Portfolio";

import Login from "./pages/login/Login";
import SignIn from "./pages/signin/SignIn";
import SignInCoach from "./pages/signin/SignInCoach";

import MyPage from "./pages/user/MyPage";
import MyMatching from "./pages/user/MyMatching";
import CoachMatching from "./pages/user/CoachMatching";
import UpdatePortfolio from "./pages/user/UpdatePortfolio";

import Feedback from "./pages/user/Feedback";

import Notfound from "./pages/Notfound";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import * as relativeTime from "dayjs/plugin/relativeTime";

import { AuthProvider } from "./AuthContext";
import { ScriptProvider } from "./pages/presentation/Speech/ScriptContext";

dayjs.locale("ko");
dayjs.extend(relativeTime);
function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/presentation" element={<PresentationList />} />
          <Route path="/presentation/summary" element={<Summary />} />

          {/* <Route path="/presentation/speech" element={<Speech />} /> */}
          <Route
            path="/presentation/speech"
            element={
              <ScriptProvider>
                <SpeechTest />
              </ScriptProvider>
            }
          />

          <Route
            path="/presentation/practice"
            element={<Practice isNew={false} />}
          />
          <Route path="/presentation/new" element={<NewPresentation />} />
          <Route
            path="/presentation/new/practice"
            element={<Practice isNew={true} />}
          />

          <Route path="/coach" element={<CoachList />} />
          <Route path="/coach/portfolio" element={<Portfolio />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signin/coach" element={<SignInCoach />} />

          <Route path="/user/mypage" element={<MyPage />} />
          <Route path="/user/mymatching" element={<MyMatching />} />
          <Route path="/user/coachmatching" element={<CoachMatching />} />
          <Route path="/user/portfolio/update" element={<UpdatePortfolio />} />

          <Route path="/feedback" element={<Feedback />} />

          <Route path="/*" element={<Notfound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
