import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();
export const transporter = createTransport({
	host: process.env.MAIL_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

export const getVerifyMailConfig = (to: string, code: string) => ({
	from: 'cool-mobile-operator@yandex.ru',
	to,
	subject: 'Confirm your registration at Cool Mobile Operator',
	text: `Please verify your account by this key: ${code}`,
});
