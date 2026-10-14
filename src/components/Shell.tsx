import { Avatar } from "@cake-admin/cakeand";
import { NavLink, Outlet } from "react-router";
import styled from "styled-components";
import calendarIcon from "../assets/icons/calendar.svg";
import chatIcon from "../assets/icons/chat.svg";
import cesMark from "../assets/icons/ces-mark.svg";
import contactsIcon from "../assets/icons/contacts.svg";
import feedbackIcon from "../assets/icons/feedback.svg";
import lenovoMark from "../assets/icons/lenovo-mark.svg";
import locationIcon from "../assets/icons/location.svg";
import monitoringIcon from "../assets/icons/monitoring.svg";
import techworldWord from "../assets/icons/techworld-wordmark.svg";

const rail = [
  { src: monitoringIcon, label: "Monitoring", invert: false },
  { src: locationIcon, label: "Location", invert: true },
  { src: calendarIcon, label: "Calendar", invert: true },
  { src: contactsIcon, label: "Contacts", invert: true },
];

const tabs = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/registration", label: "Registration", end: false },
  { to: "/seating", label: "Seating", end: false },
];

export function Shell() {
  return (
    <Frame>
      <TopBar>
        <Lockup aria-label="Lenovo Tech World at CES">
          <LenovoMark src={lenovoMark} alt="" />
          <Wordmark src={techworldWord} alt="" />
          <CesMark src={cesMark} alt="" />
        </Lockup>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.to} to={tab.to} end={tab.end}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <Tools>
          <ChatButton type="button" aria-label="Messages, 4 new">
            <img src={chatIcon} alt="" width={24} height={24} />
            <ChatCount>4</ChatCount>
          </ChatButton>
          <Person>
            <Avatar initials="JM" alt="JM" size="sm" />
          </Person>
        </Tools>
      </TopBar>
      <Body>
        <Rail aria-label="Command center">
          <RailGroup>
            {rail.map((item) => (
              <RailButton key={item.label} type="button" aria-label={item.label}>
                <RailIcon src={item.src} alt="" width={20} height={20} $invert={item.invert} />
              </RailButton>
            ))}
          </RailGroup>
          <Feedback type="button" aria-label="Feedback">
            <RailIcon src={feedbackIcon} alt="" width={20} height={20} $invert />
          </Feedback>
        </Rail>
        <Main>
          <Outlet />
        </Main>
        <VerticalMark src="/brand/lenovo-vertical.svg" alt="Lenovo" />
      </Body>
    </Frame>
  );
}

const Frame = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  background:
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url("/brand/background.png") center / cover no-repeat;
`;

const TopBar = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 0 24px;
  background: #121315;
  position: relative;
  z-index: 2;
`;

const Lockup = styled.div`
  position: relative;
  width: 156px;
  height: 32px;
  flex: none;
`;

const LenovoMark = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 44px;
  height: 15px;
`;

const Wordmark = styled.img`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 113px;
  height: 12px;
`;

const CesMark = styled.img`
  position: absolute;
  right: 0;
  bottom: 1px;
  width: 40px;
  height: 10px;
`;

const TabList = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
`;

const Tab = styled(NavLink)`
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 20px;
  border-radius: 16px;
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;

  &.active {
    background: rgba(122, 18, 107, 0.4);
    color: #f1e1ed;
    font-weight: 700;
  }

  &.active::after {
    content: "";
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 0;
    height: 4px;
    border-radius: 999px;
    background: #d9c1d8;
  }
`;

const Tools = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Person = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 100px;
  overflow: hidden;
  background: #f0c7bf;
  color: #252629;
  display: grid;
  place-items: center;
`;

const ChatButton = styled.button`
  position: relative;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #8e8f94;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const ChatCount = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #393a3d;
  color: #aaaaaf;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
`;

const Rail = styled.nav`
  width: 54px;
  flex: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 0;
  background: rgba(142, 143, 148, 0.35);
  backdrop-filter: blur(90px);
`;

const RailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RailIcon = styled.img<{ $invert?: boolean }>`
  width: 20px;
  height: 20px;
  filter: ${(props) => (props.$invert ? "invert(1)" : "none")};
`;

const RailButton = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;

const Feedback = styled(RailButton)`
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 24px;
  background: #8e8f94;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  padding: 24px 56px 24px 24px;
`;

const VerticalMark = styled.img`
  position: absolute;
  right: 0;
  bottom: 110px;
  width: 48px;
  height: 142px;
`;
