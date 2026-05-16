import {body} from "express-validator"

const userRegistrationValidator = () => {

    return [
        body("email").trim()
            .notEmpty()
            .withMessage("Email is required!")
            .isEmail()
            .withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase("username must be lowercase !")
            .isLength({min : 3})
            .withMessage("username must be at leat 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullname")
            .optional()
            .trim()
    ]

}

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required!")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is required!"),
        body("newPassword").notEmpty().withMessage("New password is required!")
    
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid Email")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("Password is required!")

    ]
}



export  {
    userRegistrationValidator, userLoginValidator, userChangeCurrentPasswordValidator,
    userForgotPasswordValidator, userResetForgotPasswordValidator
};