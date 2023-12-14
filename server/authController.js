import {
  SchoolDetail,
  UserDetail,
  FurtherStudy,
} from "../src/Database/models.js";
import bcrypt from "bcryptjs";

const authFunctions = {
  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserDetail.findOne({ where: { email: email } });

    if (user) {
      const hashMatch = await bcrypt.compare(password, user.password);
      
      if (user && hashMatch === true) {
        req.session.userId = user.userId;
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  },
  logout: async (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  },
  user: async (req, res) => {
    const id = req.session.userId;
    const user = await UserDetail.findOne({ where: { userId: id } });

    res.send(user);
  },
  register: async (req, res) => {
    const { email, password, zipCode, profilePic } = req.body;

    const salt = bcrypt.genSaltSync(12);
    const hash = await bcrypt.hash(password, salt);

    const alreadyExists = await UserDetail.findOne({
      where: {
        email,
      },
    });

    if (alreadyExists) {
      res
        .status(500)
        .json({ error: `An account with that email already exists.` });
    } else {
      const newUser = await UserDetail.create({
        email: email,
        password: hash,
        zipCode: zipCode,
        profilePic: profilePic,
      });

      req.session.user = newUser;
      req.session.userId = newUser.userId;

      res.send({
        message: "account created",
        user_id: newUser.user_id,
      });
    }
  },
  editAccount: async (req, res) => {
    // const { id } = req.params
    const id = req.session.userId;
    const { email, newPassword, zipcode, currentPassword, profilePic } =
      req.body;
    const user = await UserDetail.findOne({ where: { userId: id } });
    const hashMatch = await bcrypt.compare(currentPassword, user.password);

    if (newPassword === "") {
      user.email = email;
      user.zipCode = zipcode;
      user.profilePic = profilePic;

      await user.save();
      res.json({ success: true });
    } else if (hashMatch === false) {
      res.json({ success: false });
    } else {
      const salt = bcrypt.genSaltSync(12);
      const hash = await bcrypt.hash(newPassword, salt);
      user.email = email;
      user.password = hash;
      user.zipCode = zipcode;

      res.json({ success: true });
      await user.save();
    }
  },
  deleteAccount: async (req, res) => {
    // const { id } = req.params;
    const id = req.session.userId;
    const user = await UserDetail.findOne({
      where: { userId: id },
    });
    await user.destroy();
    req.session.destroy();
    res.json({ success: true });
  },
  userStatus: async (req, res) => {
    if (req.session.userId) {
      const user = await UserDetail.findByPk(req.session.userId);
      res.send({ email: user.email, success: true });
    } else {
      res.json({ success: false });
    }
  },
};
export default authFunctions;
