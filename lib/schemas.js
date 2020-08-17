const mongoose = require("mongoose");
const Random = require("meteor-random");
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
  _id: String,
  email: String,
  date: Date,
});

const EmailModel = mongoose.model("Emails", EmailSchema);

const Email = {
  insert: (object) => {
    object._id = Random.id();
    console.log(object);
    const instance = new EmailModel(object);
    console.log(instance);
    return new Promise((resolve, reject) => {
      instance.save((err, product) => {
        if (err) {
          reject(err);
        } else {
          resolve(product);
        }
      });
    });
  },
};

const QuotesSchema = new Schema({
  _id: String,
  shortCode: String,
  age: Number,
  gender: String,
  joint: Boolean,
  secondGender: String,
  secondAge: String,
  startDate: Number,
  createdAt: Date,
  principle: Number,
  quotes: [{ monthlyPayment: Number, description: String, name: String }],
});

const QuoteModel = mongoose.model("Quotes", QuotesSchema);

const Quote = {
  insert: (object) => {
    object._id = Random.id();
    object.shortCode = Random.id(5);
    const instance = new QuoteModel(object);
    return new Promise((resolve, reject) => {
      instance.save((err, product) => {
        if (err) {
          reject(err);
        } else {
          resolve(product);
        }
      });
    });
  },
};

const QuestionSchema = new Schema({
  _id: String,
  email: String,
  date: Date,
  question: String,
  name: String,
});
const QuestionModel = mongoose.model("Questions", QuestionSchema);

const Question = {
  insert: (object) => {
    object._id = Random.id();
    const instance = new QuestionModel(object);
    return new Promise((resolve, reject) => {
      instance.save((err, product) => {
        if (err) {
          reject(err);
        } else {
          resolve(product);
        }
      });
    });
  },
};

module.exports = {
  Email,
  Question,
  Quote,
};
