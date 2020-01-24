import nodemailer from 'nodemailer';
import path from 'path';
import pug from 'pug';
import html2text from 'html-to-text';
// import { catchAsync } from './catchAsync';

export default class eMailTrap {
    to: any;
    firstname: any;
    url: any;
    from: any;
    constructor(user: any, url: any){
        this.to = user.email;
        this.firstname = user.name;
        this.url = url;
        this.from = `Admin name <admin@mydomain.io>`;
    }

    public newTransport() {
        const vars: any = process.env;

        if ( vars.NODE_ENV === 'production' ) {
            // SendGrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: vars.SENDGRID_USERNAME,
                    pass: vars.SENDGRID_PASSWORD
                }
            });
        }
        
        // 1) Create a transporter
        const myOptions = {
            host: vars.EMAIL_HOST,
            port: vars.EMAIL_PORT,
            auth: {
                user: vars.EMAIL_USERNAME,
                pass: vars.EMAIL_PASSWORD
            }
        };
        
        return nodemailer.createTransport(myOptions);
    }

    public async send( template: any, subject: any ) {
        // send the actual email 
        // 1) html render
        const options = {
            firstName: this.firstname,
            url: this.url,
            subject
        }
        const route = path.join( __dirname, `../templates/${template}.pug` );
        const html = pug.renderFile(route, options);
        // 2) define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: html2text.fromString(html)
        }
        // 3) create a transport and send email
        const one: any = this.newTransport();
        await one.sendMail(mailOptions);
    }

    public async sendWelcome() {
        await this.send('welcome', 'Welcome to the Tours Family!');
    }

    public async sendPasswordReset() {
        await this.send('password-reset', 'Your password reset Token ( valid for just 10 minutes )');
    }


}