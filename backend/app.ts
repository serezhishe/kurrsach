import express from 'express';
import { initRoutes } from './routes/initRoutes';
import * as dotenv from 'dotenv';
import { DbService } from './dbService';
import { json, urlencoded, raw } from 'body-parser';
import * as https from 'https';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import * as util from 'util';
import { JWTService } from './jwt';
import { InternetTariff, SmartphoneTariff, TvTariff, User, Package } from './types';
import { getVerifyMailConfig, transporter } from './mail';
import multer from 'multer';
const storage = multer.diskStorage({
	destination(req, file, cb): void {
	  	cb(null, 'uploads/images/');
	},
	filename(req, file, cb): void {
		const fileName = req.query.internet_tariff_name || req.query.tv_tariff_name || req.query.smartphone_tariff_name || req.query.package_name;
		cb(null, fileName + '.jpeg');
	}
});

const basePhoneNumber = '+37569';
const upload = multer({ storage });

dotenv.config();

const jwtService = new JWTService(process.env.JWT_SECRET!);

const hash = util.promisify(bcrypt.hash);
const compare = util.promisify(bcrypt.compare);

const dbService = new DbService({
	host: process.env.DB_HOST || '',
	user: process.env.DB_USER || '',
	password: process.env.DB_PASS || '',
	database: process.env.DB_NAME || '',
});

const key = fs.readFileSync(__dirname + '/keys/key.pem');
const cert = fs.readFileSync(__dirname + '/keys/cert.pem');
const app = express();
app.use(express.static('public'));
app.use(express.static('uploads'));
// const server = https.createServer({ key, cert, }, app);



app.use(urlencoded({ extended: true }));
app.use(json());
app.use(raw());
app.use(jwtService.isAuthorizedMiddleware);
// app.use(attachUser);
app.use((err: any, req: any, res: any, next: any): void => {
	if (err.name === 'UnauthorizedError') {
		res.status(401).send('invalid token.');
		// console.error(err);
	}
});

initRoutes(app);

