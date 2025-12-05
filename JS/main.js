// Aquí voy a guardar a los usuarios en memoria mientras la página esté abierta
let usuarios = [];

/*
   Explicación sencilla de las expresiones regulares:

   regexNombre: solo permite letras (mayúsculas, minúsculas) y espacios.
   regexEmail: revisa que tenga texto + @ + texto + . + algo (ej: .com, .es).
   regexPass: obliga a que la contraseña tenga:
       - una letra minúscula
       - una letra mayúscula
       - un número
       - un símbolo
       - mínimo 6 caracteres
   regexMovil: solo números, entre 7 y 12 dígitos.
*/
const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const regexMovil = /^[0-9]{7,12}$/;

// Esta función cambia de "pantalla" (registro, login, recuperar, bienvenida)
function mostrarSeccion(idSeccion) {
    let secciones = document.querySelectorAll('.seccion');
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('activa');
    }
    document.getElementById(idSeccion).classList.add('activa');

    // Aquí borro los mensajes para que no queden viejos
    document.getElementById('errorRegistro').innerText = "";
    document.getElementById('errorLogin').innerText = "";
    document.getElementById('errorRecuperar').innerText = "";
    document.getElementById('exitoRecuperar').innerText = "";
}

// Esta función sirve para mostrar / ocultar la contraseña
function togglePassword(idInput) {
    let input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// ----------------- REGISTRO -----------------
function registrarUsuario() {
    let nombre = document.getElementById('regNombre').value;
    let email = document.getElementById('regEmail').value;
    let movil = document.getElementById('regMovil').value;
    let pass = document.getElementById('regPass').value;
    let errorMsg = document.getElementById('errorRegistro');

    // Aquí reviso que los datos cumplan las reglas de arriba (regex)
    if (!regexNombre.test(nombre)) {
        errorMsg.innerText = "Nombre inválido (solo letras y espacios).";
        return;
    }
    if (!regexEmail.test(email)) {
        errorMsg.innerText = "Correo inválido.";
        return;
    }
    if (!regexMovil.test(movil)) {
        errorMsg.innerText = "Móvil inválido (7 a 12 números).";
        return;
    }
    if (!regexPass.test(pass)) {
        errorMsg.innerText = "Contraseña insegura: revisa los requisitos.";
        return;
    }

    // Aquí reviso que el correo no esté repetido
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            errorMsg.innerText = "El correo ya está registrado.";
            return;
        }
    }

    /*
       Creo un "usuario" como un objeto simple con estos datos.
       intentosFallidos: cuenta cuántas veces se equivocó al entrar.
       bloqueado: indica si ya se bloqueó por 3 intentos fallidos.
    */
    let nuevoUsuario = {
        nombre: nombre,
        email: email,
        movil: movil,
        pass: pass,
        intentosFallidos: 0,
        bloqueado: false
    };

    // Guardo el nuevo usuario en el arreglo
    usuarios.push(nuevoUsuario);

    alert("Registro exitoso. Ahora inicia sesión.");

    // Limpio los campos después de registrar
    document.getElementById('regNombre').value = "";
    document.getElementById('regEmail').value = "";
    document.getElementById('regMovil').value = "";
    document.getElementById('regPass').value = "";

    // Me voy a la pantalla de login
    mostrarSeccion('sec-login');
}

// ----------------- LOGIN (INICIAR SESIÓN) -----------------
function iniciarSesion() {
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    let errorMsg = document.getElementById('errorLogin');
    let usuarioEncontrado = null;

// Aquí busco el usuario en el arreglo por su correo
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    /*
       Explicación de cómo funciona el bloqueo y la validación:

       1. Primero veo si el usuario existe.
       2. Si no existe, muestro un mensaje invitando a registrarse.
       3. Si existe, reviso si ya está bloqueado.
       4. Si no está bloqueado, comparo la contraseña.
       5. Si la contraseña está mal, sumo 1 al contador de intentos.
       6. Si llega a 3 intentos, marco la cuenta como bloqueada.
    */

    // Caso: el correo no está registrado
    if (!usuarioEncontrado) {
        errorMsg.innerText = "Este correo no está registrado. Por favor, crea una cuenta nueva en la opción 'Crear cuenta nueva'.";
        return;
    }

    // Caso: el usuario existe pero ya está bloqueado
    if (usuarioEncontrado.bloqueado) {
        errorMsg.innerText = "Cuenta bloqueada por intentos fallidos.";
        document.getElementById('linkRecuperar').style.display = 'block';
        return;
    }

    // Aquí reviso si la contraseña es correcta
    if (usuarioEncontrado.pass === pass) {
        // Como entró bien, reinicio los intentos
        usuarioEncontrado.intentosFallidos = 0;
        document.getElementById('tituloBienvenida').innerText =
            "Bienvenido al sistema, " + usuarioEncontrado.nombre;
        mostrarSeccion('sec-bienvenida');
    } else {
        // Contraseña incorrecta -> sumo un intento fallido
        usuarioEncontrado.intentosFallidos++;

        // Si ya van 3 o más intentos, bloqueo la cuenta
        if (usuarioEncontrado.intentosFallidos >= 3) {
            usuarioEncontrado.bloqueado = true;
            errorMsg.innerText = "Cuenta bloqueada por intentos fallidos.";
            document.getElementById('linkRecuperar').style.display = 'block';
        } else {
            // Mensaje normal de error con el número de intento
            errorMsg.innerText = "Usuario o contraseña incorrectos. Intento " +
                usuarioEncontrado.intentosFallidos + " de 3.";
        }
    }
}

// ----------------- RECUPERAR / CAMBIAR CONTRASEÑA -----------------
function actualizarPassword() {
    let email = document.getElementById('recEmail').value;
    let nuevaPass = document.getElementById('recPassNew').value;
    let errorMsg = document.getElementById('errorRecuperar');
    let exitoMsg = document.getElementById('exitoRecuperar');
    let usuarioEncontrado = null;

    // Busco el usuario por correo
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    if (!usuarioEncontrado) {
        errorMsg.innerText = "El correo no existe en nuestros registros.";
        return;
    }

    // Revisar que la nueva contraseña también cumpla la regla (regexPass)
    if (!regexPass.test(nuevaPass)) {
        errorMsg.innerText = "La nueva contraseña no cumple los requisitos.";
        return;
    }

    /*
       Aquí actualizo la contraseña olvidada:
       - cambio la propiedad pass del usuario
       - desbloqueo la cuenta (bloqueado = false)
       - pongo los intentos en 0 otra vez
    */
    usuarioEncontrado.pass = nuevaPass;
    usuarioEncontrado.bloqueado = false;
    usuarioEncontrado.intentosFallidos = 0;

    errorMsg.innerText = "";
    exitoMsg.innerText = "Contraseña actualizada. Ahora puede iniciar sesión.";
    document.getElementById('recPassNew').value = "";
}

// Esta función solo limpia el login y vuelve a la pantalla de inicio de sesión
function cerrarSesion() {
    document.getElementById('loginEmail').value = "";
    document.getElementById('loginPass').value = "";
    mostrarSeccion('sec-login');
               }
