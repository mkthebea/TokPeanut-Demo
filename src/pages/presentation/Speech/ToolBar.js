import React, { useContext } from "react";
import ScriptContext from "./ScriptContext";
import theme from "../../../style/theme";
import styled from "@emotion/styled/macro";
import Tooltip from "@mui/material/Tooltip";
import { Box, Button } from "@mui/material";

const ToolBar = ({ symbolIcons, symbolDesc }) => {
  const { scriptContext, setScriptContext } = useContext(ScriptContext);

  const clickHandler = (name) => {
    if (!scriptContext.isDone) return;
    setScriptContext({ ...scriptContext, cursor: name });
  };

  return (
    <Contents $activate={scriptContext.isDone}>
      <ToolBarWrap cursor={symbolIcons[scriptContext.cursor]}>
        <ul className={scriptContext.isDone ? "activate" : "disabled"}>
          {Object.entries(symbolIcons).map(([name, src], i) => (
            <li key={name}>
              <Tooltip
                title={symbolDesc[name]}
                followCursor
                arrow
                placement="right"
              >
                <Button
                  disabled={!scriptContext.isDone}
                  className={scriptContext.isDone ? "color" : ""}
                  id="color1"
                  onClick={() => clickHandler(name)}
                >
                  <img src={src} alt={name} />
                  <p>{name}</p>
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      </ToolBarWrap>
    </Contents>
  );
};

const Contents = styled(Box)`
  height: 100vh;
  background-color: ${(props) => (props.$activate ? "#fff" : "#e0e0e0")};
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  left: 0;
  @media ${() => theme.device.mobile} {
    display: none;
  }
  .disabled {
    background-color: #e0e0e0;
  }
`;

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

export default ToolBar;
