import { Avatar, SimpleTooltip } from "@cake-admin/cakeand";
import { NavLink, Outlet } from "react-router";
import styled from "styled-components";
import calendarIcon from "../assets/icons/calendar.svg";
import chatIcon from "../assets/icons/chat.svg";
import contactsIcon from "../assets/icons/contacts.svg";
import feedbackIcon from "../assets/icons/feedback.svg";
import locationIcon from "../assets/icons/custom/location_on.svg";
import monitoringIcon from "../assets/icons/monitoring.svg";
import techworldLockup from "../assets/icons/techworld-lockup.svg";

const rail = [
  { src: monitoringIcon, label: "Statistics", tooltip: "Statistics: coming soon", invert: false },
  { src: locationIcon, label: "Maps", tooltip: "Maps: coming soon", invert: false },
  { src: calendarIcon, label: "Calendar", tooltip: "Calendar: coming soon", invert: true },
  { src: contactsIcon, label: "Contacts", tooltip: "Contacts: coming soon", invert: true },
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
          <img src={techworldLockup} alt="Lenovo Tech World @ CES" />
        </Lockup>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab.to} to={tab.to} end={tab.end}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <Tools>
          <SimpleTooltip
            trigger={
              <ChatTrigger>
                <ChatIcon src={chatIcon} alt="" width={18} height={18} />
                <ChatCount>4</ChatCount>
              </ChatTrigger>
            }
            triggerAriaLabel="Chat experience: coming soon"
            side="bottom"
          >
            Chat experience: coming soon
          </SimpleTooltip>
          <WhiteAvatar initials="JM" alt="JM" size="sm" />
        </Tools>
      </TopBar>
      <Body>
        <Rail aria-label="Command center">
          <RailGroup>
            {rail.map((item) => (
              <SimpleTooltip
                key={item.label}
                trigger={
                  <RailIconWrap>
                    <RailIcon src={item.src} alt="" width={18} height={18} $invert={item.invert} />
                  </RailIconWrap>
                }
                triggerAriaLabel={item.tooltip}
                side="right"
              >
                {item.tooltip}
              </SimpleTooltip>
            ))}
          </RailGroup>
          <SimpleTooltip
            trigger={
              <FeedbackWrap>
                <RailIcon src={feedbackIcon} alt="" width={18} height={18} $invert />
              </FeedbackWrap>
            }
            triggerAriaLabel="Feedback: coming soon"
            side="right"
          >
            Feedback: coming soon
          </SimpleTooltip>
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
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  background:
    linear-gradient(180deg, rgba(147, 97, 221, 0.3) 0%, rgba(3, 1, 61, 0.55) 88%),
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
  flex: none;
`;

const Lockup = styled.div`
  flex: none;
  display: flex;
  align-items: center;

  > img {
    display: block;
    height: 32px;
    width: auto;
  }
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

const WhiteAvatar = styled(Avatar)`
  && {
    background: transparent;
    overflow: hidden;
    border-radius: 100px;
  }

  && span {
    color: #ffffff !important;
  }
`;

const ChatTrigger = styled.span`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-disabled-disabled, #8e8f94);
  display: grid;
  place-items: center;
  opacity: 0.55;
  cursor: not-allowed;
  color: var(--color-text-icon-inverse);
`;

const ChatIcon = styled.img`
  width: 18px;
  height: 18px;
  filter: brightness(0) invert(1);
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
  align-items: center;
`;

const RailIcon = styled.img<{ $invert?: boolean }>`
  width: 18px;
  height: 18px;
  filter: ${(props) => (props.$invert ? "invert(1)" : "none")};
  opacity: 0.45;
`;

const RailIconWrap = styled.span`
  width: 100%;
  min-width: 54px;
  height: 48px;
  display: grid;
  place-items: center;
  cursor: not-allowed;
  opacity: 0.85;
`;

const FeedbackWrap = styled.span`
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border-radius: 24px;
  background: var(--color-disabled-disabled, #8e8f94);
  display: grid;
  place-items: center;
  cursor: not-allowed;
  opacity: 0.55;
`;

const Main = styled.main`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 56px 24px 24px;
  overflow: hidden;
`;

const VerticalMark = styled.img`
  position: absolute;
  right: 0;
  bottom: 110px;
  width: 48px;
  height: 142px;
`;
