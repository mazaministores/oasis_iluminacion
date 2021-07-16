'use strict'

const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const CLIENT_ID = '508966430736-r4dvoi7ir1eshacgkkts0ncorcn2ejih.apps.googleusercontent.com'
const CLIENT_SECRET = '93PFtumXz3E57rb7hPa8z3fx'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04ho88nls5GVtCgYIARAAGAQSNwF-L9IrFH9sZP5-wZkUC-CbUJQfGWuHrcyHRTbY9Oe3WbmPk3OPYBZEsc52vsH9ZpKJ0RpLuYk'

require('dotenv').config()

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })


this.sendMailOrder = (object) => {

    let ACCESSTOKE = oAuth2Client.getAccessToken()

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.MAILUSER,
            pass: process.env.MAILPASS,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: ACCESSTOKE
        }
    })

    const cart = []

    object.pedido.forEach((doc) => {
        cart.push(
            JSON.stringify(
                `<p>${doc.brand} $${doc.price} x ${doc.piece} unidad(des)</p>`
            ).replace(/['"]+/g, '')
        )
    })

    let mail_options = {
        from: 'Pabs',
        to: 'opandre123@gmail.com',
        subject: `Nueva Orden - ${object.numeroPedido}`,
        html: `
      <table border="0" cellpadding="0" style="border-radius:5px;padding:20px" cellspacing="0" width="600px" background-color="#2d3436" bgcolor="#2d3436">
         <tr height="120px">
              <td bgcolor="" width="600px">
                  <h1 style="color:#fff; text-align:center">MZMENU</h1>
                  <p style="color:#fff; text-align:center; font-size:13px">
                      <span style="color:#e84393">Referencia: ${object.numeroPedido}</span>
                  </p>
              </td>
        </tr>
        <tr style="padding:10px; color:#fff; font-size:13px; font-weight:600;" width="600px">
             <td style="width:50%;">
                <p>
                   Cliente: ${object.nombre}
                </p>
                <p>
                   Telefono: ${object.telefono}
               </p>
            </td>
         </tr>
        <tr style="padding:10px; color:#fff; font-size:13px; font-weight:600;" width="600px">
            <td>
                <p>
                   Tipo de Compra: ${object.tipo === 'recoger' ? 'Recoger Personalmente' : 'Delivery'}
                </p>
                ${object.tipo !== 'recoger' ? `
                <p>Direccion: ${object.direccion}</p>
                <p>Numero de casa: ${object.casa}</p>
                <p>Localidad: ${object.localidad}</p>
                `: ''}
                <p>Items del pedido:</p>
                <div style="margin:12px;">
                    ${cart.toString()}
                </div>  
                <p>Metodo de Pago: ${object.metodoPago}</p>
                <p>
                    Subtotal: $${object.subtotal}
                </p>
                <p>Precio delivery: $${object.precioDelivery}</p>
                <p>
                   Total: $${object.total}
                </p>
             </td>
        </tr>

        
       </table>
      `
    }
    transporter.sendMail(mail_options, (error, info) => {
        if (error) {
            console.log(error)
        } else {
            console.log('Mail send success' + info.response)
        }
    })
}

module.exports = this