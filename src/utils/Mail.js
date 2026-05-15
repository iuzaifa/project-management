import Mailgen from "mailgen";
import nodemailer from "nodemailer";


export const sendEmail = async (options) => {
    const mailGenerater = new Mailgen({
        theme : "default",
        product : {
            name : "Task Mange",
            link : "https://taskmanage.com"
        }
    })
    const emailTextual =  mailGenerater.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerater.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host : process.env.MAILTRAP_SMTP_HOST,
        port : process.env.MAILTRAP_SMTP_PORT,
        auth : {
            user : process.env.MAILTRAP_SMTP_USER,
            pass : process.env.MAILTRAP_SMTP_PASS
        }
    }) 
    
    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email,
        subject : options.subject,
        text  :  emailTextual,
        html : emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Error while sending mail:", err);
        console.error("Error : ", error)
        
    }

}


export const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body : {
            name : username,
            intro : "Welcome to our app! We\'re very excited to have you on board.",
            action: {
                instructions: "To verify your email please click on the following button!",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body : {
            name : username,
            intro : "We go a requestto reset the password of your  account",
            action  : {
                instructions : "To reset the password click the following button link!",
                button : {
                    color: '#b62407',
                    text: 'Reset Password',
                    link : passwordResetUrl 
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


export default sendEmail;