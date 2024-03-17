import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import AuthContext from "../../AuthContext";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled/macro";
import { createGlobalStyle } from "styled-components";
import {
  createTheme,
  ThemeProvider,
  Box,
  IconButton,
  Button,
} from "@mui/material";

import Tooltip from "@mui/material/Tooltip";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilledBtn from "../../component/button/FilledBtn";

import Nav from "../../component/layout/Nav";

import theme from "../../style/theme";

import peanut_run from "../../image/peanut_run.png";

import stt from "../stt2.json";
import mp3 from "../mp3.mp3";

// custom hook (timer)
const useCounter = (initialValue, ms) => {
  const [count, setCount] = useState(initialValue);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    if (intervalRef.current !== null) {
      return;
    }
    intervalRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, ms);
  }, [ms]);

  const stop = useCallback(() => {
    if (intervalRef.current === null) {
      return;
    }
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);
  return { count, start, stop, reset, setCount };
};

// simple symbol reducer
const simpleSymbolsReducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      console.log("init simple symbols: ", action.payload);
      return action.payload;
    case "ADD":
      console.log("add simple symbol: ", action.symbol, action.idx, state);
      return state.map((symbol, i) => {
        if (i == action.idx) {
          console.log("add symbol: ", symbol, action.symbol);
          return [...new Set([...symbol, action.symbol])];
        } else {
          return symbol;
        }
      });
    case "REMOVE":
      return state.map((symbol, i) => {
        if (i == action.idx) {
          // return new Set();
          return [];
        } else {
          return symbol;
        }
      });
    default:
      throw new Error("Unhandled action");
  }
};

