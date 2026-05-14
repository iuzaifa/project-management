import Mailgen from "mailgen";


const emailVerificationMailgenContent = (username, verificationUlr) => {
    return {
        body : {
            name : username,
            intro : "Welcome to our app! We\'re very excited to have you on board.",
            action  : {
                instructions : "To verify your email please click on the following button!",
                color: '#22BC66',
                text: 'Verify your email',
                link : verificationUlr
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}


const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body : {
            name : username,
            intro : "We go a requestto reset the password of your  account",
            action  : {
                instructions : "To reset the password click the following button link!",
                color: '#b62407',
                text: 'Reset Password',
                link : passwordResetUrl
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}