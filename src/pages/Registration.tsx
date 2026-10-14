import {
  Badge,
  Divider,
  IconButton,
  MenuContainer,
  MenuHeader,
  MenuItem,
  Modal,
  ModalContent,
  ModalFooter,
  TextInput,
} from "@cake-admin/cakeand";
import { ChevronDown, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import arrowDownIcon from "../assets/icons/custom/arrow_down.svg";
import arrowUpIcon from "../assets/icons/custom/arrow_up.svg";
import filterIcon from "../assets/icons/custom/filter_alt.svg";
import listviewIcon from "../assets/icons/custom/listview.svg";
import starIcon from "../assets/icons/custom/star.svg";
import starOutlineIcon from "../assets/icons/custom/star_outline.svg";
import { getGuestInfo, type GuestInfo } from "../../server/seatingData";
import { CompanyChip } from "../components/CompanyChip";
import { LocationChip } from "../components/LocationChip";
import { PersonChip } from "../components/PersonChip";
import { SpeakerChip } from "../components/SpeakerChip";
import {
  GUEST_GROUPS,
  GUEST_TYPES,
  RECEPTIONS,
  getRegistrations,
  type GuestType,
  type RegistrationRow,
} from "../../server/registrationData";
import { GuestInfoPopup } from "./seating/GuestInfoPopup";

type ColumnKey =
  | "guestGroup"
  | "guestType"
  | "region"
  | "name"
  | "company"
  | "jobTitle"
  | "receptions";

type SortState = { column: ColumnKey; direction: "asc" | "desc" } | null;
type Filters = Partial<Record<ColumnKey, string[]>>;
type ColumnSearch = Partial<Record<ColumnKey, string>>;

type SavedView = {
  id: string;
  name: string;
  sort: SortState;
  filters: Filters;
  groupBy: ColumnKey | null;
  globalAccountsOnly: boolean;
  columnSearch: ColumnSearch;
};

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "guestGroup", label: "Guest group" },
  { key: "guestType", label: "Guest type" },
  { key: "region", label: "Region" },
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job title" },
  { key: "receptions", label: "Receptions attending" },
];

const STORAGE_KEY = "marketingicc.registration.views";
const ALL_ROWS = getRegistrations();
const ICON_PT = 18;

/** Figma table grid: star | 1.2fr | 0.8fr | 1fr × 5 */
const TABLE_GRID =
  "24px minmax(0, 1.2fr) minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)";

function loadViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedView[];
  } catch {
    return [];
  }
}

function cellValue(row: RegistrationRow, key: ColumnKey): string {
  if (key === "receptions") return row.receptions.join(", ");
  if (key === "guestGroup" && row.speaker) return "Speakers";
  return String(row[key]);
}

function guestTypeColor(type: GuestType): "blue" | "jade" | "orange" | "yellow" {
  if (type === "General Attendee") return "blue";
  if (type === "Enhanced Guest") return "jade";
  if (type === "Suite Guest") return "orange";
  return "yellow";
}

function isGuestType(value: string): value is GuestType {
  return (GUEST_TYPES as readonly string[]).includes(value);
}

function groupStats(rows: RegistrationRow[]) {
  const groups = new Set(rows.map((row) => row.guestGroup)).size;
  const guestTypes = new Set(rows.map((row) => row.guestType)).size;
  return {
    registrations: rows.length,
    groups,
    guestTypes,
  };
}

/** Match group-header chips to the same colors used in each column’s cells. */
function GroupHeaderChip({
  column,
  label,
  rows,
  onPersonClick,
}: {
  column: ColumnKey;
  label: string;
  rows: RegistrationRow[];
  onPersonClick?: (name: string) => void;
}) {
  if (column === "guestType" && isGuestType(label)) {
    return (
      <LabelBadge color={guestTypeColor(label)} tone="subtle" dot={false}>
        {label}
      </LabelBadge>
    );
  }

  if (column === "company") {
    return (
      <CompanyChip name={label} global={rows.some((row) => row.globalAccount)} />
    );
  }

  if (column === "receptions") {
    return (
      <LabelBadge color="cyan" tone="subtle" dot={false}>
        {label}
      </LabelBadge>
    );
  }

  if (column === "guestGroup") {
    if (label === "Speakers") return <SpeakerChip iconSize={ICON_PT} />;
    return (
      <LabelBadge color="violet" tone="subtle" dot={false}>
        {label}
      </LabelBadge>
    );
  }

  if (column === "region") {
    return <LocationChip label={label} iconSize={ICON_PT} />;
  }

  if (column === "name") {
    return (
      <PersonChip
        name={label}
        iconSize={ICON_PT}
        onClick={onPersonClick ? () => onPersonClick(label) : undefined}
      />
    );
  }

  return (
    <LabelBadge color="violet" tone="subtle" dot={false}>
      {label}
    </LabelBadge>
  );
}

