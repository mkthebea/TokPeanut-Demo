import React, { useCallback, useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import { createTheme, Dialog, ThemeProvider } from "@mui/material";
import styled from "@emotion/styled";
import FilledBtn from "../button/FilledBtn";
import { IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import theme from "../../style/theme";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export default function AiFeedbackModal() {
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

  const theme2 = useTheme();
  const fullScreen = useMediaQuery(theme2.breakpoints.down("md"));

  const [aiDone, setAiDone] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      messageRef.current.scrollIntoView(); // 스크롤 효과 없이 바로 맨 아래로
    }, 1);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [data, setData] = useState([
    {
      prompt: "Open AI API와 연동된 AI 챗봇 기능입니다.",
      result:
        "AI 챗봇 기능으로 스크립트의 내용 대한 피드백을 받을 수 있습니다.",
    },
  ]);

  useEffect(() => {
    setAiDone(true);
  }, []);

  const createExampleAnswer = useCallback(
    (prompt) => {
      setTimeout(() => {
        const tem = {
          prompt: prompt,
          result:
            "현재 데모 버전을 이용중으로, AI 챗봇 기능은 동작하지 않습니다.",
        };
        setData([...data, tem]);
      }, 2000);
    },
    [data]
  );

  const newCheckPoint = useCallback(
    (e) => {
      e.preventDefault();
      const newPrompt = e.target[0].value;
      e.target[0].value = "";
      const tem = {
        prompt: newPrompt,
        result: "waiting",
      };
      setData([...data, tem]);
      createExampleAnswer(newPrompt);
    },
    [data, createExampleAnswer]
  );

  const messageRef = useRef(null);
  // 채팅창 스크롤 맨 아래로
  const scrollDown = useCallback(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messageRef]);

  useEffect(() => {
    scrollDown();
  }, [data, scrollDown]);

  return (
    <ThemeProvider theme={theme}>
      <FilledBtn text={"AI 피드백"} onClick={handleOpen} />
      <AiFeedbackModalWrap
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <ModalWrap>
          <div className="title">
            <h2>AI 논리 피드백</h2>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className="message-wrap">
            {aiDone ? (
              <>
                <div className="msg">
                  {data.map((item, i) => (
                    <div key={i}>
                      <div className="me-msg">
                        <h3>
                          {item.prompt.split("\n").map((t) => (
                            <p key={t}>{t}</p>
                          ))}
                        </h3>
                      </div>
                      <div className="ai-msg">
                        <div className="profile">
                          <SmartToyIcon />
                        </div>
                        <h3>
                          {item.result === "waiting" ? (
                            <CircularProgress color="inherit" size={30} />
                          ) : (
                            item.result
                              .split("\n")
                              .map((t) => <p key={t}>{t}</p>)
                          )}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messageRef}></div>
              </>
            ) : (
              <div id="ai_not_done">
                <CircularProgress color="inherit" size={60} />
                <div ref={messageRef}>잠시만 기다려 주세요...</div>
              </div>
            )}
          </div>

          <form onSubmit={newCheckPoint}>
            <div className="text-input">
              <div className="padding">
                <StyledTextField
                  id="outlined-basic"
                  variant="outlined"
                  placeholder="새 요구사항 입력창"
                  multiline
                  maxRows={1}
                />
                <Button variant="contained" type="submit" disabled={!aiDone}>
                  다시 입력
                </Button>
              </div>
            </div>
          </form>
        </ModalWrap>
      </AiFeedbackModalWrap>
    </ThemeProvider>
  );
}

const AiFeedbackModalWrap = styled(Dialog)`
  .MuiPaper-root {
    width: 60rem;
  }
  @media ${() => theme.device.mobile} {
    .MuiPaper-root {
      width: 100%;
    }
  }
`;

const ModalWrap = styled(Box)`
  overflow-y: hidden;
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4rem 4rem 2rem 4rem;
    h2 {
      font-size: 2rem;
      color: #3b3b3b;
      font-weight: 600;
      line-height: 150%;
    }
    button {
      svg {
        width: 2rem;
        height: 2rem;
      }
    }
  }
  .message-wrap {
    background-color: #fafafa;
    padding: 4rem 0 3rem 0;
    /* max-height: 48rem; */
    height: 48rem;
    overflow-y: scroll;
    vertical-align: bottom;
    #ai_not_done {
      height: 48rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #ff7134;
      div {
        text-align: center;
        margin-top: 2rem;
        font-size: 1.5rem;
      }
    }
    .msg {
      width: 100%;
      h3 {
        width: fit-content;
        max-width: 50rem;
        font-size: 1.6rem;
        color: #3b3b3b;
        line-height: 150%;
        font-weight: 600;
        padding: 1rem 2rem;
        word-break: keep-all;
      }
      .me-msg {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 0 4rem 1rem 4rem;
        h3 {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          background-color: #ffeee0;
        }
      }
      .ai-msg {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 0 4rem 1rem 4rem;
        h3 {
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-top-right-radius: 10px;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        svg {
          width: 3rem;
          height: 3rem;
          color: #ff7134;
          margin-right: 1rem;
        }
      }
    }
  }
  .text-input {
    background-color: #fff;
    box-shadow: 0 4px 5px 5px rgba(0, 0, 0, 0.05);
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;

    .padding {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2rem;
    }
    button {
      color: #fff;
      font-size: 1.6rem;
      box-shadow: none;
      width: 30%;
      padding: 1.1rem 2rem;
    }
  }
  @media ${() => theme.device.mobile} {
    .message-wrap {
      height: 80vh;
      max-height: 80vh;
    }
    .text-input {
      position: sticky;
      bottom: 0;
    }
  }
`;

const StyledTextField = styled(TextField)`
  width: 68%;
  textarea {
    font-size: 1.6rem;
    height: 1rem;
  }
`;