app.post('/api/create_user', async (req, res) => {
	const login = req.body.login;
	const userWithLogin = await dbService.getUserByLogin(login);
	if (userWithLogin) {
		res.status(200).send({ error: null, status: 'user.already_exist' });
		return;
	}

	const password = await hash(req.body.password, 13);
	const randomKey = Math.random().toString(36).substring(7);
	const userToCreate: Omit<User, 'user_id'> = {
		name: req.body.name,
		surname: req.body.surname,
		second_name: req.body.second_name,
		login: req.body.login,
		mail: req.body.mail,
		register_date: new Date(),
		password,
		verify_code: randomKey,
		role: null,
	};

	const mailOptions = getVerifyMailConfig(userToCreate.mail, randomKey);

	transporter.sendMail(mailOptions, (error, info): void => {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	const userId = (await dbService.addUser(userToCreate))[0];
	if (userId) {
		const createdUser = await dbService.getUserByLogin(login);
		const { password: _password, ...userData } = createdUser;
		res.status(201).send({
			error: null,
			status: 'user.created',
			user: {
				...userData,
				is_verified: false,
			},
			token: jwtService.generateToken(userData),
			refreshToken: jwtService.generateRefreshToken(userData),
		});
	} else {
		res.status(200).send({ error: 'user.not_created' });
	}
});

app.post('/api/refreshToken', async (req, res) => {
	try {
		const tokenData = jwtService.verify(req.body.refreshToken);
		const user = await dbService.getUserByLogin((tokenData as any).data.login);
		res.status(201).send({
			error: null,
			status: 'token.refreshed',
			token: jwtService.generateToken(user),
			refreshToken: jwtService.generateRefreshToken(user),
		});
	} catch (error) {
		res.status(401).send('Invalid refresh token.');
	}
});

app.post('/api/verify', async (req, res) => {
	const user = await dbService.getUserByLogin(req.body.login);

	if (req.body.verify_code === user.verify_code) {
		await dbService.updateUser({ verify_code: null }, req.body.login);
		res.status(200).send({ error: null, status: 'code.verified' });
	} else {
		res.status(200).send({ error: null, status: 'code.not_verified' });
	}
});

app.post('/api/reverify', async (req, res) => {
	const randomKey = Math.random().toString(36).substring(7);

	const mailOptions = getVerifyMailConfig(req.body.mail, randomKey);

	transporter.sendMail(mailOptions, (error, info): void => {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	const response = await dbService.updateUser({ verify_code: randomKey }, req.body.login);

	if (response) {
		res.status(200).send({ error: null, status: 'mail.sent' });
	} else {
		res.status(200).send({ error: 'unexpected_error' });
	}
});

app.patch('/api/update_user', async (req, res) => {
	const tokenData = (req as any).token.data;
	if (req.body.login !== tokenData.login) {
		const userWithNewLogin = await dbService.getUserByLogin(req.body.login);
		if (userWithNewLogin) {
			res.status(200).send({ error: null, status: 'user.already_exist' });
			return;
		}
	}

	const userData = await dbService.getUserByLogin(tokenData.login);
	const oldPassword = userData.password;
	const matches = await compare(req.body.old_password, oldPassword);

	if (!matches) {
		res.status(200).send({
			error: null,
			status: 'password.not_matched',
		});
		return;
	}

	const password = req.body.new_password ? await hash(req.body.new_password, 13) : undefined;
	const userToUpdate: Partial<User> = {
		name: req.body.name || userData.name,
		surname: req.body.surname || userData.surname,
		second_name: req.body.second_name || userData.second_name,
		login: req.body.login || userData.login,
		mail: req.body.mail || userData.mail,
		role: req.body.role || userData.role,
		password,
	};

	const response = await dbService.updateUser(userToUpdate, req.body.login);
	if (response) {
		const userResponse = await dbService.getUserByLogin(req.body.login);
		const { password: _p, verify_code: verifyCode, ...user } = userResponse;
		res.status(200).send({
			error: null,
			status: 'user.updated',
			user: {
				...user,
				is_verified: !verifyCode,
			},
		});
	} else {
		res.status(200).send({ error: 'error' });
	}
});

app.post('/api/login', async (req, res) => {
	const user = await dbService.getUserByLogin(req.body.login);
	if (!user) {
		res.status(200).send({ error: null, status: 'user.not_exist' });
		return;
	}

	const password = user.password;
	const matches = await compare(req.body.password, password);
	if (matches) {
		const { password: _password, ...userData } = user;
		res.status(200).send({
			error: null,
			status: 'password.matched',
			user: {
				...userData,
				is_verified: !userData.verify_code,
			},
			token: jwtService.generateToken(user),
			refreshToken: jwtService.generateRefreshToken(user),
		});
	} else {
		res.status(200).send({
			error: null,
			status: 'password.not_matched',
		});
	}
});

app.post('/api/add_smartphone_tariff', upload.single('file'), async (req, res) => {
	const tokenData = (req as any).token.data;
	// if (!tokenData.role) {
	// 	res.status(403).send();
	// 	return;
	// }

	await dbService.addSmartphoneTariff(req.body);
	res.status(200).send({
		error: null,
		status: 'tariff.added',
	});
});

app.post('/api/add_internet_tariff', upload.single('file'), async (req, res) => {
	const tokenData = (req as any).token.data;
	// if (!tokenData.role) {
	// 	res.status(403).send();
	// 	return;
	// }

	await dbService.addInternetTariff(req.body);
	res.status(200).send({
		error: null,
		status: 'tariff.added',
	});
});

app.post('/api/add_tv_tariff', upload.single('file'), async (req, res) => {
	const tokenData = (req as any).token.data;
	// if (!tokenData.role) {
	// 	res.status(403).send();
	// 	return;
	// }

	await dbService.addTvTariff(req.body);
	res.status(200).send({
		error: null,
		status: 'tariff.added',
	});
});

app.post('/api/add_package', upload.single('file'), async (req, res) => {
	const tokenData = (req as any).token.data;
	// if (!tokenData.role) {
	// 	res.status(403).send();
	// 	return;
	// }

	await dbService.addPackage(req.body);
	res.status(200).send({
		error: null,
		status: 'package.added',
	});
});

app.post('/api/add_abonent', async (req, res) => {
	const numbers = await dbService.getAllTelephoneNumbers();
	let phoneNumber: string;
	do {
		phoneNumber = basePhoneNumber;
		for (let i = 0; i < 7; i++) {
			phoneNumber += Math.floor(Math.random() * 10);
		}
	} while (numbers.includes(phoneNumber));
	let smartphoneTariffData: SmartphoneTariff;
	let internetTariffData: InternetTariff;
	let tvTariffData: TvTariff;
	let packageData: Package;
	const abonentToCreate = {
		...req.body,
		phone_number: phoneNumber,
		balance: 0,
		left_minute_count: 0,
		left_gb_count: 0,
		left_home_gb_count: 0,
		left_sms_count: 0,
	};
	const multiplier = getMultiplier();
	if (req.body.package_id) {
		packageData = await dbService.getPackageById(req.body.package_id);
		smartphoneTariffData = await dbService.getSmartphoneTariffById(packageData.smartphone_tariff_id);
		internetTariffData = await dbService.getInternetTariffById(packageData.internet_tariff_id);
		tvTariffData = await dbService.getTvTariffById(packageData.tv_tariff_id);
		abonentToCreate.balance -= Math.floor(packageData.month_pay * multiplier * 100) / 100;
		// tslint:disable: max-line-length
		const leftTariffMinuteCount = smartphoneTariffData.included_minute_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_minute_count * multiplier);
		const leftTariffGBCount = smartphoneTariffData.included_gb_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_gb_count * multiplier);
		const leftTariffSMSCount = smartphoneTariffData.included_sms_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_sms_count * multiplier);
		const leftTariffHomeGBCount = internetTariffData.included_home_gb_count === -1 ? -1 : Math.floor(internetTariffData.included_home_gb_count * multiplier);
		abonentToCreate.left_minute_count = leftTariffMinuteCount === -1 ? -1 : abonentToCreate.left_minute_count + leftTariffMinuteCount;
		abonentToCreate.left_gb_count = leftTariffGBCount === -1 ? -1 : abonentToCreate.left_gb_count + leftTariffGBCount;
		abonentToCreate.left_sms_count = leftTariffSMSCount === -1 ? -1 : abonentToCreate.left_sms_count + leftTariffSMSCount;
		abonentToCreate.left_home_gb_count = leftTariffHomeGBCount === -1 ? -1 : abonentToCreate.left_home_gb_count + leftTariffHomeGBCount;
	} else {
		if (req.body.smartphone_tariff_id) {
			smartphoneTariffData = await dbService.getSmartphoneTariffById(req.body.smartphone_tariff_id);
			abonentToCreate.balance -= Math.floor(smartphoneTariffData.month_pay * multiplier * 100) / 100;
			// tslint:disable: max-line-length
			const leftTariffMinuteCount = smartphoneTariffData.included_minute_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_minute_count * multiplier);
			const leftTariffGBCount = smartphoneTariffData.included_gb_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_gb_count * multiplier);
			const leftTariffSMSCount = smartphoneTariffData.included_sms_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_sms_count * multiplier);
			abonentToCreate.left_minute_count = leftTariffMinuteCount === -1 ? -1 : abonentToCreate.left_minute_count + leftTariffMinuteCount;
			abonentToCreate.left_gb_count = leftTariffGBCount === -1 ? -1 : abonentToCreate.left_gb_count + leftTariffGBCount;
			abonentToCreate.left_sms_count = leftTariffSMSCount === -1 ? -1 : abonentToCreate.left_sms_count + leftTariffSMSCount;
		}
		if (req.body.internet_tariff_id) {
			internetTariffData = await dbService.getInternetTariffById(req.body.internet_tariff_id);
			abonentToCreate.balance -= Math.floor(internetTariffData.month_pay * multiplier * 100) / 100;
			// tslint:disable: max-line-length
			const leftTariffHomeGBCount = internetTariffData.included_home_gb_count === -1 ? -1 : Math.floor(internetTariffData.included_home_gb_count * multiplier);
			abonentToCreate.left_home_gb_count = leftTariffHomeGBCount === -1 ? -1 : abonentToCreate.left_home_gb_count + leftTariffHomeGBCount;
		}
		if (req.body.tv_tariff_id) {
			tvTariffData = await dbService.getTvTariffById(req.body.tv_tariff_id);
			abonentToCreate.balance -= Math.floor(tvTariffData.month_pay * multiplier * 100) / 100;
		}
	}
	await dbService.addAbonent(abonentToCreate);
	res.status(200).send({
		error: null,
		status: 'abonent.added',
	});
});

