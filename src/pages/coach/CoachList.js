import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { Box, IconButton, Button, Grid } from "@mui/material";
import Nav from "../../component/layout/Nav";

import theme from "../../style/theme";
import TextField from "@mui/material/TextField";
import PaginationBox from "../../component/pagination/Pagination";
import SearchIcon from "@mui/icons-material/Search";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CoachCard from "../../component/card/CoachCard";

import Pagination from "@mui/material/Pagination";

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const CoachList = () => {
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

  const [select, setSelect] = React.useState("10");

  const handleChange = (event) => {
    setSelect(event.target.value);
  };

  // dummy data
  const coachList = [
    {
      nickname: "Alice",
      career: "3년",
      language: "면접",
      price: "30,000",
      img: "/img/coach1.png",
      uuid: 1,
      shortIntroduce: "안녕하세요. Alice입니다.",
    },
    {
      nickname: "Bob",
      career: "2년",
      language: "발표",
      price: "30,000",
      img: "/img/coach2.png",
      uuid: 2,
      shortIntroduce: "발표 준비에 강한 Bob입니다.",
    },
    {
      nickname: "Carol",
      career: "5년",
      language: "학술 발표",
      price: "30,000",
      img: "/img/coach3.png",
      uuid: 3,
      shortIntroduce: "안녕하세요. Carol입니다.",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Nav />
      <Banner>
        <Container>
          <div className="text-wrap">
            <h4>coach list</h4>
            <h1>코치 리스트</h1>
            <p>더 전문적인 피드백을 위해 스피치 코치를 만나보세요.</p>
          </div>
        </Container>
      </Banner>
      <Container>
        <SearchBar>
          <StyledTextField
            id="search"
            variant="outlined"
            type="text"
            placeholder="검색어를 입력하세요"
            fullWidth
          />
          <Button variant="contained">
            <SearchIcon />
            검색
          </Button>
        </SearchBar>
        <SelectWrap>
          <h3>
            <strong>{coachList.length}명 </strong>코치
          </h3>
        </SelectWrap>
        <Grid container spacing={1}>
          {coachList.map((coach, i) => (
            <Card item xs={6} md={4} key={coach.nickname}>
              <Item>
                <CoachCard profile={coach} n={i + 1} />
              </Item>
            </Card>
          ))}
        </Grid>
        <PaginationBox />
      </Container>
    </ThemeProvider>
  );
};

const Container = styled(Box)`
  width: 118rem;
  margin: 0 auto;
  padding-bottom: 10rem;
  @media ${() => theme.device.desktop} {
    width: 90%;
  }
`;

const Banner = styled(Box)`
  width: 100%;
  height: 30rem;
  margin-top: 5rem;
  background-color: #fff8f3;
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

const SearchBar = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 3rem 0;
  button {
    box-shadow: none;
    color: #fff;
    padding: 1rem 2rem;
    width: 20rem;
    font-size: 1.6rem;
    margin-left: 1rem;
    svg {
      width: 2rem;
      height: 2rem;
      margin-right: 1rem;
    }
  }
`;

const SelectWrap = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  h3 {
    font-size: 1.8rem;
    color: #3b3b3b;
    line-height: 150%;
    strong {
      font-weight: bold;
    }
  }
`;

const StyledTextField = styled(TextField)`
  input {
    font-size: 1.6rem;
    color: #3b3b3b;
    padding: 1.2rem 2rem;
  }
`;
const StyledSelect = styled(Select)`
  font-size: 1.4rem;
`;

const StyledMenuItem = styled(MenuItem)`
  font-size: 1.4rem;
`;
const Card = styled(Grid)``;

const PaginationWrap = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 5rem;
`;

const StyledPagination = styled(Pagination)`
  button {
    font-size: 1.4rem;
  }
  .Mui-selected {
    color: #fff !important;
  }
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

export default CoachList;
