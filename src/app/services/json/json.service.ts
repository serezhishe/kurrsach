import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

	constructor() { }

	public saveFile<T = any>(dataToSave: Record<string, T>, filename: string): void {
		const blob = new Blob([JSON.stringify(dataToSave, undefined, 2)]);
		saveAs(blob, filename);
	}
}
