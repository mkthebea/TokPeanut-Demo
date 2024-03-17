import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { createGlobalStyle } from "styled-components";
import { Box, IconButton, Button } from "@mui/material";
import theme from "../../style/theme";
import TextField from "@mui/material/TextField";
import JoinModal from "../../component/modal/JoinModal";
import AuthContext from "../../AuthContext";

const Login = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Pretendard",
    },
    palette: {
      primary: {
        main: "#FF7134",
      },
      secondary: {
        main: "#D9D9D9",
      },
    },
  });
  const navigate = useNavigate();

  const { authInfo, setAuthInfo } = useContext(AuthContext);

  const login = (loginType) => {
    if (loginType === "user") {
      setAuthInfo({ nickname: "사용자 체험", type: "user" });
      navigate("/presentation");
    } else {
      setAuthInfo({ nickname: "코치 체험", type: "coach" });
      navigate("/user/coachmatching");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <LoginWrap>
        <LoginBox>
          <PaddingWrap>
            <h1>TOKPEANUT</h1>
            <Desc>
              이 페이지는 스피치 교정 솔루션 톡피넛의 데모 버전입니다. <br />
              <br />
              아래의 버튼을 눌러 스피치 교정을 원하는 사용자 또는 <br />
              스피치 코치로 로그인 하실 수 있습니다.
            </Desc>
            <DemoBtn variant="contained" onClick={() => login("user")}>
              사용자 체험하기
            </DemoBtn>
            <DemoBtn variant="contained" onClick={() => login("coach")}>
              코치 체험하기
            </DemoBtn>
          </PaddingWrap>
        </LoginBox>
      </LoginWrap>
    </ThemeProvider>
  );
};

const GlobalStyle = createGlobalStyle`
    body{
        background-color: #fff;
    }
`;

const LoginWrap = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const DemoBtn = styled(Button)`
  height: 5rem;
  box-shadow: none;
  font-size: 1.8rem;
  color: #fff;
  padding: 1.2rem 2rem;
  margin: 0 1rem;
  width: 20rem;
`;

const Desc = styled.p`
  font-size: 1.6rem;
  padding: 0 2rem;
  color: #3b3b3b;
  line-height: 150%;
  margin-bottom: 2rem;
  text-align: center;
`;

const LoginBox = styled(Box)`
  border-radius: 10px;
  border: 0.5px solid #3b3b3b;
  h1 {
    font-size: 4rem;
    color: #ff7134;
    font-weight: bold;
    line-height: 150%;
    margin-bottom: 2rem;
    text-align: center;
  }
  @media ${() => theme.device.mobile} {
    margin-top: 0;
    border: none;
    height: 100%;
    width: 100%;
  }
`;

const PaddingWrap = styled(Box)`
  padding: 5rem 8rem;
  @media ${() => theme.device.mobile} {
    padding: 10rem 2rem 0 2rem;
  }
`;

export default Login;
