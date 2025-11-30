let usuarios = [];

const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const regexMovil = /^[0-9]{7,12}$/;

function mostrarSeccion(idSeccion) {
    let secciones = document.querySelectorAll('.seccion');
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('activa');
    }
    document.getElementById(idSeccion).classList.add('activa');

    document.getElementById('errorRegistro').innerText = "";
    document.getElementById('errorLogin').innerText = "";
    document.getElementById('errorRecuperar').innerText = "";
    document.getElementById('exitoRecuperar').innerText = "";
}

function togglePassword(idInput) {
    let input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

function registrarUsuario() {
    let nombre = document.getElementById('regNombre').value;
    let email = document.getElementById('regEmail').value;
    let movil = document.getElementById('regMovil').value;
    let pass = document.getElementById('regPass').value;
    let errorMsg = document.getElementById('errorRegistro');

    if (!regexNombre.test(nombre)) {
        errorMsg.innerText = "Nombre inválido (solo letras).";
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
        errorMsg.innerText = "Contraseña insegura: 1 Mayús, 1 minús, 1 núm, 1 símbolo, min 6 chars.";
        return;
    }

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            errorMsg.innerText = "El correo ya está registrado.";
            return;
        }
    }

    let nuevoUsuario = {
        nombre: nombre,
        email: email,
        movil: movil,
        pass: pass,
        intentosFallidos: 0,
        bloqueado: false
    };

    usuarios.push(nuevoUsuario);

    alert("Registro exitoso. Ahora inicia sesión.");
    
    document.getElementById('regNombre').value = "";
    document.getElementById('regEmail').value = "";
    document.getElementById('regMovil').value = "";
    document.getElementById('regPass').value = "";
    mostrarSeccion('sec-login');
}

function iniciarSesion() {
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    let errorMsg = document.getElementById('errorLogin');
    let usuarioEncontrado = null;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    if (usuarioEncontrado) {
        if (usuarioEncontrado.bloqueado) {
            errorMsg.innerText = "Cuenta bloqueada por intentos fallidos.";
            document.getElementById('linkRecuperar').style.display = 'block';
            return;
        }

        if (usuarioEncontrado.pass === pass) {
            usuarioEncontrado.intentosFallidos = 0;
            document.getElementById('tituloBienvenida').innerText = "Bienvenido al sistema, " + usuarioEncontrado.nombre;
            mostrarSeccion('sec-bienvenida');
        } else {
            usuarioEncontrado.intentosFallidos++;
            
            if (usuarioEncontrado.intentosFallidos >= 3) {
                usuarioEncontrado.bloqueado = true;
                errorMsg.innerText = "Cuenta bloqueada por intentos fallidos.";
                document.getElementById('linkRecuperar').style.display = 'block';
            } else {
                errorMsg.innerText = "Usuario o contraseña incorrectos. Intento " + usuarioEncontrado.intentosFallidos + " de 3.";
            }
        }
    } else {
        errorMsg.innerText = "Usuario o contraseña incorrectos.";
    }
}

function actualizarPassword() {
    let email = document.getElementById('recEmail').value;
    let nuevaPass = document.getElementById('recPassNew').value;
    let errorMsg = document.getElementById('errorRecuperar');
    let exitoMsg = document.getElementById('exitoRecuperar');
    let usuarioEncontrado = null;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    if (usuarioEncontrado) {
        if (!regexPass.test(nuevaPass)) {
            errorMsg.innerText = "La nueva contraseña no cumple los requisitos.";
            return;
        }

        usuarioEncontrado.pass = nuevaPass;
        usuarioEncontrado.bloqueado = false;
        usuarioEncontrado.intentosFallidos = 0;

        errorMsg.innerText = "";
        exitoMsg.innerText = "Contraseña actualizada. Ahora puede iniciar sesión.";
        document.getElementById('recPassNew').value = "";
    } else {
        errorMsg.innerText = "El correo no existe en nuestros registros.";
    }
}

function cerrarSesion() {
    document.getElementById('loginEmail').value = "";
    document.getElementById('loginPass').value = "";
    mostrarSeccion('sec-login');
}

