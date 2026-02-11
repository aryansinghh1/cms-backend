const router = require("express").Router();
const ctrl = require("../controllers/artifact.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/",auth,ctrl.createArtifact);
router.get("/",auth,ctrl.getArtifacts);

//LIKE
router.post("/:id/like",auth, ctrl.toggleLike);
router.get("/:id/likes",auth,ctrl.getLikes);

//COMMENTS
router.post("/:id/comment",auth, ctrl.addComment);
router.get("/:id/comments",auth,ctrl.getComments);


module.exports = router;