import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import {
  Box,
  IconButton,
  Button,
  FormControlLabel,
  Switch,
  Grow,
} from "@mui/material";
import Nav from "../../../component/layout/Nav";

import theme from "../../../style/theme";
import SolidBtn from "../../../component/button/SolidBtn";

import FolderDeleteIcon from "@mui/icons-material/FolderDelete";

const PresentationList = () => {
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
  const [presentationList, setPresentationList] = useState([]);

  // dummy data
  useEffect(() => {
    setPresentationList([
      {
        id: 1,
        title: "(주)쿠키 면접 연습",
        outline: "차분하게 기술적인 내용을 설명하는 연습",
        createdDate: "2024-03-14",
      },
      {
        id: 2,
        title: "소프트웨어 프로그래밍 팀 프로젝트 발표",
        outline: "팀 프로젝트 발표",
        createdDate: "2023-09-11",
      },
      {
        id: 3,
        title: "산업보안관리 발표",
        outline: "논문 연구에 대한 발표",
        createdDate: "202-10-10",
      },
    ]);
  }, []);

  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const navigateToPresentation = useCallback(() => {
    if (editMode) return;
    navigate(`/presentation/summary`);
  }, [editMode, navigate]);

  const handleDelete = useCallback(
    (e, presentation_id) => {
      e.stopPropagation();
      if (window.confirm("해당 프레젠테이션을 삭제하시겠습니까?")) {
        setPresentationList(
          presentationList.filter((p) => p.id !== presentation_id)
        );
      } else {
        alert("삭제가 취소되었습니다.");
      }
    },
    [presentationList]
  );

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <Banner>
        <Container>
          <div className="text-wrap">
            <h4>presentation list</h4>
            <h1>모든 발표 준비를 한 번에</h1>
            <p>여러 번 연습하고 피드백을 받으며 말하기 실력을 키워요.</p>
          </div>
        </Container>
      </Banner>
      <Container>
        <ListWrap>
          <Guide>
            <div className="new-btn">
              <Link to="/presentation/new">
                <SolidBtn text={"새 프레젠테이션"}></SolidBtn>
              </Link>
            </div>
            <div id="edit">
              <div id="edit_text"> 편집 모드 </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode}
                    onChange={() => setEditMode(!editMode)}
                  />
                }
              />
            </div>
          </Guide>
          <ul className="list-wrap">
            {presentationList.map((p) => (
              <li key={p.id}>
                <ListBox
                  variant="outlined"
                  onClick={() => navigateToPresentation()}
                  editmode={editMode ? 1 : 0}
                >
                  <div className="name">
                    <h3>{p.outline}</h3>
                    <h2>{p.title}</h2>
                  </div>
                  <span>
                    {p.createdDate}
                    <Grow
                      in={editMode}
                      {...(editMode ? { timeout: 700 } : {})}
                      className="delete"
                    >
                      {
                        <FolderDeleteIcon
                          onClick={(e) => handleDelete(e, p.id)}
                          className="delete"
                        />
                      }
                    </Grow>
                  </span>
                </ListBox>
              </li>
            ))}
          </ul>
        </ListWrap>
      </Container>
    </ThemeProvider>
  );
};

const Container = styled(Box)`
  width: 118rem;
  margin: 0 auto;
  @media ${() => theme.device.desktop} {
    width: 90%;
  }
`;

const Banner = styled(Box)`
  width: 100%;
  height: 30rem;
  margin-top: 5rem;
  background-color: #fff8f3;
  /* background-image: url(../img/banner.png); */
  background-position: center;
  background-size: cover;
  .text-wrap {
    height: 30rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    h4 {
      font-size: 1.4rem;
      color: #ff7134;
      font-weight: bold;
      line-height: 150%;
    }
    h1 {
      font-size: 3rem;
      color: #3b3b3b;
      line-height: 150%;
      font-weight: bold;
    }
    p {
      font-size: 1.6rem;
      color: #3b3b3b;
      line-height: 150%;
      margin-top: 1rem;
    }
  }
  @media ${() => theme.device.tablet} {
    margin-top: 6rem;
  }
  @media ${() => theme.device.mobile} {
    .text-wrap {
      h1 {
        font-size: 2.5rem;
      }
    }
  }
`;

const ListWrap = styled(Box)`
  padding-bottom: 10rem;
  .new-btn {
    button {
      margin-top: 5rem;
      font-size: 1.6rem;
    }
  }
  .list-wrap {
    margin-top: 3rem;
    li {
      margin-bottom: 1rem;
    }
    li:last-of-type {
      margin: 0;
    }
  }
  #edit {
    display: flex;
    align-items: center;
    /* justify-content: space-between; */
    cursor: pointer;
    font-size: 1.4rem;
    color: gray;
    margin-top: 5rem;
    margin-right: 0.7rem;
    font-weight: 500;
    &:hover {
      color: #ff7134;
    }
    #edit_text {
      margin-right: 1rem;
    }
  }
  @media ${() => theme.device.mobile} {
    padding-bottom: 5rem;
  }
`;

const ListBox = styled(Button)`
  border-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem;
  &:hover {
    background-color: ${(props) => !props.editmode && "#ff7134"};
    .name {
      h3 {
        color: ${(props) => (props.editmode ? "rgba(0, 0, 0, 0.2)" : "#fff")};
      }
      h2 {
        color: ${(props) => (props.editmode ? "rgba(0, 0, 0, 0.2)" : "#fff")};
      }
    }
    span {
      color: ${(props) => (props.editmode ? "rgba(0, 0, 0, 0.2)" : "#fff")};
    }
  }

  .name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    h3 {
      font-size: 1.6rem;
      color: #3b3b3b;
      line-height: 150%;
      font-weight: 400;
    }
    h2 {
      font-size: 2.5rem;
      color: #3b3b3b;
      line-height: 150%;
      font-weight: bold;
    }
  }
  span {
    display: flex;
    align-items: center;
    font-size: 1.6rem;
    color: rgba(0, 0, 0, 0.6);
    line-height: 150%;
    font-weight: 400;
    .delete {
      cursor: pointer;
      height: 3rem;
      width: 3rem;
      margin-left: 2rem;
      &:hover {
        color: #ff7134;
      }
    }
  }
  @media ${() => theme.device.mobile} {
    padding: 3rem;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    .name {
      h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
    }
  }
`;

const Guide = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 5rem;
  background-color: #fff;
  z-index: 100;
  padding: 2rem 0;
  border-bottom: rgba(0, 0, 0, 0.1) 1px solid;
`;

export default PresentationList;
