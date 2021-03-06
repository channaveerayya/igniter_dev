const express = require("express")
const request = require("request")
const config = require("config")
const router = express.Router()
const auth = require("../../middleware/auth")
const Profile = require("../../models/Profile")
const User = require("../../models/User")
const Post = require("../../models/Post")
const { check, validationResult } = require("express-validator")

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"])
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" })
    }

    res.json(profile)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Server error")
  }
})

router.post(
  "/",
  [
    auth,
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skills is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    //Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (req.body.company) profileFields.company = req.body.company
    if (req.body.website) profileFields.website = req.body.website
    if (req.body.location) profileFields.location = req.body.location
    if (req.body.bio) profileFields.bio = req.body.bio
    if (req.body.status) profileFields.status = req.body.status
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername
    // Skills - Spilt into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",")
    }

    // Social
    profileFields.social = {}
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram

    try {
      let profile = await Profile.findOne({ user: req.user.id })
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
        return res.json(profile)
      }

      profile = new Profile(profileFields)
      await profile.save()
      res.json(profile)
    } catch (error) {
      console.error(error.message)
      res.status(500).send("Serve error")
    }
  }
)

// @router    GET api/profile
// @desc      Get all Profiles
// @access    public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"])
    res.json(profiles)
  } catch (error) {
    console.error(error.message)
    res.status(500).send("Serve error")
  }
})

// @router    GET api/profile/user/:user_id
// @desc      Get all Profile by user ID
// @access    Public

router.get("/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"])
    if (!profile)
      return res.status(400).json({ msg: "There is no profile for this user" })
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" })
    }
    res.status(500).send("Serve error")
  }
})

// @router    DELETE api/profile
// @desc      Delete Profile , User  and Posts
// @access    Private

router.delete("/", auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id })

    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })

    //Remove user
    await User.findOneAndRemove({ _id: req.user.id })
    return res.json({ msg: "User Deleted" })
  } catch (error) {
    console.error(error.message)
    if (error.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" })
    }
    res.status(500).send("Serve error")
  }
})

// @router    PUT api/profile/experience
// @desc      Add Profile experience
// @access    Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is Required").not().isEmpty(),
      check("company", "company is Required").not().isEmpty(),
      check("from", "From Date is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body
    const newExp = {
      title,
      company,
      from,
      location,
      to,
      current,
      description,
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id })
      profile.experience.unshift(newExp)
      await profile.save()
      return res.json(profile)
    } catch (error) {
      console.error(error.message)
      return res.status(500).json({ msg: "Server Error" })
    }
  }
)

// @router    DELETE api/profile/experience/:exp_id
// @desc      DELETE Profile experience
// @access    Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    //get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id)
    profile.experience.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ msg: "Server Error" })
  }
})

// @router    PUT api/profile/education
// @desc      Add Profile education
// @access    Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is Required").not().isEmpty(),
      check("degree", "Degree is Required").not().isEmpty(),
      check("fieldofstudy", "Field of Study is Required").not().isEmpty(),
      check("from", "From Date is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id })
      profile.education.unshift(newEdu)
      await profile.save()
      return res.json(profile)
    } catch (error) {
      console.error(error.message)
      return res.status(500).json({ msg: "Server Error" })
    }
  }
)

// @router    DELETE api/profile/education/:edu_id
// @desc      DELETE Profile education
// @access    Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })

    //get remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id)
    profile.education.splice(removeIndex, 1)
    await profile.save()
    res.json(profile)
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ msg: "Server Error" })
  }
})

// @router    GET api/profile/github/:username
// @desc      Get user repo from GitHub
// @access    Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    }
    request(options, (error, response, body) => {
      if (error) console.error(error)
      if (response.statusCode !== 200) {
        return res.status(500).json({ msg: "No GitHub Profile Found" })
      }
      res.json(JSON.parse(body))
    })
  } catch (error) {
    console.error(error.message)
    return res.status(500).json({ msg: "Server Error" })
  }
})

module.exports = router
