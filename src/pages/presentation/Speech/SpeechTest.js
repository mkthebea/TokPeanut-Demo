import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Pagination from "../Pagination/Pagination";

import styled from "@emotion/styled/macro";
import { createGlobalStyle } from "styled-components";
import {
  createTheme,
  Divider,
  Icon,
  ThemeProvider,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import ToolBarPC from "../../../component/script/ToolbarPC";
import PageBtn from "../../../component/script/PageBtn";
import ScriptBar from "../../../component/script/ScriptBar";
import ToolBarMo from "../../../component/script/ToolbarMo";

import Nav from "../../../component/layout/Nav";

import theme from "../../../style/theme";

import Script from "./Script";
import ToolBar from "./ToolBar";

import ScriptContext from "./ScriptContext";

const SpeechTest = () => {
  const theme = createTheme({
    typography: {
      fontFamily: "Pretendard",
    },
    palette: {
      primary: {
        main: "#FF7134",
      },
    },
    // 툴팁 커스텀
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: "1.2rem",
            backgroundColor: "white",
            color: "gray",
            border: "1px solid rgba(0, 0, 0, 0.25)",
            whiteSpace: "pre-line",
          },
          arrow: {
            color: "white",
            "&:before": {
              border: "1px solid rgba(0, 0, 0, 0.25)",
            },
          },
        },
      },
    },
  });

  const { scriptContext, setScriptContext } = useContext(ScriptContext);

  // images and descriptions
  const symbolIcons = {
    BASIC: "/img/script/toolbar/basic-cursor.svg",
    HIGHLIGHT: "/img/script/toolbar/color/pencil1.svg",
    FASTER: "/img/script/toolbar/color/pencil2.svg",
    SLOWER: "/img/script/toolbar/color/pencil3.svg",
    EDIT: "/img/script/toolbar/edit.svg",
    ENTER: "/img/script/toolbar/down-left.svg",
    PAUSE: "/img/script/toolbar/pause.svg",
    MOUSE: "/img/script/toolbar/mouse.svg",
    SLASH: "/img/script/toolbar/slash.svg",
    ERASER: "/img/script/toolbar/eraser.svg",
  };
  const symbolDesc = {
    BASIC:
      "재생 바를 조절하는 기본 커서입니다. \n단어를 클릭해 원하는 위치로 이동하세요.",
    HIGHLIGHT:
      "강조를 위한 노란색 형광펜입니다. \n원하는 위치에 드래그 하세요.",
    FASTER:
      "[빠르게] 표시를 위한 분홍색 형광펜입니다. \n원하는 위치에 드래그 하세요.",
    SLOWER:
      "[느리게] 표시를 위한 초록색 형광펜입니다. \n원하는 위치에 드래그 하세요.",
    EDIT: "단어를 수정하는 연필입니다. \n수정하고 싶은 단어를 클릭하세요.",
    ENTER: "줄바꿈을 위한 아이콘입니다. \n원하는 위치를 클릭해 추가하세요.",
    PAUSE: "일시정지를 위한 아이콘입니다. \n원하는 위치를 클릭해 추가하세요.",
    MOUSE:
      "ppt 애니메이션 등 마우스 클릭 이벤트를 위한 아이콘입니다. \n원하는 위치를 클릭해 추가하세요.",
    SLASH: "끊어읽기를 위한 아이콘입니다. \n원하는 위치를 클릭해 추가하세요.",
    ERASER:
      "모든 기호를 지우는 지우개입니다. \n초기화 하고싶은 단어를 클릭하세요.",
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Nav />
      <Container cursor={symbolIcons[scriptContext.cursor]}>
        <ToolBar symbolIcons={symbolIcons} symbolDesc={symbolDesc} />
        <Script symbolIcons={symbolIcons} />
        <Pagination />
      </Container>
    </ThemeProvider>
  );
};

// styled components
const GlobalStyle = createGlobalStyle`
    body{
        background-color: #FAFAFA;
    }
    // 드래그 색상 없애기
    ::selection {
      background: transparent;
      color: inherit;
    }
    // Firefox 전용 
    ::-moz-selection {
      background: transparent;
      color: inherit;
    }
`;
const Container = styled(Box)`
  cursor: url(${(props) => props.cursor}) 50 50, auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  @media ${() => theme.device.mobile} {
    flex-direction: column-reverse;
    width: 90%;
    margin: 0 auto;
    padding-bottom: 3rem;
    height: auto;
  }
`;

export default SpeechTest;
