import { createContext, useEffect, useReducer } from "react";
import { useAlerta } from "../../../ControlesGlobales/Alertas/useAlerta";
import { useCargandoInformacion } from "../../../ControlesGlobales/CargandoInformacion/useCargandoInformacion";
import { useNotas } from "../../../ControlesGlobales/Notas/useNotas";
import { obtenerDatos, obtenerDatosDelLocalStorage } from "../../../FuncionesGlobales";
import { EstadoInicialInicio } from "../Modelos/InicioModel";
import { inicioReducer } from "./inicioReducer";
import { useControlGeneral } from "../../../ControlesGlobales/ControlGeneral/useControlGeneral";

export const inicioContexto = createContext(null)

export function InicioProveedor({ children }) {

    // TODOS LOS HOOKS NECESARIOS PARA PODER UTILIZAR LOS COMPONENTES GLOBALES
    const { dispatch: dispatchAlerta } = useAlerta();
    const { dispatch: dispatchCargandoInformacion } = useCargandoInformacion();
    const { state: stateNotas, dispatch: dispatchNotas } = useNotas();
    const { state: stateControlGeneral, dispatch: dispatchControlGeneral } = useControlGeneral();

    const [state, dispatch] = useReducer(inicioReducer, EstadoInicialInicio);

    const cargarCartasPorEstado = () => {

        const datosUsuarioLogueado = obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE_PERFIL_USUARIO);
        const usuarioLogueado = datosUsuarioLogueado !== null;

        let estados = [];
        if (usuarioLogueado) {
            switch (datosUsuarioLogueado.posicion_id) {
                case 1: // 'Administrador':
                    estados = [
                        'Nueva',
                        'Pendiente',
                        'Aprobada',
                        'Rechazada',
                        'Entregada'
                    ]
                    break;
                case 2: // 'Director'
                    estados = [
                        'Pendiente',
                    ]
                    break;
                case 3: // 'Gerente Area'
                    estados = [
                        'Pendiente',
                    ]
                    break;
                case 4: // 'Despacho'
                    estados = [
                        'Aprobada',
                    ]
                    break;
                case 5: // 'Solicitante'
                    estados = [
                        'Nueva',
                        'Rechazada',
                        'Entregada',
                        'Aprobada'
                    ]
                    break;
                default:
                    estados = [];
                    break;
            }
        }

        return estados;
    }

    const cargarActividades = async () => {

        dispatch({ type: 'limpiarContadoresActividades' })
        dispatchCargandoInformacion({ type: 'mostrarCargandoInformacion' })
        const { account } = obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE)
        const usuarioDestino = account.username;
        const cartasActividad = cargarCartasPorEstado() ?? [];
        dispatch({ type: 'obtenerNombreUsuario', payload: { nombre: account.name } })

        let arrEstadosSolicitudes = [];
        await obtenerDatos('EstadoSolicitud', null)
            .then((res) => {
                arrEstadosSolicitudes = res.data.filter(el => cartasActividad.includes(el.descripcion)) ?? [];
            }).catch(() => {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, al intentar cargar Estados de solicitudes.', tipo: 'warning' } });
            });

        // console.log('arrEstadosSolicitudes =>', arrEstadosSolicitudes)

        for (const estadoSolicitud of arrEstadosSolicitudes) {
            const baseRuta = import.meta.env.VITE_APP_BELLON_SOLICITUDES;
            try {
                const res = await obtenerDatos('Solicitud/Cantidad?estadoSolicitudId=' + estadoSolicitud.id_estado_solicitud, null);
                dispatch({
                    type: 'llenarContadoresActividades',
                    payload: { titulo: `${estadoSolicitud.descripcion}s`, cantidad: res.data, ruta: baseRuta + `?estado_solicitud_id=${estadoSolicitud.id_estado_solicitud}`, funcion: () => { return null; } }
                });
            } catch (error) {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: `Error, al intentar cargar ${estadoSolicitud.id_estado_solicitud}.`, tipo: 'warning' } });
            }
        }

        if (stateControlGeneral) {

            const mostrarCardConsumosInternos = stateControlGeneral.perfilUsuario.posicion_id;
            const posiciones = [import.meta.env.VITE_APP_POSICION_ADMINISTRADOR, import.meta.env.VITE_APP_POSICION_DIRECTOR, import.meta.env.VITE_APP_POSICION_GERENTE_AREA];
            const validarPosiciones = posiciones.includes(mostrarCardConsumosInternos.toString());

            if (validarPosiciones) {
                await obtenerDatos(`ConsumoInterno/Cantidad`, null)
                    .then((res) => {
                        const baseRuta = import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONSUMOS_INTERNOS;
                        dispatch({
                            type: 'llenarContadoresActividades',
                            payload: { titulo: 'Consumos Internos', cantidad: res.data, ruta: baseRuta, funcion: () => { return null; } }
                        })
                    }).catch(() => {
                        dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, al intentar cargar la cantidad consumos internos.', tipo: 'warning' } })
                    })
            }

        }

        await obtenerDatos(`Notas/Cantidad?usuarioDestino=${usuarioDestino}`, '')
            .then((res) => {
                dispatch({ type: 'llenarContadoresActividades', payload: { titulo: 'Notas Actuales', cantidad: res.data, ruta: '', funcion: () => dispatchNotas({ type: 'mostrarNotas', payload: { mostrar: true } }) } })
            }).catch(() => {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, al intentar cargar la cantidad de notas.', tipo: 'warning' } })
            })

        await obtenerDatos(`Notas?usuarioDestino=${usuarioDestino}`, '')
            .then((res) => {
                let json = []
                if (res.status === 200) {
                    json = res.data
                }
                dispatch({ type: 'llenarNotas', payload: { notas: json } })
            }).catch(() => {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, al intentar cargar notas.', tipo: 'warning' } })
            }).finally(() => {
                dispatchCargandoInformacion({ type: 'limpiarCargandoInformacion' })
            })
    }

    useEffect(() => {
        if (stateControlGeneral.perfilUsuario) {
            cargarActividades();
        }
    }, [stateControlGeneral.perfilUsuario])

    useEffect(() => {
        const validarCargaNotas = state.actividades.find(actividad => actividad.titulo === 'Notas Actuales');
        if (validarCargaNotas) {
            if (stateNotas.notas.length !== validarCargaNotas.cantidad) {
                cargarActividades();
            }
        }
    }, [stateNotas.notas])

    return (
        <inicioContexto.Provider value={{ state, dispatch }}>
            {children}
        </inicioContexto.Provider>
    )

}