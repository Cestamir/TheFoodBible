import express from "express"

const router = express.Router();

router.post("/register",registerUser)
router.post("/login",loginUser)

export default router;

// currently dont work if i tried to post a request to http://localhost:5173/api/register i get an internal 500 error need to learn more