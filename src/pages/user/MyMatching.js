// 일반 사용자 의뢰 리스트
import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { Box, IconButton, Button, Grid } from "@mui/material";
import Nav from "../../component/layout/Nav";
import theme from "../../style/theme";
import RequestCardUser from "../../component/card/RequestCardUser";
import PaginationBox from "../../component/pagination/Pagination";

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const MyMatching = () => {
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

  const requestList = [
    {
      id: 1,
      title: "면접 연습",
      coachNickname: "Alice",
      status: "REQUESTED",
    },
    {
      id: 2,
      title: "발표 연습",
      coachNickname: "Bob",
      status: "ACCEPTED",
    },
    {
      id: 3,
      title: "토론 연습",
      coachNickname: "Carol",
      status: "DENIED",
    },
    {
      id: 4,
      title: "토론 연습",
      coachNickname: "David",
      status: "DONE",
    },
  ];

  return (
    <>
      <ThemeProvider theme={theme}>
        <Nav />
        <Container>
          <div className="title">
            <h1>내 의뢰</h1>
          </div>
          <RequestListWrap>
            <Grid container spacing={1}>
              {requestList.map((request) => (
                <Card item xs={12} md={6} key={request.id}>
                  <Item>
                    <RequestCardUser
                      title={request.title}
                      coachName={request.coachNickname}
                      type={request.status}
                      id={request.id}
                    />
                  </Item>
                </Card>
              ))}
            </Grid>
            <PaginationBox />
          </RequestListWrap>
        </Container>
      </ThemeProvider>
    </>
  );
};

const Container = styled(Box)`
  width: 118rem;
  margin: 13rem auto 10rem auto;
  .title {
    padding-bottom: 1rem;
    border-bottom: 2px solid #ff7134;
    h1 {
      font-size: 2.5rem;
      color: #3b3b3b;
      font-weight: 700;
      line-height: 150%;
      strong {
        color: #ff7134;
      }
    }
  }
  @media ${() => theme.device.desktop} {
    width: 90%;
  }
`;

const Card = styled(Grid)``;

const RequestListWrap = styled(Box)`
  margin-top: 3rem;
`;

export default MyMatching;
