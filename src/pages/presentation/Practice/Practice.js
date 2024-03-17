import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import MicrophonePlugin from "wavesurfer.js/dist/plugin/wavesurfer.microphone.min.js";
import qs from "qs";

import styled from "@emotion/styled";
import { createGlobalStyle } from "styled-components";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { Box, IconButton, Button } from "@mui/material";
import Nav from "../../../component/layout/Nav";

import theme from "../../../style/theme";
import TextField from "@mui/material/TextField";

import FilledBtn from "../../../component/button/FilledBtn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SolideBtn from "../../../component/button/SolidBtn";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import api from "../../../api";

const Practice = ({ isNew }) => {
  const theme = createTheme({
    typography: {
      fontFamily: "Pretendard",
    },
    palette: {
      primary: {
        main: "#FF7134",
      },
    },
  });

  const navigate = useNavigate();

  // dummy data
  const simpleSymbols = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    ["MOUSE"],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
  ];
  const highlighted = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "rgba(255,255,204)",
    "rgba(255,255,204)",
    "",
    "",
  ];
  const edited = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
  const LPM = [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const correction = {
    PAUSE_TOO_LONG: new Set([5]),
    PAUSE_TOO_SHORT: new Set([]),
  };
  const text = [
    "사용자가",
    "이전에",
    "생성한",
    "스크립트가",
    "있다면,",
    "이렇게",
    "서버의",
    "피드백과",
    "사용자",
    "기호가",
    "적용된",
    "맞춤형",
    "스크립트를",
    "기반으로",
    "반복",
    "연습을",
    "할",
    "수",
    "있습니다.",
  ];

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

  const correctionIcons = [
    { name: "휴지 긺", src: "/img/script/space_long.svg" },
    { name: "휴지 짧음", src: "/img/script/space_short.svg" },
  ];

  // 실시간 파형
  const waveformRef = useRef(null);
  const [waveSurferInstance, setWaveSurferInstance] = useState(null);
  const [micReady, setMicReady] = useState(false);

  // 파형 초기화  및 마이크 준비
  useEffect(() => {
    let wavesurfer = null;
    const initWaveSurfer = () => {
      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ff7134",
        hideScrollbar: true,
        // progressColor: "red",
        barWidth: 3,
        barHeight: 5,
        interact: false,
        cursorWidth: 0,
        height: 64,
        plugins: [MicrophonePlugin.create()],
      });
      setWaveSurferInstance(wavesurfer);
      if (wavesurfer) {
        wavesurfer.microphone.start();
        setMicReady(true);
      }
    };

    // 사용자 입력으로 파형 생성
    const handleUserGesture = () => {
      if (!wavesurfer) {
        initWaveSurfer();
        wavesurfer.microphone.pause();
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

      if (recording) {
        setRecording(false);
        // mediaRecorderRef.current.stop();
        const mediaRecorder = mediaRecorderRef.current;
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }

        // STT 중단
        SpeechRecognition.stopListening();
        console.log("❗️오디오 스트림 강제 중단");
      }
    };
  }, []);

  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const segmentRef = useRef([]); // 모든 blob 저장
  let wavList = []; // 단위 시간당 생성된 wav 파일

  const startRecording = async () => {
    // 녹음
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
        mimeType: "audio/webm",
      }); // 마이크 권한 획득
      console.log("마이크 권한 획득 성공:", stream);
    } catch (err) {
      console.log("마이크 권한 획득 실패:", err);
    }

    setRecording(true);
    // 미디어 레코더 생성
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    // 음성이 잘라질 때마다
    mediaRecorder.ondataavailable = async (e) => {
      // 현재 blob을 전체 blob 리스트에 저장
      segmentRef.current.push(e.data);
    };

    // 3초마다 자르도록
    mediaRecorder.start(3000);

    // STT 시작
    SpeechRecognition.startListening({
      continuous: true,
      language: "ko",
    });

    // 파형 시작
    waveSurferInstance.microphone.play();
    setRecording(true);
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    mediaRecorder.onstop = () => {
      // console.log("segments: ", segmentRef.current);
    };
    if (recording) {
      setRecording(false);
      mediaRecorder.stop();
    }
    // combineToAudio(); // 지금까지의 세그먼트들을 하나로 합쳐서 재생 가능하게 만들기

    // STT 중단
    SpeechRecognition.stopListening();

    // 파형 일시정지
    waveSurferInstance.microphone.pause();
  };

  // 전달된 blob을 webm 파일로 변환
  const convertWav = async (segments) => {
    const combinedBlob = new Blob([segments], { type: "audio/webm" });
    wavList.push(combinedBlob);
    return combinedBlob;
  };

  // 전체 녹음 파일 재생 가능하도록 합치고 재생
  const play = () => {
    const segments = segmentRef.current;
    const audioElement = document.querySelector("#audio");
    // console.log("segments: ", segments);
    const combinedBlob = new Blob(segments, { type: "audio/webm" }); // 지금까지의 음성 데이터
    let audioUrl = URL.createObjectURL(combinedBlob);
    audioElement.src = audioUrl;
    if (audioUrl) {
      setPlaying(true);
      audioElement.play();
    }
    audioElement.onended = (event) => {
      setPlaying(false);
    };
  };

  const pausePlaying = () => {
    const audioElement = document.querySelector("#audio");
    audioElement.pause();
    setPlaying(false);
  };

  // STT
  const {
    transcript,
    // listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return (
      <span>
        사용 중인 브라우저가 음성 인식을 지원하지 않습니다. 서버의 음성 인식 및
        분석은 정상적으로 동작합니다.
      </span>
    );
  } else {
    // console.log("Browser supports speech recognition.");
  }

  // 녹음 완료 요청 후 분석 페이지로 이동
  const finishRecording = async () => {
    stopRecording();
    // 녹음 완료 확인
    if (!window.confirm("녹음을 완료하시겠습니까?")) return;
    navigate(`/presentation/speech`);
  };

  // 녹음 취소 (만들어진 스피치 삭제)
  const cancelRecording = async () => {
    if (mediaRecorderRef.current && recording) {
      stopRecording();
    }
    // 녹음 취소 확인
    if (!window.confirm("녹음을 취소하시겠습니까?")) return;
    navigate(`/presentation/summary`);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Nav />
        <Container>
          <Script>
            <Screen>
              {isNew ? (
                <TextArea>
                  <div className="text-wrap">
                    <p>
                      준비된 스크립트가 없습니다. <br /> 새로 녹음하여
                      스크립트를 생성하고, 맞춤형 스크립트로 반복 연습하세요.
                    </p>
                    <STTField>{transcript}</STTField>
                    <span className="stt-text">
                      * 이 텍스트 인식 결과는 스피치 진행 정도를 체크하기 위한
                      것으로, 실제 분석은 더 정확한 데이터로 이루어 질
                      예정입니다.
                    </span>
                  </div>
                </TextArea>
              ) : (
                <TextArea>
                  <div className="text-wrap">
                    <p>
                      {text.map((word, i) => (
                        <span key={i}>
                          <Symbol>
                            {simpleSymbols[i].includes("ENTER") && (
                              <>
                                <br />
                              </>
                            )}

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
                              $status={
                                LPM[i] > 0 ? "fast" : LPM[i] < 0 ? "slow" : null
                              }
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
                            <Text
                              color={highlighted[i]}
                              $continued={
                                highlighted[i] === highlighted[i + 1] ? 1 : 0
                              }
                              key={i}
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
                              {edited[i] ? edited[i] : word}
                            </Text>
                          </span>
                        </span>
                      ))}
                    </p>
                    <STTField>{transcript}</STTField>
                    <span className="stt-text">
                      * 이 텍스트 인식 결과는 스피치 진행 정도를 체크하기 위한
                      것으로, 실제 분석은 더 정확한 데이터로 이루어 질
                      예정입니다.
                    </span>
                  </div>
                </TextArea>
              )}

              <div className="sound-wave">
                {recording ? null : <WaveCover>녹음을 시작해 보세요</WaveCover>}
                <WaveContainer ref={waveformRef} />
              </div>
            </Screen>
            {/* 재생 바 */}
            <PC>
              <ScriptBarWrap>
                <ul className="btn-wrap">
                  <li>
                    <SolideBtn
                      text={"취소하기"}
                      color={"white"}
                      onClick={cancelRecording}
                      disabled={recording}
                    />
                  </li>
                  <li>
                    {playing ? (
                      <PlayBtn variant="contained" onClick={pausePlaying}>
                        <StopIcon />
                      </PlayBtn>
                    ) : (
                      <PlayBtn
                        variant="contained"
                        onClick={play}
                        disabled={recording || segmentRef.current.length === 0}
                      >
                        <PlayArrowIcon />
                      </PlayBtn>
                    )}

                    {recording ? (
                      <PlayBtn variant="contained" onClick={stopRecording}>
                        <PauseIcon />
                      </PlayBtn>
                    ) : (
                      <PlayBtn
                        variant="contained"
                        onClick={startRecording}
                        disabled={!micReady}
                      >
                        <KeyboardVoiceIcon />
                      </PlayBtn>
                    )}
                  </li>
                  <li>
                    <FilledBtn
                      text={"완료하기"}
                      onClick={finishRecording}
                      disabled={recording}
                    />
                  </li>
                </ul>
                <audio id="audio" />
              </ScriptBarWrap>
            </PC>
            <Mobile>
              <ScriptBarWrap>
                <ul className="btn-wrap">
                  <li>
                    {playing ? (
                      <PlayBtn variant="contained" onClick={pausePlaying}>
                        <StopIcon />
                      </PlayBtn>
                    ) : (
                      <PlayBtn
                        variant="contained"
                        onClick={play}
                        disabled={recording || segmentRef.current.length === 0}
                      >
                        <PlayArrowIcon />
                      </PlayBtn>
                    )}
                    {recording ? (
                      <PlayBtn variant="contained" onClick={stopRecording}>
                        <PauseIcon />
                      </PlayBtn>
                    ) : (
                      <PlayBtn
                        variant="contained"
                        onClick={startRecording}
                        disabled={!micReady}
                      >
                        <KeyboardVoiceIcon />
                      </PlayBtn>
                    )}
                  </li>
                  <li>
                    <SolideBtn
                      text={"취소하기"}
                      color={"white"}
                      onClick={cancelRecording}
                    />
                    <FilledBtn text={"완료하기"} onClick={finishRecording} />
                  </li>
                </ul>
              </ScriptBarWrap>
            </Mobile>
          </Script>
        </Container>
      </ThemeProvider>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
    body{
        background-color: #FAFAFA;
    }
`;
const Container = styled(Box)`
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

const Script = styled(Box)`
  width: 90%;
  height: 80vh;

  margin: 13rem auto 0 auto;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  @media ${() => theme.device.desktop} {
  }
  @media ${() => theme.device.mobile} {
    width: 100%;
    margin-top: 10rem;
    height: auto;
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

  .sound-wave {
    margin-bottom: 3rem;
    width: 100%;
    /* width: 300px; */
    display: flex;
    align-items: center;
    justify-content: center;
    /* height: 64px; */
    /* img {
      width: 40%;
    } */
  }
  @media ${() => theme.device.desktop2} {
  }
  @media ${() => theme.device.mobile} {
    .sound-wave {
      img {
        width: 80%;
      }
    }
  }
`;

const TextArea = styled(Box)`
  width: 100%;
  .text-wrap {
    padding: 3rem;
  }
  p {
    height: fit-content;
    height: 250px;
    max-height: 250px;
    overflow-y: scroll;
    padding: 3rem;
    background-color: #f5f5f5;
    font-size: 2rem;
    line-height: 200%;
    color: #3b3b3b;
    margin-bottom: 2rem;
    img {
      width: 1.5rem;
      height: 1.5rem;
      margin: 0 0.5rem 0 0.5rem;
      filter: invert(43%) sepia(98%) saturate(401%) hue-rotate(346deg)
        brightness(101%) contrast(88%);
    }
  }

  .stt-text {
    font-size: 1.4rem;
    color: #f38025;
    font-weight: 400;
    line-height: 150%;
    margin-top: 1rem;
    display: inline-block;
  }

  @media ${() => theme.device.mobile} {
    p {
      height: auto;
      font-size: 1.8rem;
    }
  }
`;

const STTField = styled.div`
  padding: 3rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  font-size: 1.6rem;
  color: #3b3b3b;
  line-height: 150%;
  /* width: 100%; */
  height: 6rem;
  overflow-y: scroll;
`;

// const StyledTextField = styled(TextField)`
//   textarea {
//     font-size: 1.6rem;
//     color: #3b3b3b;
//     line-height: 150%;
//   }
// `;

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
  .btn-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0 3rem;
    button {
      font-size: 1.6rem;
      padding: 1rem 3rem;
      margin-right: 2rem;
      svg {
        color: #ff7134 !important;
      }
    }
    button:last-of-type {
      margin: 0;
    }
    .Mui-disabled {
      background-color: #e0e0e0;
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
    .btn-wrap {
      justify-content: center;
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
    svg {
      width: 3rem;
      height: 3rem;
    }
  }
`;

const Symbol = styled.span`
  /* margin: auto; */
  height: 3rem;
  vertical-align: bottom;
  padding-bottom: 1rem;
  /* img {
    margin-top: 2rem;
  } */
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

// 실시간 파형
export const WaveContainer = styled.div`
  /* width: 300px; */
  width: 50%;
  height: 5rem;
  border: 3px 0 0 0 solid grey;
  /* border-radius: 50px; */
  padding: 20px 10px 20px 10px;
`;
// 파형 덮개
export const WaveCover = styled.div`
  position: absolute;
  width: 50%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #3b3b3b;
  font-size: 2rem;
  z-index: 100;
  padding: 20px 10px 20px 10px;
`;
// 스트립트의 단어
export const Text = styled.span`
  /* color: black; */
  background-color: ${(props) => props.color};
  margin-right: ${(props) => (props.$continued ? "none" : "5px")};
  padding-right: ${(props) => (props.$continued ? "5px" : "none")};
  text-decoration: ${(props) => (props.$edited ? "underline" : "none")};
  &:hover {
    /* text-decoration: orange dashed underline; */
    font-weight: bold;
    cursor: pointer;
  }
`;

export default Practice;
