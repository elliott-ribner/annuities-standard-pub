const express = require('express')
const exphbs = require('express-handlebars')
const { calculate } = require('./calculator')
const _ = require('lodash')
const app = express()
const { getHomeRenderObject, variations } = require('./lib/for-display')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const schemas = require('./lib/schemas')
const conf = require('./config')
const sm = require('sitemap');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: {
    ifEquals: function(arg1, arg2, options) {
      if (arg1 == arg2) {
        return options.fn(this)
      } else {
        return options.inverse(this)
      }
    }
  }
}))
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.text())
app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) {
        if (req.secure || req.headers.host === 'localhost:3000') {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});

const mongoDB = conf.mongo
mongoose.connect(mongoDB, {})
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.get('/', function (req, res) {
    res.render('home', _.extend({}, getHomeRenderObject(), {home: true} ))
})

app.get('/annuity-quote', async (req, res) => {
  try {
    const params = req.query
    const gender = params.gender === 'male' ? 1 : 2
    const joint = params['second-age'] && params['second-gender'] ? 3 : 1
    const secondGender = params['second-gender'] === 'male' ? 1 : 2
    const paramMap = {P: params.principle,
        A1: params.age,
        S1: gender,
        A2: params['second-age'],
        S2: secondGender,
        D: params['start-date'],
        MFJ: joint
    }
    const quotes = variations.map((variant) => {
        let templatedDescription = _.template(variant.description)({term: variant.G})
        let monthlyPayment = calculate(_.extend({},variant, paramMap))

        return {monthlyPayment: Math.round(monthlyPayment), name: variant.name, description: templatedDescription}
    })
    const startDateToString = params['start-date'] !== '0' ? `${params['start-date']} years(s) from now`: 'Now'
    const doc = await schemas.Quote.insert({
      age: params.age,
      gender: params.gender,
      joint: params['second-age'] && params['second-gender'] ? true : false,
      secondGender: params['second-gender'],
      secondAge: params['second-age'],
      startDate: params['start-date'],
      createdAt: new Date(),
      quotes: quotes
    })
    console.log(doc)
    res.render('annuity-quote', {
        chunks: _.chunk(doc.quotes, 4),
        annuity_quote: true,
        shortCode: doc.shortCode,
        age: params.age,
        gender: params.gender,
        startDate: startDateToString,
        principle: params.principle,
        secondGender: params['second-gender'],
        secondAge: params['second-age']
    })
  } catch (e) {
    console.log(e)
    res.sendStatus(400)
  }
})

const sitemap = sm.createSitemap ({
  hostname: 'http://annuity.herokuapp.com',
  cacheTime: 600000,  // 600 sec cache period 
  urls: [
    { url: '/',  changefreq: 'daily', priority: 1.0 },
    { url: '/contact',  changefreq: 'monthly',  priority: 0.3 },
    { url: '/about', changefreq: 'monthly',  priority: 0.3  },
    { url: '/articles/annuity-basics', changefreq: 'monthly',  priority: 0.3  }, 
  ]
});

app.get('/sitemap.xml', function(req, res) {
  res.header('Content-Type', 'application/xml');
  res.send( sitemap.toString() );
});

app.get('/about', async (req,res) => {
    try {
        res.render('about', {about: true})
    } catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

app.get('/contact', async (req,res) => {
  try {
    res.render('contact', {contact: true})
  } catch (e) {
    console.log(e)
    res.sendStatus(400)
  }
})

app.get('/articles/:name', async (req,res) => {
  try {
    const { name } = req.params
    res.render(name, {contact: true})
  } catch (e) {
    console.log(e)
    res.sendStatus(400)
  }
})

app.get('/invest', async (req,res) => {
  try {
    res.render('invest')
  } catch (e) {
    console.log(e)
    res.sendStatus(400)
  }
})

app.post('/email-list', async (req,res) => {
    try {
        const {emailAddress} = req.body
        await schemas.Email.insert({email: emailAddress, date: new Date()})
        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

app.post('/question', async (req,res) => {
  try {
    const {email, name, question} = req.body
    await schemas.Question.insert({email, name, question, date: new Date()})
    res.sendStatus(200)
  } catch (e) {
    console.log(e)
    res.sendStatus(400)
  }
})

// https://www.twilio.com/docs/voice/tutorials/how-to-respond-to-incoming-phone-calls-node-js
app.post('/voice', (req, res) => {
  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'alice' }, 'Hello, we have temporarily shut down our sales operation. Sorry for any inconvenience.');

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});

app.listen(process.env.PORT || 3000)






