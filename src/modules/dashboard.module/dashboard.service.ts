import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { menuItems } from "../../db/schema/menu.js";
import { getOwnOrganisation } from "../organisations.module/organisations.service.js";
import { selectClosures, selectHours, selectStoresList, selectTables } from "../stores.module/stores.repository.js";
import { selectReservations } from "../reservations.module/reservations.repository.js";
import type { reservationsSelectType } from "../../db/schema/reservations.js";
import type { storesSelectType } from "../../db/schema/stores.js";
import { addDays, formatMinutes, formatShortDate, serviceNow, type ServiceNowType } from "../../utils/service-time.js";
import { capacityFor, isTakingBookings, nextFreeStarts, shiftsOn, SLOT_MINUTES } from "../../utils/availability.js";

const ARRIVALS_WINDOW_MINUTES = 90;
const HISTORY_DAYS = 14;
const URGENT_PARTY_SIZE = 6;
const URGENT_LEAD_MINUTES = 120;

type AttentionKindType = "error" | "warning" | "info";
type AttentionActionType =
    | { type: "call", phone: string }
    | { type: "availability", date: string }
    | { type: "details" }
    | { type: "menu" };

type AttentionItemType = {
    storeId: string;
    kind: AttentionKindType;
    title: string;
    body: string;
    action: AttentionActionType;
};

const KIND_ORDER: Record<AttentionKindType, number> = { error: 0, warning: 1, info: 2 };

const countsAsCovers = (reservation: reservationsSelectType) =>
    reservation.status !== "cancelled" && reservation.status !== "no_show";

export const getDashboardService = async (adminUserId: string) => {
    const organisation = await getOwnOrganisation(adminUserId);
    const storeList = await selectStoresList(organisation.id);
    const ids = storeList.map(store => store.id);
    const headlineNow = serviceNow(storeList[0]?.timezone ?? "Europe/Athens");
    const historyFrom = addDays(headlineNow.date, -(HISTORY_DAYS - 1));

    const [hours, tables, closures, reservationList, soldOut] = await Promise.all([
        selectHours(ids),
        selectTables(ids),
        selectClosures(ids, historyFrom),
        selectReservations(ids, historyFrom, addDays(headlineNow.date, 1)),
        ids.length === 0 ? [] : db.select({ storeId: menuItems.storeId, name: menuItems.name }).from(menuItems)
            .where(and(inArray(menuItems.storeId, ids), eq(menuItems.available, false))),
    ]);

    const attention: AttentionItemType[] = [];
    const arrivals: (reservationsSelectType & { tableLabel: string | null })[] = [];

    const stores = storeList.map(store => {
        const now = serviceNow(store.timezone);
        const storeHours = hours.filter(shift => shift.storeId === store.id);
        const storeTables = tables.filter(table => table.storeId === store.id);
        const storeClosures = closures.filter(closure => closure.storeId === store.id);
        const storeReservations = reservationList.filter(reservation => reservation.storeId === store.id);
        const seats = storeTables.reduce((total, table) => total + table.seats, 0);
        const tableLabel = (tableId: string | null) => storeTables.find(table => table.id === tableId)?.label ?? null;

        const today = storeReservations.filter(reservation => reservation.date === now.date);
        const shiftsToday = shiftsOn(storeHours, storeClosures, now.date);
        const isOpenToday = isTakingBookings(store, now.date) && shiftsToday.length > 0;
        const isServiceOver = isOpenToday && now.minutes >= Math.max(...shiftsToday.map(shift => shift.closesMinutes));

        const currentSlot = Math.floor(now.minutes / SLOT_MINUTES) * SLOT_MINUTES;
        const freeStarts = isOpenToday ? nextFreeStarts(store, shiftsToday, storeTables, today, currentSlot) : [];
        const seatsLeft = freeStarts.reduce((total, entry) => total + entry.table.seats, 0);
        const earliest = freeStarts.reduce<typeof freeStarts[number] | undefined>(
            (best, entry) => !best || entry.start < best.start ? entry : best, undefined);

        const seated = today.filter(reservation => reservation.status === "seated");

        collectAttention(attention, store, now, today, storeTables.length, storeHours.length, tableLabel);
        const storeSoldOut = soldOut.filter(item => item.storeId === store.id);
        if (storeSoldOut.length > 0) {
            const names = storeSoldOut.slice(0, 2).map(item => item.name).join(" and ");
            attention.push({
                storeId: store.id, kind: "info",
                title: `${storeSoldOut.length} ${storeSoldOut.length === 1 ? "dish" : "dishes"} sold out at ${store.storeName}`,
                body: `${names}${storeSoldOut.length > 2 ? " and more" : ""} ${storeSoldOut.length === 1 ? "is" : "are"} hidden from the online menu.`,
                action: { type: "menu" },
            });
        }

        arrivals.push(...today
            .filter(reservation => (reservation.status === "confirmed" || reservation.status === "unconfirmed")
                && reservation.startMinutes >= now.minutes
                && reservation.startMinutes <= now.minutes + ARRIVALS_WINDOW_MINUTES)
            .map(reservation => ({ ...reservation, tableLabel: tableLabel(reservation.tableId) })));

        const history = Array.from({ length: HISTORY_DAYS }, (_, index) => {
            const date = addDays(historyFrom, index);
            const day = storeReservations.filter(reservation => reservation.date === date);
            const capacity = isTakingBookings(store, date) || date < now.date
                ? capacityFor(store, shiftsOn(storeHours, storeClosures, date), seats)
                : 0;
            return {
                date,
                covers: day.filter(countsAsCovers).reduce((total, reservation) => total + reservation.partySize, 0),
                capacity,
                bookings: day.length,
                noShows: day.filter(reservation => reservation.status === "no_show").length,
                cancellations: day.filter(reservation => reservation.status === "cancelled").length,
            };
        });

        return {
            id: store.id,
            storeName: store.storeName,
            city: store.city,
            status: store.status,
            closureNote: store.closureNote,
            reopensOn: store.reopensOn,
            now,
            isOpenToday,
            isServiceOver,
            seats,
            tableCount: storeTables.length,
            capacityToday: isOpenToday ? capacityFor(store, shiftsToday, seats) : 0,
            coversToday: today.filter(countsAsCovers).reduce((total, reservation) => total + reservation.partySize, 0),
            seatedCovers: seated.reduce((total, reservation) => total + reservation.partySize, 0),
            seatedTables: seated.length,
            seatsLeft,
            nextFree: earliest
                ? { minutes: earliest.start, isNow: earliest.start <= now.minutes, tableLabel: earliest.table.label, seats: earliest.table.seats }
                : null,
            history,
        };
    });

    return {
        organisation: { id: organisation.id, orgName: organisation.orgName },
        now: headlineNow,
        stores,
        attention: attention.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]),
        arrivals: arrivals.sort((a, b) => a.startMinutes - b.startMinutes),
    };
};

