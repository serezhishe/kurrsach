import { Injectable } from '@angular/core';
import { Nullable } from '@app/types/common';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	public subscribeOnValue<T>(value: string): Observable<Nullable<T>> {
		return fromEvent(window, 'storage').pipe(
			filter(
				(ev) =>
					value === (ev as StorageEvent).key &&
					(ev as StorageEvent).oldValue !== (ev as StorageEvent).newValue
			),
			map(ev => {
				const newValue = (ev as StorageEvent).newValue;
				if (!newValue || newValue === 'null') {
					return null;
				}
				return JSON.parse(newValue) as T;
			}),
		);
	}

	public setItem(key: string, value: any): void {
		localStorage.setItem(key, JSON.stringify(value));
	}

	public getItem<T>(key: string): Nullable<T> {
		const value = localStorage.getItem(key);
		if (!value || value === 'null') {
			return null;
		}

		return JSON.parse(value);
	}

	public removeItem(key: string): void {
		localStorage.removeItem(key);
	}
}
