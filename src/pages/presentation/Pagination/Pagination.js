import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { Box, IconButton, Button } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import theme from "../../../style/theme";
const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Pagination = () => {
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

  // dummy data
  const [speechList, setSpeechList] = useState([
    {
      id: 1,
      createdDate: "2024-02-27",
      recordDone: true,
      bookmarked: true,
    },
    {
      id: 2,
      createdDate: "2024-03-11",
      recordDone: true,
      bookmarked: false,
    },
    {
      id: 3,
      createdDate: "2024-03-14",
      recordDone: false,
      bookmarked: true,
    },
  ]);

  const patchBookmark = useCallback(
    (e, selectedSpeechId) => {
      e.stopPropagation();
      const isBookmarked = e.target.checked;
      setSpeechList(
        speechList.map((s) =>
          s.id === selectedSpeechId ? { ...s, bookmarked: isBookmarked } : s
        )
      );
    },
    [speechList]
  );

  const [selectedSpeech, setSelectedSpeech] = useState(1);

  return (
    <>
      <ThemeProvider theme={theme}>
        <PageBtnWrap>
          <ul>
            {speechList.map((speech, i) => (
              <li
                className={speech.id === selectedSpeech ? "select" : ""}
                key={speech.id}
              >
                <Button onClick={() => setSelectedSpeech(speech.id)}>
                  <div>Sp {i + 1}</div>
                  <div className="sub">{speech.createdDate}</div>
                </Button>
                <Checkbox
                  {...label}
                  icon={<StarBorderIcon />}
                  checkedIcon={<StarIcon />}
                  checked={speech.bookmarked}
                  onClick={(e) => patchBookmark(e, speech.id)}
                />
              </li>
            ))}
          </ul>
        </PageBtnWrap>
      </ThemeProvider>
    </>
  );
};

const PageBtnWrap = styled(Box)`
  width: 10rem;
  /* border: 1px solid red; */
  position: sticky;
  top: 0;
  right: 3%;
  ul {
    max-height: 80vh;
    overflow: hidden auto;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin-top: 13rem;
    &::-webkit-scrollbar {
      display: none;
    }
    .select {
      button {
        background-color: #ffeee0;
        color: #ff7134;
      }
    }
    li:last-of-type {
      border: none;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 10rem;
      height: 10rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      button {
        display: flex;
        flex-direction: column;
        /* align-items: flex-start; */
        /* padding-left: 1.5rem; */
        width: 100%;
        font-size: 2rem;
        color: #3b3b3b;
        height: 100%;
        box-shadow: none;
        border-radius: 0;
        .sub {
          font-size: 1.5rem;
          color: #a5a5a5;
        }
      }
      span {
        position: absolute;
        top: 0;
        right: 0;
        svg {
          width: 2rem;
          height: 2rem;
        }
      }
    }
  }

  @media ${() => theme.device.mobile} {
    width: 100%;
    position: static;
    margin-bottom: 3rem;
    ul {
      display: flex;
      align-items: center;
      overflow-y: auto;
      overflow-x: hidden;
      margin-top: 10rem;
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */
      li {
        border-bottom: none;
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        height: 6rem;
        width: 8rem;
        button {
          font-size: 2rem;
        }
        span {
          svg {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
      }
    }
    ul::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera*/
    }
  }
`;

export default Pagination;
