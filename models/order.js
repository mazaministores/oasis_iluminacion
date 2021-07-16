const { Schema, model } = require('mongoose')

const orderSchema = new Schema({
    numeroPedido: Number,
    nombre: String,
    telefono: Number,
    tipo: String,
    direccion: String,
    casa: String,
    localidad: String,
    metodoPago: String,
    pedido: Array,
    precioDelivery: Number,
    subtotal: Number,
    total: Number,
    date: Date,
    confirmacion: Boolean
})

orderSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject._v
    }
})

const Order = model('Order', orderSchema)

module.exports = Order