export function Registration() {
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [starsOnly, setStarsOnly] = useState(false);
  const [sort, setSort] = useState<SortState>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [columnSearch, setColumnSearch] = useState<ColumnSearch>({});
  const [groupBy, setGroupBy] = useState<ColumnKey | null>(null);
  const [globalAccountsOnly, setGlobalAccountsOnly] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [views, setViews] = useState<SavedView[]>(() => loadViews());
  const [activeViewId, setActiveViewId] = useState("default");
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [guest, setGuest] = useState<GuestInfo | null>(null);

  const [menu, setMenu] = useState<{ kind: "filter" | "view" | null; column?: ColumnKey }>({
    kind: null,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  function openGuest(name: string) {
    setGuest(getGuestInfo(name));
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  }, [views]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenu({ kind: null });
    };
    if (menu.kind) document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [menu.kind]);

  const filtered = useMemo(() => {
    let rows = [...ALL_ROWS];

    if (starsOnly) rows = rows.filter((row) => starred.has(row.id));

    if (globalAccountsOnly) rows = rows.filter((row) => row.globalAccount);

    (Object.keys(columnSearch) as ColumnKey[]).forEach((key) => {
      const needle = columnSearch[key]?.trim().toLowerCase();
      if (!needle) return;
      rows = rows.filter((row) => cellValue(row, key).toLowerCase().includes(needle));
    });

    (Object.keys(filters) as ColumnKey[]).forEach((key) => {
      const allowed = filters[key];
      if (!allowed?.length) return;
      rows = rows.filter((row) => {
        if (key === "receptions") return row.receptions.some((item) => allowed.includes(item));
        return allowed.includes(cellValue(row, key));
      });
    });

    if (sort) {
      rows.sort((a, b) => {
        const cmp = cellValue(a, sort.column).localeCompare(cellValue(b, sort.column));
        return sort.direction === "asc" ? cmp : -cmp;
      });
    }

    return rows;
  }, [columnSearch, filters, globalAccountsOnly, sort, starred, starsOnly]);

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const map = new Map<string, RegistrationRow[]>();
    filtered.forEach((row) => {
      const key = cellValue(row, groupBy) || "—";
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  useEffect(() => {
    if (!groupBy) {
      setCollapsedGroups(new Set());
      return;
    }
    const labels = [
      ...new Set(filtered.map((row) => cellValue(row, groupBy) || "—")),
    ].sort((a, b) => a.localeCompare(b));
    setCollapsedGroups(new Set(labels.slice(1)));
    // Only re-collapse when the grouping column changes — not on every filter pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [groupBy]);

  function applyView(view: SavedView | "default") {
    if (view === "default") {
      setActiveViewId("default");
      setSort(null);
      setFilters({});
      setGroupBy(null);
      setGlobalAccountsOnly(false);
      setColumnSearch({});
      return;
    }
    setActiveViewId(view.id);
    setSort(view.sort);
    setFilters(view.filters);
    setGroupBy(view.groupBy);
    setGlobalAccountsOnly(view.globalAccountsOnly);
    setColumnSearch(view.columnSearch ?? {});
  }

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) return;
    const next: SavedView = {
      id: `view-${Date.now()}`,
      name,
      sort,
      filters,
      groupBy,
      globalAccountsOnly,
      columnSearch,
    };
    setViews((prev) => [...prev, next]);
    setActiveViewId(next.id);
    setSaveOpen(false);
    setViewName("");
    setMenu({ kind: null });
  }

  function deleteView(id: string) {
    setViews((prev) => prev.filter((view) => view.id !== id));
    if (activeViewId === id) applyView("default");
  }

  function toggleSort(column: ColumnKey) {
    setSort((prev) => {
      if (!prev || prev.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return null;
    });
  }

  function toggleFilterValue(column: ColumnKey, value: string) {
    setFilters((prev) => {
      const current = new Set(prev[column] ?? []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      const next = { ...prev };
      if (current.size === 0) delete next[column];
      else next[column] = [...current];
      return next;
    });
  }

  function filterOptions(column: ColumnKey): string[] {
    if (column === "guestType") return [...GUEST_TYPES];
    if (column === "receptions") return [...RECEPTIONS];
    if (column === "guestGroup") {
      return ["Speakers", ...GUEST_GROUPS.filter((group) => group !== "Speakers")];
    }
    return [...new Set(ALL_ROWS.map((row) => cellValue(row, column)))].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  const activeViewLabel =
    activeViewId === "default"
      ? "Default view"
      : (views.find((view) => view.id === activeViewId)?.name ?? "Default view");

  function renderRow(row: RegistrationRow, index: number) {
    const isStarred = starred.has(row.id);
    return (
      <DataRow key={row.id} $stripe={index % 2 === 1}>
        <StarCell>
          <IconButton
            size="xs"
            variant="ghost"
            intent="secondary"
            label={isStarred ? `Unstar ${row.name}` : `Star ${row.name}`}
            icon={
              <GlyphImg
                src={isStarred ? starIcon : starOutlineIcon}
                alt=""
                width={ICON_PT}
                height={ICON_PT}
              />
            }
            onClick={() => {
              setStarred((prev) => {
                const next = new Set(prev);
                if (next.has(row.id)) next.delete(row.id);
                else next.add(row.id);
                return next;
              });
            }}
          />
        </StarCell>
        <Cell>
          {row.speaker ? (
            <SpeakerChip iconSize={ICON_PT} />
          ) : (
            <LabelBadge color="violet" tone="subtle" dot={false}>
              {row.guestGroup}
            </LabelBadge>
          )}
        </Cell>
        <Cell $pad>
          <LabelBadge color={guestTypeColor(row.guestType)} tone="subtle" dot={false}>
            {row.guestType}
          </LabelBadge>
        </Cell>
        <Cell $pad>
          <LocationChip label={row.region} iconSize={ICON_PT} />
        </Cell>
        <Cell $pad>
          <PersonChip name={row.name} iconSize={ICON_PT} onClick={() => openGuest(row.name)} />
        </Cell>
        <Cell $pad>
          <CompanyChip name={row.company} global={row.globalAccount} />
        </Cell>
        <Cell $pad>
          <JobTitle>{row.jobTitle}</JobTitle>
        </Cell>
        <Cell $pad>
          <Receptions>
            {row.receptions.map((item) => (
              <LabelBadge key={item} color="cyan" tone="subtle" dot={false}>
                {item}
              </LabelBadge>
            ))}
          </Receptions>
        </Cell>
      </DataRow>
    );
  }

  return (
    <Page>
      <TitleBar>
        <Title>Registration tracker</Title>
      </TitleBar>

      <Card>
        <HeaderSurface>
          <Toolbar>
            <ViewWrap ref={menu.kind === "view" ? menuRef : undefined}>
              <ViewButton
                type="button"
                onClick={() =>
                  setMenu((prev) => (prev.kind === "view" ? { kind: null } : { kind: "view" }))
                }
              >
                <span>{activeViewLabel}</span>
                <ChevronDown size={16} />
              </ViewButton>
              {menu.kind === "view" ? (
                <MenuPop $align="start">
                  <MenuContainer width={280} role="menu" aria-label="Saved views">
                    <MenuHeader>Views</MenuHeader>
                    <MenuItem
                      selected={activeViewId === "default"}
                      showLeftSlot={false}
                      showRightSlot={false}
                      onClick={() => {
                        applyView("default");
                        setMenu({ kind: null });
                      }}
                    >
                      Default view
                    </MenuItem>
                    {views.map((view) => (
                      <MenuItem
                        key={view.id}
                        selected={activeViewId === view.id}
                        showLeftSlot={false}
                        showRightSlot
                        rightSlot={
                          <IconButton
                            size="xs"
                            variant="ghost"
                            intent="secondary"
                            label={`Delete ${view.name}`}
                            icon={<Trash2 size={14} />}
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteView(view.id);
                            }}
                          />
                        }
                        onClick={() => {
                          applyView(view);
                          setMenu({ kind: null });
                        }}
                      >
                        {view.name}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      showLeftSlot={false}
                      showRightSlot={false}
                      onClick={() => {
                        setSaveOpen(true);
                        setMenu({ kind: null });
                      }}
                    >
                      Save current view
                    </MenuItem>
                  </MenuContainer>
                </MenuPop>
              ) : null}
            </ViewWrap>
            <Updated>Last updated: 3 mins ago</Updated>
          </Toolbar>

          <ColumnHeaderRow role="row">
            <StarCell role="columnheader">
              <IconButton
                size="xs"
                variant="ghost"
                intent="secondary"
                label={starsOnly ? "Show all rows" : "Show starred only"}
                icon={
                  <GlyphImg
                    src={starsOnly ? starIcon : starOutlineIcon}
                    alt=""
                    width={ICON_PT}
                    height={ICON_PT}
                  />
                }
                onClick={() => setStarsOnly((prev) => !prev)}
              />
            </StarCell>
            {COLUMNS.map((column) => {
              const isSorted = sort?.column === column.key;
              const isGrouped = groupBy === column.key;
              const isFiltered =
                (filters[column.key]?.length ?? 0) > 0 ||
                (column.key === "company" && globalAccountsOnly);
              return (
                <HeaderCell key={column.key} role="columnheader" $active={isSorted || isGrouped || isFiltered}>
                  <HeaderTop>
                    <HeaderAction $active={isSorted}>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        intent="secondary"
                        label={`Sort ${column.label}`}
                        icon={
                          <HeaderGlyph
                            $src={
                              isSorted && sort?.direction === "desc" ? arrowDownIcon : arrowUpIcon
                            }
                            $active={isSorted}
                          />
                        }
                        onClick={() => toggleSort(column.key)}
                      />
                    </HeaderAction>
                    <HeaderLabel>{column.label}</HeaderLabel>
                    <HeaderActions>
                      <HeaderAction $active={isFiltered}>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          intent="secondary"
                          label={`Filter ${column.label}`}
                          icon={<HeaderGlyph $src={filterIcon} $active={isFiltered} />}
                          onClick={() =>
                            setMenu((prev) =>
                              prev.kind === "filter" && prev.column === column.key
                                ? { kind: null }
                                : { kind: "filter", column: column.key },
                            )
                          }
                        />
                      </HeaderAction>
                      <HeaderAction $active={isGrouped}>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          intent="secondary"
                          label={`Group by ${column.label}`}
                          icon={<HeaderGlyph $src={listviewIcon} $active={isGrouped} />}
                          onClick={() => {
                            setGroupBy((prev) => (prev === column.key ? null : column.key));
                          }}
                        />
                      </HeaderAction>
                      {menu.kind === "filter" && menu.column === column.key ? (
                        <MenuPop ref={menuRef}>
                          <MenuContainer
                            width={280}
                            maxHeight={320}
                            role="menu"
                            aria-label={`Filter ${column.label}`}
                          >
                            <MenuHeader>Filter {column.label}</MenuHeader>
                            {column.key === "company" ? (
                              <>
                                <MenuItem
                                  showCheckbox
                                  checked={globalAccountsOnly}
                                  onCheckedChange={(checked) => {
                                    setGlobalAccountsOnly(checked);
                                  }}
                                  showLeftSlot={false}
                                  showRightSlot={false}
                                >
                                  Global Accounts only
                                </MenuItem>
                                <Divider />
                              </>
                            ) : null}
                            {column.key === "guestGroup" ? (
                              <>
                                <MenuItem
                                  showCheckbox
                                  checked={filters.guestGroup?.includes("Speakers") ?? false}
                                  onCheckedChange={() =>
                                    toggleFilterValue("guestGroup", "Speakers")
                                  }
                                  showLeftSlot={false}
                                  showRightSlot={false}
                                >
                                  Speakers
                                </MenuItem>
                                <Divider />
                              </>
                            ) : null}
                            {filterOptions(column.key)
                              .filter(
                                (value) => !(column.key === "guestGroup" && value === "Speakers"),
                              )
                              .map((value) => (
                                <MenuItem
                                  key={value}
                                  showCheckbox
                                  checked={filters[column.key]?.includes(value) ?? false}
                                  onCheckedChange={() => toggleFilterValue(column.key, value)}
                                  showLeftSlot={false}
                                  showRightSlot={false}
                                >
                                  {value}
                                </MenuItem>
                              ))}
                            {(filters[column.key]?.length ||
                              (column.key === "company" && globalAccountsOnly)) && (
                              <>
                                <Divider />
                                <MenuItem
                                  showLeftSlot={false}
                                  showRightSlot={false}
                                  onClick={() => {
                                    setFilters((prev) => {
                                      const next = { ...prev };
                                      delete next[column.key];
                                      return next;
                                    });
                                    if (column.key === "company") setGlobalAccountsOnly(false);
                                  }}
                                >
                                  Clear filters
                                </MenuItem>
                              </>
                            )}
                          </MenuContainer>
                        </MenuPop>
                      ) : null}
                    </HeaderActions>
                  </HeaderTop>
                  <ColumnSearch
                    aria-label={`Search ${column.label}`}
                    placeholder="Search"
                    size="sm"
                    value={columnSearch[column.key] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setColumnSearch((prev) => {
                        const next = { ...prev };
                        if (!value) delete next[column.key];
                        else next[column.key] = value;
                        return next;
                      });
                    }}
                    startIcon={<Search size={14} />}
                  />
                </HeaderCell>
              );
            })}
          </ColumnHeaderRow>
        </HeaderSurface>

        <BodyScroll role="table" aria-label="Registration tracker">
          {groups
            ? groups.flatMap(([label, rows], groupIndex) => {
                const collapsed = collapsedGroups.has(label);
                const stats = groupStats(rows);
                return [
                  <GroupRow
                    key={`g-${label}`}
                    type="button"
                    $tone={groupIndex % 2 === 0 ? "a" : "b"}
                    onClick={() => {
                      setCollapsedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(label)) next.delete(label);
                        else next.add(label);
                        return next;
                      });
                    }}
                  >
                    <GlyphImg
                      src={collapsed ? arrowUpIcon : arrowDownIcon}
                      alt=""
                      width={ICON_PT}
                      height={ICON_PT}
                    />
                    <GroupMeta>
                      <GroupHeaderChip
                        column={groupBy!}
                        label={label}
                        rows={rows}
                        onPersonClick={openGuest}
                      />
                      <GroupStat>{stats.registrations} registrations</GroupStat>
                      <GroupDot aria-hidden>·</GroupDot>
                      <GroupStat>{stats.groups} groups</GroupStat>
                      <GroupDot aria-hidden>·</GroupDot>
                      <GroupStat>{stats.guestTypes} guest types</GroupStat>
                    </GroupMeta>
                  </GroupRow>,
                  ...(collapsed
                    ? []
                    : [
                        <GroupChildren key={`gc-${label}`}>
                          {rows.map((row, index) => renderRow(row, index))}
                        </GroupChildren>,
                      ]),
                ];
              })
            : filtered.map((row, index) => renderRow(row, index))}
        </BodyScroll>
      </Card>

      <Modal
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="Save current view"
        subtitle="Name this combination of filters, sort, and grouping."
        showClose
        footer={
          <ModalFooter
            checkbox={false}
            primaryActionLabel="Save view"
            secondaryActionLabel="Cancel"
            onPrimaryAction={saveCurrentView}
            onSecondaryAction={() => setSaveOpen(false)}
            primaryActionDisabled={!viewName.trim()}
          />
        }
      >
        <ModalContent descriptionAsDialogDescription={false}>
          <TextInput
            label="View name"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            placeholder="e.g. Speakers — Global accounts"
          />
        </ModalContent>
      </Modal>

      {guest ? <GuestInfoPopup guest={guest} onClose={() => setGuest(null)} /> : null}
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  min-width: 0;
  min-height: 0;
  flex: 1;
  height: 100%;
`;

const TitleBar = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 var(--space-200);
  border-radius: var(--radius-150);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(90px);
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
  width: fit-content;
`;

const Title = styled.h1`
  margin: 0;
  font-size: var(--type-size-title);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const Card = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-400);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(90px);
  border: var(--stroke-100) solid #000000;
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
`;

const HeaderSurface = styled.div`
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  padding: var(--space-500) var(--space-500) var(--space-300);
  background: var(--color-surfaces-container-blur);
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-300);
`;

const ViewWrap = styled.div`
  position: relative;
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-100);
  width: 320px;
  max-width: 100%;
  min-height: 40px;
  padding: var(--space-200) var(--space-100);
  border-radius: var(--radius-200);
  border: var(--stroke-100) solid var(--color-stroke-border);
  background: var(--color-surfaces-container);
  color: var(--color-text-icon-primary);
  font: inherit;
  font-size: var(--type-size-body);
  letter-spacing: 0.2px;
  cursor: pointer;
`;

const Updated = styled.p`
  margin: 0;
  color: var(--color-text-icon-secondary);
  font-size: 10px;
  letter-spacing: 0.2px;
  line-height: 1.35;
`;

const MenuPop = styled.div<{ $align?: "start" | "end" }>`
  position: absolute;
  top: calc(100% + var(--space-100));
  ${(props) => (props.$align === "end" ? "right: 0;" : "left: 0;")}
  z-index: 30;
`;

const ColumnHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${TABLE_GRID};
  column-gap: var(--space-200);
  align-items: start;
  width: 100%;
`;

const HeaderCell = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  min-width: 0;
  color: ${(props) =>
    props.$active ? "var(--color-primary-primary)" : "var(--color-text-icon-primary)"};
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  min-width: 0;
`;

const HeaderLabel = styled.span`
  flex: 1;
  min-width: 0;
  height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
`;

const HeaderActions = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0;
  flex: none;
`;

/** Primary indigo active chip; icons use on-tonal */
const HeaderAction = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  border-radius: var(--radius-1000);
  background: ${(props) => (props.$active ? "var(--color-primary-primary)" : "transparent")};

  && button {
    background: transparent !important;
  }
`;

/** Tintable glyph via mask — active uses dark indigo on-tonal on primary. */
const HeaderGlyph = styled.span<{ $src: string; $active?: boolean }>`
  display: block;
  width: ${ICON_PT}px;
  height: ${ICON_PT}px;
  background: ${(props) =>
    props.$active
      ? "var(--color-text-icon-on-tonal-inverse)"
      : "var(--color-text-icon-primary)"};
  -webkit-mask-image: url(${(props) => JSON.stringify(props.$src)});
  mask-image: url(${(props) => JSON.stringify(props.$src)});
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
`;

const ColumnSearch = styled(TextInput)`
  && {
    width: 100%;
    max-width: 100%;
  }

  && input,
  && [data-slot="input"],
  && > div {
    min-height: 28px;
    height: 28px;
  }
`;

const BodyScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--space-100) var(--space-500) var(--space-500);
  display: flex;
  flex-direction: column;
`;

const DataRow = styled.div<{ $stripe?: boolean }>`
  display: grid;
  grid-template-columns: ${TABLE_GRID};
  column-gap: var(--space-200);
  align-items: center;
  width: 100%;
  padding-block: var(--space-050);
  background: ${(props) =>
    props.$stripe ? "var(--color-tonal-tonal-secondary-overlay)" : "transparent"};
`;

const StarCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const Cell = styled.div<{ $pad?: boolean }>`
  display: flex;
  align-items: center;
  min-width: 0;
  padding-inline: ${(props) => (props.$pad ? "var(--space-050)" : "0")};
`;

const GroupRow = styled.button<{ $tone?: "a" | "b" }>`
  display: flex;
  align-items: flex-start;
  gap: var(--space-200);
  width: 100%;
  margin: 0;
  padding: var(--space-050) 0;
  border: 0;
  border-radius: 0;
  background: ${(props) =>
    props.$tone === "b" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.4)"};
  color: var(--color-text-icon-primary);
  text-align: left;
  cursor: pointer;
  flex: none;
`;

const GroupMeta = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-100);
  min-width: 0;
`;

const GroupStat = styled.span`
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
  white-space: nowrap;
`;

const GroupDot = styled.span`
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const GroupChildren = styled.div`
  display: flex;
  flex-direction: column;
  padding-left: var(--space-500);
  width: 100%;
`;

const LabelBadge = styled(Badge)`
  && {
    display: inline-flex;
    justify-self: start;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    height: 16px;
    min-height: 16px;
    padding: 0 var(--space-050);
    font-size: var(--type-size-caption);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.2px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const JobTitle = styled.span`
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Receptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-050);
`;

const GlyphImg = styled.img`
  display: block;
  object-fit: contain;
`;