const Feedback = () => {
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
  const { authInfo } = useContext(AuthContext);
  const [isDone, setIsDone] = useState(false);

  // 0.001초 단위 타이머
  const { count, start, stop, reset, setCount } = useCounter(0, 100);

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
      "강조를 위한 노란색 형광펜입니다. \n피드백할 위치에 드래그 하세요.",
    FASTER:
      "[빠르게] 표시를 위한 분홍색 형광펜입니다. \n피드백할 위치에 드래그 하세요.",
    SLOWER:
      "[느리게] 표시를 위한 초록색 형광펜입니다. \n피드백할 위치에 드래그 하세요.",
    EDIT: "단어를 수정하는 연필입니다. \n피드백할 단어를 클릭하세요.",
    ENTER: "줄바꿈을 위한 아이콘입니다. \n피드백할 위치를 클릭해 추가하세요.",
    PAUSE: "일시정지를 위한 아이콘입니다. \n피드백할 위치를 클릭해 추가하세요.",
    MOUSE:
      "ppt 애니메이션 등 마우스 클릭 이벤트를 위한 아이콘입니다. \n피드백할 위치를 클릭해 추가하세요.",
    SLASH: "끊어읽기를 위한 아이콘입니다. \n피드백할 위치를 클릭해 추가하세요.",
    ERASER:
      "모든 기호를 지우는 지우개입니다. \n초기화 하고싶은 단어를 클릭하세요.",
  };

  const navigate = useNavigate();

  // STT 데이터 초기화
  const [text, setText] = useState([]);
  const [started, setStarted] = useState([]);
  const [ended, setEnded] = useState([]);
  const [duration, setDuration] = useState([]);
  const [scriptLength, setScriptLength] = useState(0);
  const initSTT = useCallback((stt) => {
    const words = stt.segments.flatMap((seg) => seg.words.map((w) => w[2]));
    setText(words);
    setScriptLength(words.length);
    setStarted(
      stt.segments.flatMap((seg) => seg.words.map((w) => w[0] * 0.01))
    );
    setEnded(stt.segments.flatMap((seg) => seg.words.map((w) => w[1] * 0.01)));
    setDuration(
      stt.segments.flatMap((seg) => seg.words.map((w) => (w[1] - w[0]) * 0.001))
    );
  }, []);
  useEffect(() => {
    initSTT(stt);
  }, [initSTT]);

  const [simpleSymbols, dispatch] = useReducer(
    simpleSymbolsReducer, // reducer
    [[]] //initial state
  );
  const [highlighted, setHighlighted] = useState([]);
  const [edited, setEdited] = useState([]);

  // init user symbols
  useEffect(() => {
    // initUserSymbols();
    if (scriptLength === 0) return;
    dispatch({
      type: "INIT",
      payload: Array(scriptLength).fill([]),
    });
    setHighlighted(Array(scriptLength).fill(""));
    setEdited(Array(scriptLength).fill(""));
  }, [scriptLength]);

  useEffect(() => {
    if (!mp3) return;
    if (!simpleSymbols) return;
    if (text.length === 0) return;
    setIsDone(true);
  }, [text, simpleSymbols]);

  const wordRef = useRef([]);

  // 편집 기능
  const [cursor, setCursor] = useState("BASIC");
  const [dragging, setDragging] = useState(false);

  const [waveFormLoaded, setWaveFormLoaded] = useState(false);
  const [waveSurferInstance, setWaveSurferInstance] = useState(null);

  const clickWord = useCallback(
    (e) => {
      if (!waveFormLoaded) return;
      const selectedWordIdx = e.currentTarget.id; // 클릭된 단어 인덱스

      switch (cursor) {
        // 기호 표시
        case "HIGHLIGHT":
          highlighted[selectedWordIdx] = "rgba(255,255,204)";
          setHighlighted([...highlighted]);
          setDragging(true);
          break;
        case "FASTER":
          highlighted[selectedWordIdx] = "rgb(255, 204, 255)";
          setHighlighted([...highlighted]);
          setDragging(true);
          break;
        case "SLOWER":
          highlighted[selectedWordIdx] = "rgb(204, 255, 204)";
          setHighlighted([...highlighted]);
          setDragging(true);
          break;
        case "EDIT":
          edited[selectedWordIdx] = edited[selectedWordIdx]
            ? edited[selectedWordIdx]
            : text[selectedWordIdx]; // 원래 단어로 초기화
          setEdited([...edited]);
          break;
        case "ENTER":
        case "PAUSE":
        case "MOUSE":
        case "SLASH":
          dispatch({ type: "ADD", symbol: cursor, idx: selectedWordIdx });
          break;
        case "ERASER":
          dispatch({ type: "REMOVE", idx: selectedWordIdx });
          highlighted[selectedWordIdx] = "";
          setHighlighted([...highlighted]);
          edited[selectedWordIdx] = null;
          setEdited([...edited]);
          setDragging(true);
          break;
        // 재생 바 조절
        case "BASIC":
          waveSurferInstance.setCurrentTime(started[selectedWordIdx] * 0.1);
          setCount(started[selectedWordIdx]);
          break;
        default:
          break;
      }
    },
    [
      cursor,
      waveFormLoaded,
      waveSurferInstance,
      text,
      highlighted,
      edited,
      setCount,
      started,
    ]
  );

  // 파형
  const onReset = useCallback(() => {
    reset();
    waveSurferInstance.setCurrentTime(0);
    waveSurferInstance.pause();
  }, [reset, waveSurferInstance]);

  const wavesurferRef = useRef(null);
  const playButton = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!mp3) {
      console.log("audio not loaded");
      return;
    }
    let wavesurfer = null;
    const initWaveSurfer = () => {
      wavesurfer = WaveSurfer.create({
        container: wavesurferRef.current,
        audioRate: 1, // 재생 속도 (default 1)
        barHeight: 1, // 막대 높이 (default 1)
        barWidth: 2, // 막대 넓이
        barGap: 5,
        cursorColor: "#ff4e00",
        cursorWidth: 2,
        fillParent: true, // 부모 요소를 가득 채울지, mixPxPerSec 옵션에 따를지
        height: 64, // 웨이브 폼 전체의 높이
        hideScrollbar: true, // 가로 스크롤바 표시 여부
        minPxPerSec: 50, // 오디오 파일의 1초당 렌더링 될 픽셀 수의 최솟값. zoom level
        normalize: true, // true면 가장 큰 막대의 길이에 비례하여 막대 높이 설정
        progressColor: "#F86F03", // 커서 왼쪽의 파형 색상
        responsive: false, // 웨이브 폼이 부모 요소보다 길어서 넘치는 경우 스크롤바 or 줄여서 렌더링
        waveColor: "#3b3b3b", // 커서 오른쪽의 파형 색상
        interact: false, // 파형 클릭 불가능
        splitChannels: false, // 두 줄로 출력
        autoScroll: true, // 자동 스크롤
        scrollParent: true,
      });
      wavesurfer.load(mp3);
      // wavesurfer.loadBlob(audio);

      setWaveSurferInstance(wavesurfer);
      // play/pause event
      wavesurfer.on("play", () => {
        start();
        setPlaying(true);
      });
      wavesurfer.on("pause", () => {
        stop();
        setPlaying(false);
      });

      wavesurfer.on("ready", () => {
        console.log("waveform ready");
        setWaveFormLoaded(true);
        playButton.current.addEventListener("click", () => {
          wavesurfer.playPause();
        });
      });
    };

    const handleUserGesture = () => {
      if (!wavesurfer) {
        initWaveSurfer();
        document.removeEventListener("click", handleUserGesture);
        console.log("remove click event listener");
      }
    };
    document.addEventListener("click", handleUserGesture);
    return () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
      document.removeEventListener("click", handleUserGesture);
    };
  }, [start, stop]);

  const handleBlur = useCallback(
    (e, i) => {
      let updated = [...edited];
      if (e.target.innerText === text[i]) {
        updated[i] = null;
      } else if (e.target.innerText.trim() === "") {
        updated[i] = "-";
      } else {
        updated[i] = e.target.innerText;
      }
      setEdited(updated);
    },
    [edited, text]
  );

  const finish = async () => {
    const complete = window.confirm(
      "피드백을 완료하시겠습니까?\n완료한 후에는 수정이 불가능합니다."
    );
    if (!complete) return;
    alert("피드백이 완료되었습니다.");
    navigate("/user/coachmatching");
  };

  // const [isArrowHover, setIsArrowHover] = useState(false);
  // const handleMouseOver = useCallback(() => {
  //   setIsArrowHover(true);
  // }, []);
  // const handleMouseOut = useCallback(() => {
  //   setIsArrowHover(false);
  // }, []);

  return (
    <div
      onMouseUp={() => {
        setDragging(false);
      }}
    >
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Nav />
        <Container cursor={symbolIcons[cursor]}>
          {authInfo.type === "coach" &&
            (isDone ? (
              <Activate>
                <ToolBarWrap cursor={symbolIcons[cursor]}>
                  <ul className="activate">
                    {Object.entries(symbolIcons).map(([name, src]) => (
                      <li key={name}>
                        <Tooltip
                          title={symbolDesc[name]}
                          followCursor
                          arrow
                          placement="right"
                        >
                          <Button
                            className="color"
                            id="color1"
                            onClick={() => {
                              setCursor(name);
                              setDragging(false);
                            }}
                          >
                            <img src={src} alt={name} />
                            <p>{name}</p>
                          </Button>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                </ToolBarWrap>
              </Activate>
            ) : (
              <Disabled>
                <ToolBarWrap>
                  <ul className="disabled">
                    {Object.entries(symbolIcons).map(([name, src], i) => (
                      <li key={name}>
                        <Button disabled>
                          <img
                            src={i < 4 ? "/img/script/toolbar/pencil.svg" : src}
                            alt="symbol"
                          />
                          <p>{name}</p>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ToolBarWrap>
              </Disabled>
            ))}

          <Script props={{ user: authInfo.type !== "coach" }}>
            <Screen>
              {isDone ? (
                <TextArea>
                  <p>
                    {text.map((word, i) => (
                      <span key={i}>
                        <Symbol>
                          {simpleSymbols[i].includes("ENTER") && <br />}
                        </Symbol>
                        <span
                          style={{
                            display: "inline-flex",
                            flexDirection: "column",
                          }}
                        >
                          <Highlight
                            $color={highlighted[i]}
                            $continued={
                              highlighted[i] === highlighted[i + 1] ? 1 : 0
                            }
                          >
                            <Text
                              key={i}
                              $played={
                                started[i] < count
                                  ? count < ended[i]
                                    ? "playing"
                                    : "played"
                                  : "not played"
                              }
                              $duration={duration[i]}
                              // onClick={clickWord}
                              onMouseDown={clickWord}
                              onMouseOver={(e) => {
                                if (dragging) {
                                  clickWord(e);
                                }
                              }}
                              id={i}
                              $edited={edited[i] ? 1 : 0}
                            >
                              {
                                // 단순 기호
                                simpleSymbols[i].map((symbol) => (
                                  <img
                                    src={symbolIcons[symbol]}
                                    alt={symbol}
                                    key={symbol}
                                  />
                                ))
                              }
                              <span>
                                <span
                                  ref={(el) => (wordRef.current[i] = el)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault(); // 줄바꿈 방지
                                      handleBlur(e, i);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    handleBlur(e, i);
                                  }}
                                  contentEditable={cursor === "EDIT"} // 현재 커서가 수정펜일 때만 수정 모드
                                  edited={edited[i]}
                                  spellCheck={false}
                                  suppressContentEditableWarning={true} // warning 무시
                                >
                                  {edited[i] ? edited[i] : word}
                                </span>
                                {
                                  // 수정 전 단어 툴팁
                                  edited[i] ? (
                                    <OriginalText
                                      contentEditable={false}
                                      $len={word.length + 5}
                                    >
                                      수정 전: {word}
                                    </OriginalText>
                                  ) : null
                                }
                              </span>
                            </Text>
                          </Highlight>
                        </span>
                      </span>
                    ))}
                  </p>
                </TextArea>
              ) : (
                <>
                  <div className="logo-box" />
                  <h1>로딩중...</h1>
                </>
              )}
            </Screen>
            <WaveContainer>
              {isDone ? (
                waveFormLoaded ? null : (
                  <div className="text">클릭하여 시작하세요</div>
                )
              ) : (
                <div className="text">waiting...</div>
              )}
              <WaveWrapper
                ref={wavesurferRef}
                $ready={isDone && waveFormLoaded ? 1 : 0}
              />
            </WaveContainer>
            <PC>
              <ScriptBarWrap>
                {isDone ? (
                  <>
                    <div className="btn-wrap activate">
                      <div>
                        <PlayBtn variant="contained" ref={playButton}>
                          {playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </PlayBtn>
                        <PlayBtn variant="contained" onClick={onReset}>
                          <RestartAltIcon />
                        </PlayBtn>
                      </div>
                    </div>
                    {authInfo.type === "coach" && (
                      <>
                        <FinishToolTip>피드백 완료</FinishToolTip>
                        <FinishArrow
                          onClick={finish}
                          // onMouseOver={handleMouseOver}
                          // onMouseOut={handleMouseOut}
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </FinishArrow>
                      </>
                    )}
                  </>
                ) : (
                  <div className="btn-wrap">
                    <div>
                      <PlayBtn variant="contained" ref={playButton} disabled>
                        <PlayArrowIcon />
                      </PlayBtn>
                      <PlayBtn variant="contained" onClick={onReset} disabled>
                        <RestartAltIcon />
                      </PlayBtn>
                    </div>
                    {authInfo.type === "coach" && (
                      <div className="done-btn">
                        {/* <FilledBtn text={"피드백 완료"} disabled /> */}
                      </div>
                    )}
                  </div>
                )}
              </ScriptBarWrap>
            </PC>
          </Script>
        </Container>
      </ThemeProvider>
    </div>
  );
};

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

const FinishArrow = styled.div`
  @keyframes AnimateArrow {
    0% {
      opacity: 0;
      transform: rotate(45deg) translate(-20px, -20px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translate(20px, 20px);
    }
  }
  position: absolute;
  top: 50vh;
  right: 6vw;
  /* transform: translate(50%, 50%); */
  transform: rotate(-90deg);
  cursor: pointer;
  span {
    display: block;
    width: 1.5vw;
    height: 1.5vw;
    border-bottom: 4px solid #f86f03;
    border-right: 4px solid #f86f03;
    /* transform: rotate(45deg); */
    margin: -10px;
    animation: AnimateArrow 2s infinite;
  }

  span:nth-child(2) {
    animation-delay: -0.2s;
  }

  span:nth-child(3) {
    animation-delay: -0.4s;
  }
`;

const FinishToolTip = styled.span`
  /* position: absolute; */
  visibility: hidden;
  width: 12rem;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  /* bottom: 100%;
  left: 50%; */
  font-size: 1.6rem;
  z-index: 100;
  transition: all 0.1s ease-in-out;

  ${FinishArrow}:hover & {
    visibility: visible;
  }
`;

const Container = styled(Box)`
  cursor: url(${(props) => props.cursor}) 50 50, auto;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
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
const Script = styled(Box)`
  width: ${({ props }) => (props.user ? "100vw" : "80vw")};
  height: 80vh;
  margin: ${({ props }) =>
    props.user ? "13rem 10rem 0 10rem" : "13rem 10rem 0 5rem"};
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  @media ${() => theme.device.mobile} {
    margin: 0;
    height: auto;
  }
`;

const WaveContainer = styled.div`
  height: 64px;
  margin-bottom: 3rem;
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff6f4;

  .text {
    width: 100%;
    height: 64px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
`;

const Screen = styled(Box)`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;

  .logo-box {
    @keyframes run {
      0% {
        background-position-x: 0px;
      }
      100% {
        background-position-x: -210vh;
      }
    }
    animation: run 0.6s infinite steps(7);
    background-image: url(${peanut_run});
    background-size: 210vh 30vh;
    height: 30vh;
    width: 30vh;
    will-change: transform;
  }

  h1 {
    font-size: 3rem;
    color: #ff7134;
    font-weight: bold;
    margin-top: 2rem;
    text-align: center;
  }
  @media ${() => theme.device.desktop2} {
    .logo-box {
      img {
        width: 30rem;
      }
    }
    h1 {
      font-size: 2.5rem;
    }
  }
  @media ${() => theme.device.mobile} {
    .sound-wave {
      img {
        width: 80%;
      }
    }
    .logo-box {
      img {
        width: 20rem;
      }
    }
  }
`;

const TextArea = styled(Box)`
  width: 90%;
  height: 100%;
  padding: 3rem;
  p {
    flex-direction: row;
    height: 50vh;
    overflow-y: scroll;
    padding: 3rem;
    background-color: #f5f5f5;
    font-size: 2rem;
    line-height: 200%;
    color: #3b3b3b;
    .pencil3 {
      background-color: #cbf5ca;
    }
    .pencil2 {
      background-color: #ffdefc;
    }
    .pencil1 {
      background-color: #fff2c2;
    }
    img {
      width: 1.5rem;
      height: 1.5rem;
      margin: 0 0.5rem 0 0.5rem;
      filter: invert(43%) sepia(98%) saturate(401%) hue-rotate(346deg)
        brightness(101%) contrast(88%);
    }
  }
  @media ${() => theme.device.mobile} {
    padding: 2rem;
    p {
      height: auto;
      font-size: 1.8rem;
    }
  }
`;

const Symbol = styled.span`
  height: 3rem;
  vertical-align: bottom;
  padding-bottom: 1rem;
  .correction {
    width: 2.5rem;
  }
  .pause_too_long {
    filter: invert(5%) sepia(86%) saturate(7388%) hue-rotate(247deg)
      brightness(103%) contrast(107%);
  }
  .pause_too_short {
    filter: invert(12%) sepia(97%) saturate(5608%) hue-rotate(9deg)
      brightness(90%) contrast(102%);
  }
`;

const Disabled = styled(Box)`
  height: 100vh;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  .disabled {
    background-color: #e0e0e0;
  }
  @media ${() => theme.device.mobile} {
    display: none;
  }
`;

const Activate = styled(Box)`
  height: 100vh;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  @media ${() => theme.device.mobile} {
    display: none;
  }
`;

// tool bar
const ToolBarWrap = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  & > ul {
    margin-top: 5rem;
    background-color: #fff;
    .select {
      background-color: #ffe9d9;
      #color1 {
        p {
          color: #ffe609;
        }
      }
      #color2 {
        p {
          color: #ff5eef;
        }
      }
      #color3 {
        p {
          color: #0ff80a;
        }
      }
      p {
        font-weight: bold;
        color: #838383;
      }
    }
    li:last-of-type {
      border-bottom: none;
    }
    li {
      width: 10rem;
      height: 10rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      p {
        font-size: 1.4rem;
        color: #aeaeae;
        line-height: 150%;
      }
      button {
        cursor: url(${(props) => props.cursor}) 50 50, auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        img {
          width: 2rem;
          height: 2rem;
          margin-bottom: 1rem;
        }
      }
    }
  }
  .activate {
    li {
      button:not(.color) {
        img {
          filter: invert(53%) sepia(0%) saturate(0%) hue-rotate(352deg)
            brightness(98%) contrast(89%);
        }
      }
    }
  }

  @media ${() => theme.device.desktop} {
    & > ul {
      li {
        width: 8rem;
        height: 8rem;
      }
    }
  }
  @media ${() => theme.device.desktop2} {
    & > ul {
      li {
        width: 7rem;
        height: 7rem;
      }
    }
  }
`;

// 하단 바
const PC = styled(Box)`
  width: 100%;
  @media ${() => theme.device.mobile} {
    display: none;
  }
`;
const Mobile = styled(Box)`
  display: none;
  width: 100%;
  @media ${() => theme.device.mobile} {
    display: block;
  }
`;

const ScriptBarWrap = styled(Box)`
  background-color: #ff7134;
  width: 100%;
  height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  .activate {
    button {
      svg {
        color: #ff7134 !important;
      }
    }
  }
  .btn-wrap {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 65%;
    /* li {
      display: flex;
      align-items: center;
    } */
    div {
      display: flex;
      align-items: center;
    }
    button {
      font-size: 1.6rem;
      padding: 1rem 3rem;
      margin-right: 2rem;
    }
    .done-btn {
      position: absolute;
      right: 0;
      bottom: 5rem;
    }
    .Mui-disabled {
      background-color: #e0e0e0;
    }
  }
  @media ${() => theme.device.desktop} {
    .btn-wrap {
      width: 100%;
    }
  }
  @media ${() => theme.device.desktop2} {
    .btn-wrap {
      button {
        font-size: 1.4rem;
        padding: 0.5rem 2rem;
      }
    }
  }
  @media ${() => theme.device.mobile} {
    height: 20rem;
    padding: 2rem 0;
    .btn-wrap {
      li {
        margin: 0;
      }
      button {
        margin-bottom: 1rem;
      }
      button:last-of-type {
        margin-bottom: 1rem;
      }
      li:last-of-type {
        width: 100%;
        margin-top: 1rem;
        padding: 0 5%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }
    }
  }
`;

const PlayBtn = styled(IconButton)`
  width: 5rem;
  height: 5rem;
  padding: 0 !important;
  background-color: #fff;
  &:hover {
    background-color: #fff;
  }
  svg {
    width: 2.5rem;
    height: 2.5rem;
  }
  @media ${() => theme.device.desktop2} {
    width: 3.5rem;
    height: 3.5rem;
    svg {
      width: 2rem;
      height: 2rem;
    }
  }
  @media ${() => theme.device.mobile} {
    width: 5rem;
    height: 5rem;
    margin-bottom: 0 1rem 0 0 !important;
    svg {
      width: 3rem;
      height: 3rem;
    }
  }
`;

// 스크립트 재생 애니메이션
export const PlayingText = keyframes`
from {
  background-position-x: 0%;
}
to {
  background-position-x: 100%;
}
`;

export const Highlight = styled.span`
  background-color: ${(props) => props.$color};
  margin-right: ${(props) => (props.$continued ? "none" : "5px")};
  padding-right: ${(props) => (props.$continued ? "5px" : "none")};
`;

// 스크립트의 단어
export const Text = styled.span`
  z-index: 10;
  flex-direction: column;
  position: relative;
  background-clip: ${(props) => (props.$played === "playing" ? "text" : "")};
  -webkit-background-clip: ${(props) =>
    props.$played === "playing" ? "text" : ""};
  color: ${(props) =>
    props.$played === "playing"
      ? "transparent"
      : props.$played === "played"
      ? "#ff7134"
      : "black"};
  background-image: ${(props) =>
    props.$played === "playing"
      ? "linear-gradient(to right, #ff7134 50%, black 50% 100%)"
      : ""};

  background-size: 200% 100%;
  background-position-x: 0%;
  animation-name: ${(props) =>
    props.$played === "playing" ? PlayingText : ""};
  animation-duration: ${(props) => props.$duration}s;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-direction: reverse;
  animation-fill-mode: forwards;

  text-decoration: ${(props) => (props.$edited ? "underline" : "none")};

  &:hover {
    /* text-decoration: orange dashed underline; */
    font-weight: bold;
  }
`;

// 수정 전 단어 + 툴팁
export const OriginalText = styled.span`
  visibility: hidden;
  width: ${(props) => props.$len * 1.5}rem;
  bottom: 100%;
  left: 50%;
  /* margin-left: calc(-60% - 0.5rem); */
  margin-left: ${(props) => props.$len * -0.75 - 0.5}rem;
  font-size: 1.5rem;
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  text-align: center;
  /* padding: 0.5rem 0.2rem; */
  border-radius: 5px;
  position: absolute;
  z-index: 100;
  transition: all 0.1s ease-in-out;

  ${Text}:hover & {
    visibility: visible;
  }

  // 아래 화살표
  &::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.3) transparent transparent transparent;
  }
`;

// 파형 ref
export const WaveWrapper = styled.div`
  display: ${(props) => (props.$ready ? "block" : "none")};
  width: 100%;
  height: 100%;
`;

export default Feedback;
