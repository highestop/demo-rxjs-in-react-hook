import { useObservableState } from "observable-hooks";
import { useCallback, useEffect } from "react";
import { Observable, Subject } from "rxjs";
import { filter } from "rxjs/operators";
import React from "react";
import constate from "constate";

export type EventType = "create" | "update" | "delete";

export interface EventPayload {
  type: EventType;
  data: string;
}

export class RxjsEvent<T extends EventPayload = EventPayload> {
  private event$$: Subject<T> = new Subject();

  public event$(): Observable<T> {
    return this.event$$.asObservable();
  }

  public createEvent$ = this.event$$.pipe(
    filter((event) => event.type === "create")
  );

  public fireEvent = (payload: T) => {
    this.event$$.next(payload);
  };
}

const [EventProvider, useEvent] = constate(() => new RxjsEvent());

function ShowEventData() {
  const eventCenter = useEvent();

  const event = useObservableState(eventCenter.event$(), null);

  useEffect(() => {
    console.log("[ShowEventData] rendered");
    return () => {
      console.log("[ShowEventData] unmounted");
    };
  });

  return <p>Latest Event Data: {JSON.stringify(event?.data ?? null)}</p>;
}

function ShowCreateEventData() {
  const eventCenter = useEvent();

  const createEvent = useObservableState(eventCenter.createEvent$, null);

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

function ShowApp() {
  const eventCenter = useEvent();

  useEffect(() => {
    console.log("[App] rendered");
    return () => {
      console.log("[App] unmounted");
    };
  });

  const fireEventCb = useCallback((eventType: EventType) => {
    const ts = Date.now().toString();
    console.warn("[App] fireEventCb", eventType, ts);
    eventCenter.fireEvent({ type: eventType, data: ts });
  }, []);

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
      <ShowApp />
    </EventProvider>
  );
}
