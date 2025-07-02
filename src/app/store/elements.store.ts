import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { PeriodicElement } from '../models/periodic-element.model';
import { ELEMENT_DATA } from '../models/periodic-element.data';
import { DELAY } from '../models/constants';
import { delay, pipe, tap } from 'rxjs';

type ElementState = {
  elements: PeriodicElement[];
  currentElements: PeriodicElement[];
  isLoading: boolean;
  isFiltering: boolean;
};

const initialState: ElementState = {
  elements: [...ELEMENT_DATA],
  currentElements: [],
  isLoading: false,
  isFiltering: false,
};

export const ElementsStore = signalStore(
  { providedIn: 'root' },
  withState<ElementState>(initialState),

  withMethods((store) => ({
    loadData: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { isLoading: true });
        }),
        delay(DELAY),
        tap(() => {
          patchState(store, { currentElements: store.elements() });
        })
      )
    ),
    filter: rxMethod<string>(
      pipe(
        tap(() => {
          patchState(store, { isFiltering: true });
        }),
        delay(DELAY),
        tap((query) => {
          if (!query.length) {
            patchState(store, { currentElements: store.elements() });
            return;
          }
          const lowerQuery = query.toLowerCase();

          const elements = store
            .elements()
            .filter((el) =>
              Object.values(el).some((value) =>
                value.toString().toLowerCase().includes(lowerQuery)
              )
            );

          patchState(store, {
            currentElements: elements,
            isFiltering: false,
          });
        })
      )
    ),
    edit: rxMethod<PeriodicElement>(
      pipe(
        tap((newData: PeriodicElement) => {
          const currentElements = store.currentElements().map((el) => {
            return newData.position === el.position
              ? { ...el, ...newData }
              : el;
          });
          const elements = store.elements().map((el) => {
            return newData.position === el.position
              ? { ...el, ...newData }
              : el;
          });
          patchState(store, {
            currentElements: currentElements,
            elements: elements,
          });
          console.log('Updated!');
        })
      )
    ),
  }))
);
