const Artifact = require("../models/artifact.model");

exports.createArtifact = async (req, res) => {
  const artifact = await Artifact.create({
    ...req.body,
    createdBy: req.user.id,
  });
  res.json(artifact);
};

exports.getArtifacts = async (req, res) => {
  const artifacts = await Artifact.find().populate("createdBy", "email");
  res.json(artifacts);
};

exports.toggleLike = async (req, res) => {
  const { id } = req.params; // artifact id
  const userId = req.user.id;

  const artifact = await Artifact.findById(id);
  if (!artifact) return res.status(404).json({ message: "Artifact not found" });

  const alreadyLiked = artifact.likes.includes(userId);

  if (alreadyLiked) {
    // Unlike
    artifact.likes = artifact.likes.filter(
      (like) => like.toString() !== userId,
    );
  } else {
    // Like
    artifact.likes.push(userId);
  }

  await artifact.save();

  res.json({
    message: alreadyLiked ? "Unliked" : "Liked",
    totalLikes: artifact.likes.length,
  });
};

exports.getLikes = async (req, res) => {
  const { id } = req.params;

  const artifact = await Artifact.findById(id).populate("likes", "email");

  if (!artifact) return res.status(404).json({ message: "Artifact not found" });

  res.json({
    totalLikes: artifact.likes.length,
    users: artifact.likes,
  });
};


exports.addComment = async (req, res) => {
  const { id } = req.params; // artifact id
  const { text } = req.body;
  const userId = req.user.id;

  if (!text)
    return res.status(400).json({ message: "Comment text required" });

  const artifact = await Artifact.findById(id);
  if (!artifact)
    return res.status(404).json({ message: "Artifact not found" });

  artifact.comments.push({
    user: userId,
    text,
  });

  await artifact.save();

  res.json({
    message: "Comment added",
    totalComments: artifact.comments.length,
  });
};


exports.getComments = async (req, res) => {
  const { id } = req.params;

  const artifact = await Artifact.findById(id)
    .populate("comments.user", "email");

  if (!artifact)
    return res.status(404).json({ message: "Artifact not found" });

  res.json({
    totalComments: artifact.comments.length,
    comments: artifact.comments,
  });
};
