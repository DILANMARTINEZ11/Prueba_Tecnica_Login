const cons = require('consolidate');
const { coerce } = require('debug');
var express = require('express');
var router = express.Router();

// Inicializacion de la base datos 
const admin = require('firebase-admin');
const serviceAccount = require('../login-160f1-firebase-adminsdk-vzb39-84c406a22b.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
// Fin Inicializacion

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Bienvenidos' });

});

// IR AL FORMULARIO DE CREACION DE USUARIO
router.get('/add', function (req, res, next) {
  res.render('add');

});

//PETICION GET CON LOS DATOS DEL ID DEL USUARIO
router.get('/Usuarios/:id', function (req, res, next) {
 var busqueda = req.params.id;
 db.collection("usuarios").doc(busqueda).get().then(doc =>{
   if (doc.exists) {
     res.send(doc.data());  
   } else {
     res.send("ID DE USUARIO NO EXISTE")
   }
 })

});

//PETICION DELETE PARA ELIMINAR UN ID
router.delete('/Usuarios/delete/:id', function (req, res, next) {
  var busqueda = req.params.id;
  db.collection("usuarios").doc(busqueda).delete().then(() =>{
    res.redirect('/Usuarios')
  }).catch(error => {
    res.send("Error",error)
  });

 
 
 });

// PETICION POST DEL LOGIN
router.post('/login', function (req, res, next) {
  var correo = req.body.txtcorreo;
  var contraseña = req.body.txtcontraseña;
  console.log(correo, contraseña)
  db.collection("usuarios").where("Correo", "==", correo).where("Contraseña", "==", contraseña).get().then(doc => {
    if (doc.empty) {
      res.send('Usuario no existe')
    } else if (!doc.empty) {
      res.render('usuarios', { mensaje: "Sesión Iniciada" })
    }
  })
});

// PETICION GET PARA LISTAR USUARIOS
router.get('/Usuarios', function (req, res, next) {
  let datosUser = [];
  var i = 0;
  db.collection("usuarios").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      datosUser[i] =
      {
        nombre: doc.data().Nombre,
        numerotel: doc.data().NumeroTel,
        correo: doc.data().Correo

      }
      i++;

    })

    res.render('list', { datos: JSON.stringify(datosUser) });
  }).catch(Error => { console.log("Error al Listar") });

});





// PETICION POST DE CREACION DE USUARIO
router.post('/crear-usuario', function (req, res, next) {
  var id = req.body.iduser;
  var nombre = req.body.nombre;
  var correo = req.body.correo;
  var telefono = req.body.telefono;
  var contraseña = req.body.contraseña;
  var confirmacion = req.body.confirmacion;
  if (contraseña == confirmacion) {
    db.collection("usuarios").doc(id).set({
      Nombre: nombre,
      Correo: correo,
      NumeroTel: telefono,
      Contraseña: contraseña
    }).then(() => {
      console.log("Usuario creado");
      res.redirect('/');
    }).catch(error => { console.log("Error al crear") })
  } else {
    console.log("Contraseñas no coinciden")
  }
});

module.exports = router;
