import { SchoolDetail, UserDetail, SavedWord } from "../src/Database/models.js";
import axios from 'axios'

let IMAGE_DATA = [
  { image: "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg" }
]

const handlerFunctions = {

  register: async (req, res) => {
    const { name, email, password, zipCode, image } = req.body;


    console.log(name, email, password, zipCode);

    const alreadyExists = await UserDetail.findAll({
      where: {
        email,
      },
    });

    if (alreadyExists.length > 0) {

      res.json({ message: "Information already in use" });
      return

    } else {
      const newUser = await UserDetail.create({
        name: name,
        email: email,
        password: password,
        zipCode: zipCode,
        image: image,
      });

      console.log(newUser)


      req.session.user = newUser;

      res.send(IMAGE_DATA, {
        message: "account created",
        user_id: newUser.userId,
      });
    }

  },

  getSavedSchools: async (req, res) => {
    const savedSchool = await SchoolDetail.findAll();
    res.json(savedSchool);
  },



  deleteSavedSchools: async (req, res) => {
    const { schoolId } = req.params;
    await SchoolDetail.destroy({
      where: { schoolId: schoolId },
    });


    res.json({ success: true, deletedSchool: schoolId });

  },


  deleteAccount: async (req, res) => {
    const { id } = req.params
    const user = await UserDetail.findOne({
      where: { userId: id }
    })
    await user.destroy()
    req.session.destroy()
    res.json({ success: true })
  },

  editAccount: async (req, res) => {
    const { email, password, zipcode } = req.body
    const user = await UserDetail.findOne({ where: { email: email } })

    user.email = email
    user.password = password
    user.zipCode = zipcode

    await user.save()

    res.json({ success: true })
  },


  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserDetail.findOne({ where: { email: email } });

    if (user && password === user.password) {
      req.session.userId = user.userId;
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  },


  user: async (req, res) => {
    const id = req.session.userId;
    const user = await UserDetail.findOne({ where: { userId: id } });

    res.send(user);
  },


  userStatus: async (req, res) => {
    if (req.session.userId) {
      const user = await UserDetail.findByPk(req.session.userId);
      res.send({ email: user.email, success: true });
    } else {
      res.json({ success: false });
    }
  },

  logout: async (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  },

  getSavedSchools: async (req, res) => {
    const savedSchool = await SchoolDetail.findAll();
    res.json(savedSchool);
  },
  deleteSavedSchools: async (req, res) => {
    const { schoolId } = req.params;
    await SchoolDetail.destroy({
      where: { schoolId: schoolId },
    });
  },

  profileImage: async (req, res) => {
    const { image } = req.body;
    console.log(image)
    await UserDetail.create({
      where: { image: image }
    });
  },

  getImage: async (req, res) => {

    await UserDetail.findOne({
      where: { image: image }
    })
    res.json(image)
  },

  getSavedWords: async (req, res) => {
    const savedTranslation = await SavedWord.findAll();
    res.json(savedTranslation)
  },

  getWordsById: async (req, res) => {
    const { wordId } = req.params
    const getWordId = await SavedWord.findByPk(wordId)
    res.json(getWordId)
  },

  deleteSavedWords: async (req, res) => {
    const { wordId } = req.params
    await SavedWord.destroy({
      where: { wordId: wordId }
    })
    res.json({ success: true, deletedWord: wordId })
  },

  translate: async (req, res) => {
    try {
      const { translation, language, source } = req.body
      const body = {
        'text': [translation],
        'target_lang': language,
        'source_lang': source
      }

      const response = await axios.post('https://api-free.deepl.com/v2/translate', body, {
        headers: {
          'Authorization': process.env.REACT_APP_DEEPL_API_KEY
        }
      })
      res.json(response.data)
    }
    catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  },

  saveTranslation: async (req, res) => {
    const { translatedText, originalText, id, toLanguage } = req.body

    const translation = await SavedWord.create({
      word: translatedText,
      original: originalText,
      userId: id,
      toLanguage: toLanguage
    })
    if (translation) {
      res.status(200).json({ message: 'OK' })
    } else {
      res.status(500).json({ error: 'Internal Server Error' })
    }

  },
};

export default handlerFunctions;