const collectAttention = (
    attention: AttentionItemType[],
    store: storesSelectType,
    now: ServiceNowType,
    today: reservationsSelectType[],
    tableCount: number,
    shiftCount: number,
    tableLabel: (tableId: string | null) => string | null
) => {
    if (store.status === "draft") {
        attention.push({
            storeId: store.id, kind: "info",
            title: `${store.storeName} is a draft`,
            body: "Hidden from diners until you switch it to Accepting reservations.",
            action: { type: "details" },
        });
    }

    if (store.status === "temporarily_closed") {
        const note = store.closureNote ? `Diners see “${store.closureNote}”.` : "Diners can't book right now.";
        attention.push({
            storeId: store.id, kind: "warning",
            title: `${store.storeName} is temporarily closed`,
            body: store.reopensOn ? `${note} Bookings reopen on ${formatShortDate(store.reopensOn)}.` : `${note} Reopen it or set a reopening date.`,
            action: { type: "details" },
        });
    }

    if (store.status !== "draft" && (tableCount === 0 || shiftCount === 0)) {
        const missing = [tableCount === 0 && "tables", shiftCount === 0 && "opening hours"].filter(Boolean).join(" or ");
        attention.push({
            storeId: store.id, kind: "warning",
            title: `${store.storeName} has no ${missing}`,
            body: "Diners can't book until it has tables and opening hours.",
            action: { type: "details" },
        });
    }

    for (const reservation of today) {
        const time = formatMinutes(reservation.startMinutes);
        const table = tableLabel(reservation.tableId);

        if (reservation.status === "unconfirmed" && reservation.startMinutes + store.gracePeriodMinutes >= now.minutes) {
            const urgent = reservation.partySize >= URGENT_PARTY_SIZE || reservation.startMinutes - now.minutes <= URGENT_LEAD_MINUTES;
            attention.push({
                storeId: store.id, kind: urgent ? "error" : "warning",
                title: `Party of ${reservation.partySize} at ${time} still unconfirmed — ${reservation.guestName}`,
                body: table ? `${table} is being held for it.` : "No table assigned yet.",
                action: { type: "call", phone: reservation.phone },
            });
        }

        const lateBy = now.minutes - reservation.startMinutes;
        if (reservation.status === "confirmed" && lateBy > store.gracePeriodMinutes) {
            attention.push({
                storeId: store.id, kind: "error",
                title: `No-show holding ${table ?? "a table"} — ${reservation.guestName} · ${reservation.partySize}, ${time}`,
                body: `Not seated ${lateBy} min after booking time. Mark the no-show to free the table.`,
                action: { type: "availability", date: reservation.date },
            });
        }
    }
};
