import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";

import { keyframes } from "@emotion/react";
import styled from "@emotion/styled/macro";
import theme from "../../../style/theme";
import { Box, IconButton } from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FilledBtn from "../../../component/button/FilledBtn";

import AiFeedbackModal from "../../../component/modal/AiFeedbackModal";
import StatisticsModal from "../../../component/modal/StatisticsModal";

import WaveSurfer from "wavesurfer.js";

import stt from "../../stt_format.json";
import mp3 from "../../mp3e.m4a";
import peanut_run from "../../../image/peanut_run.png";

import ScriptContext from "./ScriptContext";

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
      return action.payload;
    case "ADD":
      return state.map((symbol, i) => {
        if (i == action.idx) {
          return [...new Set([...symbol, action.symbol])];
        } else {
          return symbol;
        }
      });
    case "REMOVE":
      return state.map((symbol, i) => {
        if (i == action.idx) {
          return [];
        } else {
          return symbol;
        }
      });
    default:
      throw new Error("Unhandled action");
  }
};

const Script = ({ symbolIcons }) => {
  const correctionIcons = [
    { name: "휴지 긺", src: "/img/script/space_long.svg" },
    { name: "휴지 짧음", src: "/img/script/space_short.svg" },
  ];
  const navigate = useNavigate();
  const { scriptContext, setScriptContext } = useContext(ScriptContext);

  // 0.1초 단위 타이머
  const { count, start, stop, reset, setCount } = useCounter(0, 100);

  const text = stt.text;
  const started = stt.started;
  const ended = stt.ended;
  const duration = stt.duration;
  const scriptLength = text.length;

  // 사용자 기호
  const [simpleSymbols, dispatch] = useReducer(
    simpleSymbolsReducer, // reducer
    [[]] //initial state
  );
  const [highlighted, setHighlighted] = useState([]);
  const [edited, setEdited] = useState([]);

  useEffect(() => {
    if (scriptLength === 0) return;
    dispatch({
      type: "INIT",
      payload: Array(scriptLength).fill([]),
    });
    setHighlighted(Array(scriptLength).fill(""));
    setEdited(Array(scriptLength).fill(""));
  }, [scriptLength]);

  // 준비 완료
  useEffect(() => {
    if (!mp3) return;
    if (!simpleSymbols) return;
    setScriptContext({
      ...scriptContext,
      isDone: true,
    });
  }, [simpleSymbols]);

  // 서버 피드백 dummy data
  const correction = {
    PAUSE_TOO_LONG: new Set([58, 119]),
    PAUSE_TOO_SHORT: new Set([25]),
  };
  const LPM = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -2, -1, -1, -1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -2, -2, -2, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2,
    2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
  ];

  const wordRef = useRef([]);

  // 편집 기능
  const [dragging, setDragging] = useState(false);

  const [waveFormLoaded, setWaveFormLoaded] = useState(false);
  const [waveSurferInstance, setWaveSurferInstance] = useState(null);

  const clickWord = useCallback(
    (e) => {
      if (!waveFormLoaded) return;
      const selectedWordIdx = e.currentTarget.id; // 클릭된 단어 인덱스

      switch (scriptContext.cursor) {
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
          dispatch({
            type: "ADD",
            symbol: scriptContext.cursor,
            idx: selectedWordIdx,
          });
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
      scriptContext.cursor,
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
        pixelRatio: 5, // 레티나 디스플레이에서 더 높은 해상도를 위해 사용
        // backend: "WebAudio",
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
        console.log("✅ waveform ready");
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
        console.log("✅ remove click event listener");
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

  const createSpeech = useCallback(() => {
    navigate(`/presentation/practice`);
  }, [navigate]);

  const statistics = {
    hertz: 150,
    lpm: 300,
    pause: 20,
  };

  return (
    <Container
      onMouseUp={() => {
        // 드래그 중 영역을 벗어나서 마우스를 떼도 드래그 중지
        setDragging(false);
      }}
    >
      <Screen>
        {scriptContext.isDone ? (
          <TextArea>
            <p>
              {text.map((word, i) => (
                <span key={i}>
                  <Symbol>
                    {simpleSymbols[i].includes("ENTER") && <br />}
                    {correction.PAUSE_TOO_LONG &&
                      correction.PAUSE_TOO_LONG.has(i - 1) && (
                        <img
                          src={correctionIcons[0].src}
                          alt="pause too long"
                          className="correction pause_too_long"
                        />
                      )}
                    {correction.PAUSE_TOO_SHORT &&
                      correction.PAUSE_TOO_SHORT.has(i - 1) && (
                        <img
                          src={correctionIcons[1].src}
                          alt="pause too short"
                          className="correction pause_too_short"
                        />
                      )}
                  </Symbol>
                  <span
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                    }}
                  >
                    <CorrectionLine
                      $status={LPM[i] > 0 ? "fast" : LPM[i] < 0 ? "slow" : null}
                      $opacity={
                        LPM[i] > 0
                          ? LPM[i] / 2
                          : LPM[i] < 0
                          ? -(LPM[i] / 2)
                          : null
                      }
                    >
                      &nbsp;
                    </CorrectionLine>
                    <Highlight
                      $color={highlighted[i]}
                      $continued={highlighted[i] === highlighted[i + 1] ? 1 : 0}
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
                            contentEditable={scriptContext.cursor === "EDIT"} // 현재 커서가 수정펜일 때만 수정 모드
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
            <h1>열심히 분석 중입니다.</h1>
          </>
        )}
      </Screen>
      <WaveContainer>
        {scriptContext.isDone ? (
          waveFormLoaded ? null : (
            <div className="text">클릭하여 편집을 시작하세요</div>
          )
        ) : (
          <div className="text">analyzing...</div>
        )}
        <WaveWrapper
          ref={wavesurferRef}
          $ready={scriptContext.isDone && waveFormLoaded ? 1 : 0}
        />
      </WaveContainer>
      <PC>
        <ScriptBarWrap>
          {scriptContext.isDone ? (
            <ul className="btn-wrap activate">
              <li>
                <FilledBtn text={"코치 연결하기"} />
                <FilledBtn text={"연습 시작하기"} onClick={createSpeech} />
              </li>
              <li>
                <PlayBtn variant="contained" ref={playButton}>
                  {playing ? <PauseIcon /> : <PlayArrowIcon />}
                </PlayBtn>
                <PlayBtn variant="contained" onClick={onReset}>
                  <RestartAltIcon />
                </PlayBtn>
              </li>
              <li>
                <StatisticsModal statistics={statistics} />
                <AiFeedbackModal />
              </li>
            </ul>
          ) : (
            <ul className="btn-wrap">
              <li>
                <FilledBtn text={"코치 연결하기"} state={"disabled"} />
                <FilledBtn text={"연습 시작하기"} state={"disabled"} />
              </li>
              <li>
                <PlayBtn variant="contained" disabled>
                  <PlayArrowIcon />
                </PlayBtn>
                <PlayBtn variant="contained" disabled>
                  <RestartAltIcon />
                </PlayBtn>
              </li>
              <li>
                <FilledBtn text={" 통계보기 "} state={"disabled"} />
                <FilledBtn text={" AI 피드백 "} state={"disabled"} />
              </li>
            </ul>
          )}
        </ScriptBarWrap>
      </PC>
    </Container>
  );
};

const Container = styled(Box)`
  /* width: 100%; */
  width: 80vw;
  height: 80vh;
  margin: 13rem 10rem 0 5rem;
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

const CorrectionLine = styled.span`
  line-height: 100%;
  background-color: ${(props) =>
    props.$status === "fast"
      ? "#D71313"
      : props.$status === "slow"
      ? "#0D1282"
      : "transparent"};
  opacity: ${(props) => props.$opacity};
  font-size: 1rem;
  font-weight: bold;
  color: white;
`;

const Symbol = styled.span`
  /* margin: auto; */
  height: 3rem;
  vertical-align: bottom;
  padding-bottom: 1rem;
  .correction {
    width: 2.5rem;
    /* margin-left: -5px; */
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
    li {
      display: flex;
      align-items: center;
    }
    button {
      font-size: 1.6rem;
      padding: 1rem 3rem;
      margin-right: 2rem;
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
  /* animation-duration: 0.27s; */
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

export default Script;