app.patch('/api/edit_abonent', async (req, res) => {
	let smartphoneTariffData: SmartphoneTariff;
	let internetTariffData: InternetTariff;
	let tvTariffData: TvTariff;
	let packageData: Package;
	const abonentToUpdate = {
		...req.body,
		left_minute_count: 0,
		left_gb_count: 0,
		left_home_gb_count: 0,
		left_sms_count: 0,
	};
	const multiplier = getMultiplier();
	if (req.body.package_id) {
		packageData = await dbService.getPackageById(req.body.package_id);
		smartphoneTariffData = await dbService.getSmartphoneTariffById(packageData.smartphone_tariff_id);
		internetTariffData = await dbService.getInternetTariffById(packageData.internet_tariff_id);
		tvTariffData = await dbService.getTvTariffById(packageData.tv_tariff_id);
		abonentToUpdate.balance -= Math.floor(packageData.month_pay * multiplier * 100) / 100;
		// tslint:disable: max-line-length
		const leftTariffMinuteCount = smartphoneTariffData.included_minute_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_minute_count * multiplier);
		const leftTariffGBCount = smartphoneTariffData.included_gb_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_gb_count * multiplier);
		const leftTariffSMSCount = smartphoneTariffData.included_sms_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_sms_count * multiplier);
		const leftTariffHomeGBCount = internetTariffData.included_home_gb_count === -1 ? -1 : Math.floor(internetTariffData.included_home_gb_count * multiplier);
		abonentToUpdate.left_minute_count = leftTariffMinuteCount === -1 ? -1 : abonentToUpdate.left_minute_count + leftTariffMinuteCount;
		abonentToUpdate.left_gb_count = leftTariffGBCount === -1 ? -1 : abonentToUpdate.left_gb_count + leftTariffGBCount;
		abonentToUpdate.left_sms_count = leftTariffSMSCount === -1 ? -1 : abonentToUpdate.left_sms_count + leftTariffSMSCount;
		abonentToUpdate.left_home_gb_count = leftTariffHomeGBCount === -1 ? -1 : abonentToUpdate.left_home_gb_count + leftTariffHomeGBCount;
	} else {
		if (req.body.smartphone_tariff_id) {
			smartphoneTariffData = await dbService.getSmartphoneTariffById(req.body.smartphone_tariff_id);
			abonentToUpdate.balance -= Math.floor(smartphoneTariffData.month_pay * multiplier * 100) / 100;
			const leftTariffMinuteCount = smartphoneTariffData.included_minute_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_minute_count * multiplier);
			const leftTariffGBCount = smartphoneTariffData.included_gb_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_gb_count * multiplier);
			const leftTariffSMSCount = smartphoneTariffData.included_sms_count === -1 ? -1 : Math.floor(smartphoneTariffData.included_sms_count * multiplier);
			abonentToUpdate.left_minute_count = leftTariffMinuteCount === -1 ? -1 : abonentToUpdate.left_minute_count + leftTariffMinuteCount;
			abonentToUpdate.left_gb_count = leftTariffGBCount === -1 ? -1 : abonentToUpdate.left_gb_count + leftTariffGBCount;
			abonentToUpdate.left_sms_count = leftTariffSMSCount === -1 ? -1 : abonentToUpdate.left_sms_count + leftTariffSMSCount;
		}
		if (req.body.internet_tariff_id) {
			internetTariffData = await dbService.getInternetTariffById(req.body.internet_tariff_id);
			abonentToUpdate.balance -= Math.floor(internetTariffData.month_pay * multiplier * 100) / 100;
			const leftTariffHomeGBCount = internetTariffData.included_home_gb_count === -1 ? -1 : Math.floor(internetTariffData.included_home_gb_count * multiplier);
			abonentToUpdate.left_home_gb_count = leftTariffHomeGBCount === -1 ? -1 : abonentToUpdate.left_home_gb_count + leftTariffHomeGBCount;
		}
		if (req.body.tv_tariff_id) {
			tvTariffData = await dbService.getTvTariffById(req.body.tv_tariff_id);
			abonentToUpdate.balance -= Math.floor(tvTariffData.month_pay * multiplier * 100) / 100;
		}
	}
	await dbService.updateAbonent(abonentToUpdate);
	res.status(200).send({
		error: null,
		status: 'abonent.updated',
	});
});

