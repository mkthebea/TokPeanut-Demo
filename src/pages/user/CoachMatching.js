// 코치 사용자 의뢰 리스트
import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { createTheme, Divider, Icon, ThemeProvider } from "@mui/material";
import { Box, IconButton, Button, Grid } from "@mui/material";
import Nav from "../../component/layout/Nav";
import theme from "../../style/theme";
import RequestCardCoach from "../../component/card/RequestCardCoach";

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const CoachMatching = () => {
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
  const requestList = [
    {
      id: 1,
      userNickname: "Alice",
      status: "REQUESTED",
    },
    {
      id: 2,
      userNickname: "Bob",
      status: "ACCEPTED",
    },
    {
      id: 3,
      userNickname: "Carol",
      status: "DENIED",
    },
    {
      id: 4,
      userNickname: "David",
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
                    <RequestCardCoach
                      userName={request.userNickname}
                      type={request.status}
                      id={request.id}
                    />
                  </Item>
                </Card>
              ))}
            </Grid>
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

export default CoachMatching;
