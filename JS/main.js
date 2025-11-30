// Base de datos local (arreglo de objetos)
let usuarios = [];

/* --- PUNTO B: EXPLICACIÓN DE EXPRESIONES REGULARES ---
   1. regexNombre: Solo permite letras (mayúsculas/minúsculas) y espacios.
   2. regexEmail: Valida formato estándar (texto + @ + texto + . + extensión).
   3. regexPass: Contraseña segura obligatoria:
      - (?=.*[a-z]): Al menos una minúscula
      - (?=.*[A-Z]): Al menos una mayúscula
      - (?=.*\d): Al menos un número
      - (?=.*[\W_]): Al menos un símbolo
      - .{6,}: Mínimo 6 caracteres de longitud
   4. regexMovil: Solo números, entre 7 y 12 dígitos.
*/
const regexNombre = /^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/;
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
const regexMovil = /^[0-9]{7,12}$/;

// Función auxiliar para navegación
function mostrarSeccion(idSeccion) {
    let secciones = document.querySelectorAll('.seccion');
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove('activa');
    }
    document.getElementById(idSeccion).classList.add('activa');

    // Limpiar mensajes
    document.getElementById('errorRegistro').innerText = "";
    document.getElementById('errorLogin').innerText = "";
    document.getElementById('errorRecuperar').innerText = "";
    document.getElementById('exitoRecuperar').innerText = "";
}

// Función auxiliar para ver contraseña
function togglePassword(idInput) {
    let input = document.getElementById(idInput);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// --- MÓDULO REGISTRO ---
function registrarUsuario() {
    let nombre = document.getElementById('regNombre').value;
    let email = document.getElementById('regEmail').value;
    let movil = document.getElementById('regMovil').value;
    let pass = document.getElementById('regPass').value;
    let errorMsg = document.getElementById('errorRegistro');

    // Validación con REGEX (Punto B: Validación de entrada)
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
        errorMsg.innerText = "Contraseña insegura: Requisitos no cumplidos.";
        return;
    }

    // Verificar duplicados
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            errorMsg.innerText = "El correo ya está registrado.";
            return;
        }
    }

    /* Creación del Objeto Usuario con propiedades para bloqueo
       intentosFallidos: contador de errores
       bloqueado: estado de la cuenta
    */
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
    
    // Limpiar formulario
    document.getElementById('regNombre').value = "";
    document.getElementById('regEmail').value = "";
    document.getElementById('regMovil').value = "";
    document.getElementById('regPass').value = "";
    mostrarSeccion('sec-login');
}

// --- MÓDULO LOGIN Y PUNTO B: MANEJO DEL BLOQUEO ---
function iniciarSesion() {
    let email = document.getElementById('loginEmail').value;
    let pass = document.getElementById('loginPass').value;
    let errorMsg = document.getElementById('errorLogin');
    let usuarioEncontrado = null;

    // Búsqueda del usuario
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            usuarioEncontrado = usuarios[i];
            break;
        }
    }

    /* PUNTO B: CÓMO SE VALIDA LA CONTRASEÑA Y EL BLOQUEO
       1. Primero verificamos si el usuario existe.
       2. Si existe, verificamos si ya está BLOQUEADO (usuarioEncontrado.bloqueado).
       3. Si no está bloqueado, comparamos la contraseña.
       4. Si la contraseña falla, incrementamos intentosFallidos.
       5. Si intentosFallidos llega a 3, bloqueamos la cuenta.
    */
    if (usuarioEncontrado) {
        // Chequeo de bloqueo previo
        if (usuarioEncontrado.bloqueado) {
            errorMsg.innerText = "Cuenta bloqueada por intentos fallidos.";
            document.getElementById('linkRecuperar').style.display = 'block';
            return;
        }

        // Validación de contraseña
        if (usuarioEncontrado.pass === pass) {
            usuarioEncontrado.intentosFallidos = 0; // Resetear intentos al entrar bien
            document.getElementById('tituloBienvenida').innerText = "Bienvenido al sistema, " + usuarioEncontrado.nombre;
            mostrarSeccion('sec-bienvenida');
        } else {
            // Contraseña incorrecta -> Aumentar contador
            usuarioEncontrado.intentosFallidos++;
            
            if (usuarioEncontrado.intentosFallidos >= 3) {
                usuarioEncontrado.bloqueado = true; // ACTIVAR BLOQUEO
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

// --- MÓDULO RECUPERACIÓN Y PUNTO B: ACTUALIZACIÓN DE CONTRASEÑA ---
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
        // Validar nueva contraseña con Regex
        if (!regexPass.test(nuevaPass)) {
            errorMsg.innerText = "La nueva contraseña no cumple los requisitos.";
            return;
        }

        /* PUNTO B: CÓMO SE ACTUALIZA LA CONTRASEÑA OLVIDADA
           - Se sobrescribe la propiedad .pass del objeto.
           - Se establece .bloqueado en false (desbloquear).
           - Se reinicia el contador de intentos a 0.
        */
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