app.patch('/api/add_role', async (req, res) => {
	await dbService.setUserRole(req.body.user_id, req.body.role);
	res.status(200).send({
		error: null,
		status: 'role.updated',
	});
});

app.get('/api/smartphone_tariffs', async (req, res) => {
	const tariffs = await dbService.getSmartphoneTariffs();
	res.status(200).send({
		error: null,
		tariffs,
	});
});

app.get('/api/internet_tariffs', async (req, res) => {
	const tariffs = await dbService.getInternetTariffs();
	res.status(200).send({
		error: null,
		tariffs,
	});
});

app.get('/api/tv_tariffs', async (req, res) => {
	const tariffs = await dbService.getTvTariffs();
	res.status(200).send({
		error: null,
		tariffs,
	});
});

app.get('/api/packages', async (req, res) => {
	const packages = await dbService.getPackages();
	res.status(200).send({
		error: null,
		packages,
	});
});

app.delete('/api/smartphone_tariffs', async (req, res) => {
	const tokenData = (req as any).token.data;
	if (!tokenData.role) {
		res.status(403).send();
		return;
	}

	await dbService.deleteSmartphoneTariffs(+(req.query.id as string));

	res.status(200).send({
		error: null,
		status: 'smartphone_tariff.deleted',
	});
});

