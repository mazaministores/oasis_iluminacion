process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


require('dotenv').config()
require('./mongo.js')

const { request, response, json } = require("express")
const express = require("express")
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Order = require('./models/order.js')
const Article = require('./models/article')
const ZoneD = require('./models/zoneDelivery')
const mailer = require('./templates/newOrder')
// const usersRoute = require('./controllers/users')
// const loginRoute = require('./controllers/login')
const User = require('./models/User')

const logger = require('./loggerMiddleware')
const app = express()
//test
app.use(cors())
app.use(express.json())
app.use(logger)

let orders = []

let methods = [
  {
    method: 'Pago Movil',
    data: 'Banesco ---- 04121112222 ---- V-27790321 ---- MAZAFOOD '
  },
  {
    method: "Transferencias Bancarias",
    data: "Banesco ---- 0132-3434-3434-4343-3434 ---- ANDRES MAZA ---- V-27790321 "
  },
  {
    method: "Punto de Venta",
    data: 'Te esperamos en nuestro local'
  },
  {
    method: 'Zelle',
    data: 'Usuario: usuario --- correo: correo@gmail.com'
  },
  {
    method: "Efectivo",
    data: 'Te esperamos en nuestro local'
  }
]

app.get("/", (request, response) => {
  response.send("<h4>API MENU REACTJS REDUX</h4>");
});

app.get("/api/orders", (request, response) => {
  Order.find({}).sort({ field: 'desc', numeroPedido: -1 })
    .then(orders => {
      response.json(orders)
    })
    .catch(err => {
      console.log(err)
    })
})

app.get("/api/orders/:id", (request, response, next) => {
  const id = request.params.id;
  Order.findById(id)
    .then(order => {
      if (order) {
        response.json(order);
      } else {
        response.status(404).end();
      }
    })
    .catch(err => {
      next(err)
      // console.log(err.message)
      // response.status(400).end()
    })
});

app.delete("/api/orders/:id", (request, response, next) => {
  const id = request.params.id

  Order.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))

  response.status(204).end()
})

app.put("/api/orders/:id", (request, response, next) => {
  const id = request.params.id
  const object = request.body
  Order.findByIdAndUpdate(id, { $set: { confirmacion: true } }, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(err => next(err))
})

app.post("/api/orders", (request, response) => {

  const order = request.body

  Order.find().estimatedDocumentCount().then(orderMax => {

    const newOrder = new Order({
      numeroPedido: Number(orderMax) + 1,
      nombre: order.nombre,
      telefono: Number(order.telefono),
      tipo: order.tipo,
      direccion: order.direccion,
      casa: order.casa,
      localidad: order.localidad,
      metodoPago: order.metodoPago,
      pedido: order.pedido,
      precioDelivery: order.precioDelivery,
      subtotal: Number(order.subtotal),
      total: Number(order.total),
      date: new Date(),
      confirmacion: false,
    });

    newOrder.save()
      .then((savedOrder) => {
        mailer.sendMailOrder(savedOrder)
        response.status(201).json(savedOrder)
      })
      .catch((err) => {
        console.log(err)
      })
  })

    .catch(err => {
      console.log(err)
    })

});

app.get("/api/articles", (request, response) => {
  Article.find({})
    .then((articlesReturned) => {
      response.json(articlesReturned)
    })
});

app.delete("/api/articles/:id", (request, response, next) => {
  const id = request.params.id

  Article.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))
  response.status(204).end()
})

app.post("/api/articles", (request, response) => {

  const article = request.body

  const authorization = request.get('authorization')

  let token = null

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.substring(7)
  }

  let decodedToken = false
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch { }


  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const newArticle = new Article({
    brand: article.brand,
    model: article.model,
    price: article.price,
    image: article.image,
    categorie: article.categorie,
  });


  newArticle.save()
    .then(saveArticle => {
      response.status(201).json(saveArticle)
    })
    .catch(err => {
      console.log('Error')
      console.log(err)
    })
});

app.put("/api/articles/:id", (request, response, next) => {

  const id = request.params.id
  const object = request.body

  Article.findByIdAndUpdate(id, { ...object, price: Number(object.price) }, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(err => next(err))

})

app.get("/api/methods", (request, response) => {
  response.json(methods);
});

app.get("/api/zonesDelivery", (request, response) => {
  ZoneD.find({})
    .then(returnedZones => {
      response.json(returnedZones)
    })
});

app.post("/api/zonesDelivery", (request, response) => {
  const zone = request.body

  // const ids = zonesDelivery.map((customZone) => customZone.id);
  // const maxId = Math.max(...ids)
  // id:zonesDelivery.length===0?1: maxId + 1,

  const newZone = new ZoneD({
    addres: zone.addres,
    price: parseFloat(zone.price)
  });

  newZone.save()
    .then(saveZone => {
      response.status(201).json(saveZone)
    })
    .catch(err => {
      console.log(err)
    })
});

app.delete("/api/zonesDelivery/:id", (request, response, next) => {
  const id = request.params.id

  ZoneD.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(err => next(err))
  response.status(204).end()
})

// app.use('/api/users', usersRoute)
// app.use('/api/login', loginRoute)


app.post('/api/users', async (request, response) => {
  const { body } = request
  const { username, password } = body

  const passwordHash = await bcrypt.hash(password, 10)

  const newUser = new User({
    username,
    passwordHash
  })

  const savedUser = await newUser.save()

  response.json(savedUser)
})

app.post('/api/login', async (request, response) => {

  const { body } = request
  const { username, password } = body

  const user = await User.findOne({ username })

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
  if (!(user && passwordCorrect)) {
    response.status(401).json({
      error: 'Invalid user or password'
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response.send({
    username: user.username,
    token
  })
})

app.use((request, response, next) => {
  response.status(404).end()
})

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found'
  })
})

app.use((error, request, response, next) => {

  console.error(error)

  if (error.name === 'CastError') {
    response.status(400).end
  } else {
    response.status(500).end()
  }

})


const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
