import { useObservableState } from "observable-hooks";
import React, { useCallback } from "react";
import { useEffect, useMemo, useRef } from "react";
import { EventPayload, EventType, RxjsEvent } from "./rxjs";
import constate from "constate";

function useRxjsEvent() {
  const eventCenter = useRef<RxjsEvent<EventPayload>>(new RxjsEvent());

  const fireEvent = eventCenter.current.fireEvent;

  const event = useObservableState(eventCenter.current.event$(), null);

  const createEvent = useMemo(() => {
    if (event?.type === "create") {
      return event;
    }
    return null;
  }, [event]);

  return { fireEvent, event, createEvent };
}

const [EventProvider, useFireEvent, useEvent, useCreateEvent] = constate(
  useRxjsEvent,
  (ctx) => ctx.fireEvent,
  (ctx) => ctx.event,
  (ctx) => ctx.createEvent
);

function ShowEventData() {
  const event = useEvent();

  useEffect(() => {
    console.log("[ShowEventData] rendered");
    return () => {
      console.log("[ShowEventData] unmounted");
    };
  });

  return <p>Latest Event Data: {JSON.stringify(event?.data ?? null)}</p>;
}

function ShowCreateEventData() {
  const createEvent = useCreateEvent();

  useEffect(() => {
    console.log("[ShowCreateEventData] rendered");
    return () => {
      console.log("[ShowCreateEventData] unmounted");
    };
  });

  return (
    <p>Latest CreateEvent Data: {JSON.stringify(createEvent?.data ?? null)}</p>
  );
}

export function ShowApp() {
  const fireEvent = useFireEvent();

  useEffect(() => {
    console.log("[App] rendered");
    return () => {
      console.log("[App] unmounted");
    };
  });

  const fireEventCb = useCallback(
    (eventType: EventType) => {
      const ts = Date.now().toString();
      console.warn("[App] fireEventCb", eventType, ts);
      fireEvent({ type: eventType, data: ts });
    },
    [fireEvent]
  );

  return (
    <>
      <button onClick={() => fireEventCb("create")}>Fire Create Event</button>
      <button onClick={() => fireEventCb("update")}>Fire Update Event</button>
      <ShowEventData></ShowEventData>
      <ShowCreateEventData></ShowCreateEventData>
    </>
  );
}

export function App() {
  return (
    <EventProvider>
      <ShowApp></ShowApp>
    </EventProvider>
  );
}
