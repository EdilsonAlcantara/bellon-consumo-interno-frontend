import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useModalAlerta } from '../../../../ControlesGlobales/ModalAlerta/useModalAlerta';
import { useModalConfirmacion } from '../../../../ControlesGlobales/ModalConfirmacion/useModalConfirmacion';
import { obtenerDatosDelLocalStorage } from '../../../../FuncionesGlobales';
import { useFormulario } from '../Controles/useFormulario';
import { useSearchParams } from 'react-router-dom';

export default function BotonesAcciones() {

    const { state, dispatch, guardar, actualizarFormulario, cambiarEstadoSolicitud, enviar } = useFormulario();
    const [estadoSolicitud, setEstadoSolicitud] = useState(null);
    const { dispatch: dispatchModalConfirmacion } = useModalConfirmacion();
    const { dispatch: dispatchModalAlerta } = useModalAlerta();
    const [condiciones, setCondiciones] = useState({ btnNuevo: false, btnEnviar: false, btnAprobar: false, btnRechazar: false, btnEntregar: false, btnRegistrar: false });
    const [bloquearBotonesAcciones, setBloquearBotonesAcciones] = useState(state.lineas.length == 0)
    const [permisosUsuarioLogueado, setPermisosUsuarioLogueado] = useState(null);
    const [params] = useSearchParams();


    useEffect(() => {

        // SETEANDO EL ESTADO DE SOLICITUD ACTUAL
        const estadoSolicitud = state.formulario.id_estado_solicitud ?? '';
        setEstadoSolicitud(estadoSolicitud.toString());

        // BUSCANDO LOS PERMISOS QUE TENGA EL USUARIO LOGUEADO
        const perfilUsuarioLogueado = obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE_PERFIL_USUARIO);
        if (perfilUsuarioLogueado) {
            setPermisosUsuarioLogueado(perfilUsuarioLogueado?.posicion);
        }

    }, [state.formulario]);

    useEffect(() => {

        // AQUI SE CONTROLAN QUE BOTONES SE VEN DEPENDIENDO EL MODULO DONDE ESTE Y LOS PERMISOS QUE TENGA LA POSICION DEL USUARIO
        if (!permisosUsuarioLogueado) {
            return;
        }

        // CONTROLANDO CONDICIONES PARA OCULTAR BOTONES DEPENDIENDO SI ESTAMOS EN MODO VISTA
        if (params.get('modo') === 'vista') {
            return;
        }

        // CONTROLANDO CONDICIONES PARA OCULTAR BOTONES DEPENDIENDO EL ESTADO DE LAS SOLICITUDES 
        const botonesCondiciones = {
            btnEnviar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_NUEVA, import.meta.env.VITE_APP_ESTADO_SOLICITUD_RECHAZADA].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.enviar_solicitud),
            btnAprobar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_PENDIENTE].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.aprobar_solicitud),
            btnRechazar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_PENDIENTE, import.meta.env.VITE_APP_ESTADO_SOLICITUD_APROBADA, import.meta.env.VITE_APP_ESTADO_SOLICITUD_ENTREGADA].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.rechazar_solicitud),
            btnEntregar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_APROBADA].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.entregar_solicitud),
            btnConfirmar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_ENTREGADA].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.confirmar_solicitud),
            btnTerminar: ([import.meta.env.VITE_APP_ESTADO_SOLICITUD_CONFIRMADA].includes(estadoSolicitud) && state.formulario.id_cabecera_solicitud !== null && permisosUsuarioLogueado.confirmar_solicitud),
        };
        setCondiciones(botonesCondiciones);

    }, [estadoSolicitud, state.formulario.id_cabecera_solicitud]); // Actualizamos cuando cambien estos valores

    const ejecutarAcciones = (accion = '') => {

        const acciones = {
            nueva: import.meta.env.VITE_APP_ESTADO_SOLICITUD_NUEVA,
            enviar: import.meta.env.VITE_APP_ESTADO_SOLICITUD_PENDIENTE,
            aprobar: import.meta.env.VITE_APP_ESTADO_SOLICITUD_APROBADA,
            rechazar: import.meta.env.VITE_APP_ESTADO_SOLICITUD_RECHAZADA,
            entregar: import.meta.env.VITE_APP_ESTADO_SOLICITUD_ENTREGADA,
            confirmar: import.meta.env.VITE_APP_ESTADO_SOLICITUD_CONFIRMADA,
            terminada: import.meta.env.VITE_APP_ESTADO_SOLICITUD_TERMINADA,
        }

        if (acciones[accion]) {
            actualizarFormulario('id_estado_solicitud', acciones[accion]);
            enviar();
        } else {
            console.error(`Acción '${accion}' no válida.`);
        }

        cambiarEstadoSolicitud(true);
    }

    const confirmarAccion = (accion) => {
        if (state.lineas.length === 0 || state.formulario.total === 0) {
            dispatchModalAlerta({ type: 'mostrarModalAlerta', payload: { mensaje: 'No hay productos disponibles para enviar, por favor verifique.', mostrar: true, tamano: 'sm' } })
            return;
        }

        if ((state.lineas.length > 0) && (state.formulario.total > state.limiteAprobacion)) {
            dispatchModalAlerta({ type: 'mostrarModalAlerta', payload: { mensaje: '<div style="font-size: 20px; font-weight: 600; text-align: center;">El total del consumo supera al limite que puede aprobar el usuario aprobador. Por favor delegue su solicitud a otra persona.</b>', mostrar: true, tamano: 'md' } })
            return;
        }
        dispatchModalConfirmacion({ type: 'mostrarModalConfirmacion', payload: { mostrar: true, mensaje: 'Desea usted realizar esta acción?', funcionEjecutar: () => ejecutarAcciones(accion) } })
    }

    useEffect(() => {
        const bloquear = state.lineas.length === 0;
        setBloquearBotonesAcciones(bloquear);
    }, [state.lineas])

    return (
        <div style={{ float: 'right' }}>
            {/* <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnNuevo} onClick={() => confirmarAccion('nueva')} className="m-1"><Icon.Plus /> {' '}  Nueva Solicitud </Button> */}
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnRechazar} onClick={() => confirmarAccion('rechazar')} className="m-1"><Icon.Ban /> {' '} Rechazar Solicitud </Button>
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnEnviar} onClick={() => confirmarAccion('enviar')} className="m-1"><Icon.CardChecklist /> {' '}   Enviar Solicitud </Button>
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnAprobar} onClick={() => confirmarAccion('aprobar')} className="m-1"><Icon.Check /> {' '} Aprobar Solicitud </Button>
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnConfirmar} onClick={() => confirmarAccion('confirmar')} className="m-1"><Icon.CheckCircleFill /> {' '}   Confirmar Solicitud </Button>
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnEntregar} onClick={() => confirmarAccion('entregar')} className="m-1"><Icon.Floppy2Fill /> {' '} Entregar </Button>
            <Button disabled={bloquearBotonesAcciones} hidden={!condiciones.btnTerminar} onClick={() => confirmarAccion('terminada')} className="m-1"><Icon.Floppy2Fill /> {' '}   Registrar </Button>
        </div>
    );
}
