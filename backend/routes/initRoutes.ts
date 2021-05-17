import { Application } from 'express';

export function initRoutes(app: Application): void {
	app.get('/', (_req, res) => {
		res.sendFile('./index.html', { root: process.cwd() + '/public' });
	});
}
