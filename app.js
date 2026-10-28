'use strict';

const CLAVE = 'medicamentos';

const form = document.getElementById('form');
const lista = document.getElementById('lista');
const vacio = document.getElementById('vacio');
const contador = document.getElementById('contador');
const toast = document.getElementById('toast');
const titleForm = document.getElementById('titleForm');

const save = document.getElementById('save');
const cancel = document.getElementById('cancel');

let editado = null;

/*------------Almacenamiento------------------*/
const leer = () => {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || []; }
    catch { return []; }
};

const guardar = ( datos ) => {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
};

/*------------------Validar form----------------*/
const reglas = {
    nombre( v ){
        if( !v ) return 'Ingresa el nombre del medicamento';
        if( v.length < 2 ) return 'El nombre debe tener al menos 2 caracteres';
        if( v.length > 100 ) return 'El nombre no puede superar 100 caracteres';

        return '';
    },

    principio( v ){
        if( !v ) return 'Ingresa el principio activo';
        if( v.length > 100 ) return 'No puede superar 100 caracteres';

        return '';
    },

    concentracion( v ){
        if( !v ) return 'Ingresa la concentración';
        if( v.length > 50 ) return 'No puede superar 50 caracteres';

        return '';
    },

    descripcion( v ){
        if( !v ) return 'Ingresa la presentación o descripción';
        if( v.length > 200 ) return 'No puede superar 200 caracteres';

        return '';
    },

    stock( v ){
        if( v === '' ) return 'Ingresa la cantidad disponible';
        if( !Number.isInteger(Number(v)) || Number(v) < 0 )
            return 'El stock debe ser un número entero igual o mayor que 0';

        return '';
    },

    precio( v ){
        if( v === '' ) return 'Ingresa el precio de venta';
        if( !Number.isFinite(Number(v)) || Number(v) < 0 )
            return 'El precio debe ser igual o mayor que 0';

        return '';
    },

    caducidad( v ){
        if( !v ) return 'Selecciona la fecha de caducidad';

        return '';
    }
};

function validarCampo( input ){
    const valor = input.value.trim();
    const msj = reglas[input.name](valor);
    document.getElementById('err-' + input.name).textContent = msj;

    input.classList.toggle('invalido', !!msj);
    input.classList.toggle('valido', !msj);
    input.setAttribute('aria-invalid', msj ? 'true' : 'false');

    return !msj;
}

form.querySelectorAll('input').forEach( input => {
    input.addEventListener('blur', () => validarCampo(input));
    input.addEventListener('input', () => {
        if( input.classList.contains('invalido') )
            validarCampo(input);
    });
});

/*------------Guardar / editar / eliminar-----------*/
form.addEventListener('submit', (e) => {
    e.preventDefault(); //Detiene el envío del formulario
    const cajas = [...form.querySelectorAll('input')];
    const todoOk = cajas.map(validarCampo).every(Boolean);

    if( !todoOk ){
        cajas.find(i => i.classList.contains('invalido') ).focus();
        return;
    }

    const medicamento = {
        nombre : form.nombre.value.trim(),
        principio : form.principio.value.trim(),
        concentracion : form.concentracion.value.trim(),
        descripcion : form.descripcion.value.trim(),
        stock : Number(form.stock.value),
        precio : Number(form.precio.value),
        caducidad : form.caducidad.value
    };

    let datos = leer();
    let mensaje;

    if( editado !== null ){
        datos[editado] = medicamento;
        mensaje = 'Medicamento actualizado';
    } else {
        datos.push( medicamento );
        mensaje = 'Medicamento guardado';
    }

    guardar(datos);
    console.log(mensaje);
    mostrarMensaje(mensaje);

    render();
    limpiarFormulario();
});

function limpiarFormulario(){
    form.reset();

    form.querySelectorAll('input').forEach( input => {
        input.classList.remove('invalido', 'valido');
        input.removeAttribute('aria-invalid');

        document.getElementById('err-' + input.name).textContent = '';
    });

    editado = null;
    save.textContent = 'Guardar';
    titleForm.textContent = 'Nuevo medicamento';
}

cancel.addEventListener('click', () => {
    limpiarFormulario();
});

/*------------Notificaciones------------------*/
let temporizador;

function mostrarMensaje(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');

    clearTimeout(temporizador);

    temporizador = setTimeout(() => toast.classList.remove('visible'), 4000);
}

/*------------------Mostrar medicamentos----------------*/
function esc( t ) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
}

function render() {
    const datos = leer();
    contador.textContent = datos.length;
    vacio.hidden = datos.length > 0;

    lista.innerHTML = datos.map((e, i) => `
        <li>
            <strong>${esc(e.nombre)}</strong>
            <p>Principio activo: ${esc(e.principio)}</p>
            <p>Concentración: ${esc(e.concentracion)}</p>
            <p>Presentación: ${esc(e.descripcion)}</p>
            <p>Stock: ${esc(e.stock)}</p>
            <p>Precio de venta: $${Number(e.precio).toFixed(2)}</p>
            <p>Caducidad: ${esc(e.caducidad)}</p>
            <button type="button" data-accion="editar" data-indice="${i}">Editar</button>
            <button type="button" data-accion="eliminar" data-indice="${i}">Eliminar</button>
        </li>
    `).join('');
}

lista.addEventListener('click', (e) => {
    const boton = e.target.closest('button[data-accion]');

    if( !boton ) return;

    const indice = Number(boton.dataset.indice);
    let datos = leer();

    if( boton.dataset.accion === 'editar' ){
        const medicamento = datos[indice];

        if( !medicamento ) return;

        form.nombre.value = medicamento.nombre;
        form.principio.value = medicamento.principio;
        form.concentracion.value = medicamento.concentracion;
        form.descripcion.value = medicamento.descripcion;
        form.stock.value = medicamento.stock;
        form.precio.value = medicamento.precio;
        form.caducidad.value = medicamento.caducidad;

        editado = indice;
        save.textContent = 'Actualizar';
        titleForm.textContent = 'Editar medicamento';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if( boton.dataset.accion === 'eliminar' ){
        datos.splice(indice, 1);
        guardar(datos);

        console.log('Medicamento eliminado');
        mostrarMensaje('Medicamento eliminado');

        if( editado === indice ){
            limpiarFormulario();
        } else if( editado !== null && editado > indice ){
            editado--;
        }

        render();
    }
});

render();

/*------SW.JS-----*/
if( 'serviceWorker' in navigator ) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then( res => console.log('service worker registered'))
            .catch( err => console.log('service worker not registered', err));
    });
}