app.delete('/api/internet_tariffs', async (req, res) => {
	const tokenData = (req as any).token.data;
	if (!tokenData.role) {
		res.status(403).send();
		return;
	}

	await dbService.deleteInternetTariffs(+(req.query.id as string));
	res.status(200).send({
		error: null,
		status: 'internet_tariff.deleted',
	});
});

app.delete('/api/tv_tariffs', async (req, res) => {
	const tokenData = (req as any).token.data;
	if (!tokenData.role) {
		res.status(403).send();
		return;
	}

	await dbService.deleteTvTariffs(+(req.query.id as string));
	res.status(200).send({
		error: null,
		status: 'tv_tariff.deleted',
	});
});

app.delete('/api/packages', async (req, res) => {
	const tokenData = (req as any).token.data;
	if (!tokenData.role) {
		res.status(403).send();
		return;
	}

	await dbService.deletePackages(+(req.query.id as string));
	res.status(200).send({
		error: null,
		status: 'package.deleted',
	});
});

app.delete('/api/abonents', async (req, res) => {
	await dbService.deleteAbonent(+(req.query.id as string));
	res.status(200).send({
		error: null,
		status: 'abonent.deleted',
	});
});

app.delete('/api/users', async (req, res) => {
	await dbService.deleteUser(+(req.query.id as string));
	res.status(200).send({
		error: null,
		status: 'abonent.deleted',
	});
});

app.post('/api/abonentsByUser', async (req, res) => {
	const abonents = await dbService.getAbonentsByUserId(req.body.user_id);
	res.status(200).send({
		error: null,
		abonents,
	});
});

app.get('/api/all_users', async (req, res) => {
	const users = await dbService.getAllUserInfo();
	res.status(200).send({
		error: null,
		users,
	});
});

function getMultiplier(): number {
	const dateNow = new Date();
	const lastDay = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
	return (lastDay.getDate() - dateNow.getDate()) / lastDay.getDate();
}


app.listen(process.env.PORT, () => console.log(`Server running on port: ${process.env.PORT}`));
