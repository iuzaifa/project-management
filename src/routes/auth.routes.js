import { Router } from "express";
import {registerUser, login, logoutUser} from "../controllers/auth.controllers.js";
import validate from "../middlewares/validator.middleware.js"
import {userRegistrationValidator, userLoginValidator} from "../validators/index.js"

const router = Router();


router.route("/register").post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(logoutUser);



export default router;
