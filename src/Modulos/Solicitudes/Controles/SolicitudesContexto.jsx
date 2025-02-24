import { createContext, useEffect, useReducer, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useAlerta } from "../../../ControlesGlobales/Alertas/useAlerta";
import { useCargandoInformacion } from "../../../ControlesGlobales/CargandoInformacion/useCargandoInformacion";
import { useModalConfirmacion } from "../../../ControlesGlobales/ModalConfirmacion/useModalConfirmacion";
import { formatoMoneda, obtenerDatos, obtenerDatosConId, obtenerFechaYHoraActual, obtenerRutaUrlActual } from "../../../FuncionesGlobales";
import { EstadoInicialSolicitudes } from "../Modelos/EstadoInicialSolicitudes";
import { solicitudesReducer } from "./solicitudesReducer";

export const SolicitudesContexto = createContext(null)

export const SolicitudesProveedor = ({ children }) => {

    const [state, dispatch] = useReducer(solicitudesReducer, EstadoInicialSolicitudes)
    const location = useLocation(); // Obtiene la ubicación actual
    const ventana = useRef(null)
    const [locacion] = useSearchParams();
    const { dispatch: dispatchAlerta } = useAlerta();
    const { dispatch: dispatchModalConfirmacion } = useModalConfirmacion();
    const { dispatch: dispatchCargandoInformacion } = useCargandoInformacion();

    const cargarSolicitudes = async () => {

        const urlActual = obtenerRutaUrlActual();

        if (urlActual === import.meta.env.VITE_APP_BELLON_HISTORIAL_MOVIMIENTOS_SOLICITUDES) {
            try {
                const res = await obtenerDatos(`HistorialMovimientoSolicitudesCI/Agrupado`, null);
                let json = [];
                if (res.status !== 204) {
                    json = res.data;
                }
                dispatch({ type: 'llenarSolicitudes', payload: { solicitudes: json } });
                dispatch({ type: 'combinarEstadosSolicitudes' });
            } catch (err) {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando solicitudes', tipo: 'warning' } });
            }
            return;
        }

        if (urlActual === import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONSUMOS_INTERNOS) {
            try {
                const res = await obtenerDatos(`ConsumoInterno`, null);
                let json = [];
                if (res.status !== 204) {
                    json = res.data;
                }
                dispatch({ type: 'llenarSolicitudes', payload: { solicitudes: json } });
                dispatch({ type: 'combinarEstadosSolicitudes' });
            } catch (err) {
                dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando solicitudes', tipo: 'warning' } });
            }
            return;
        }

        if (locacion.get('estado_solicitud_id')) {
            // console.log('location =>', location);
            const estadoSolicitudId = locacion.get('estado_solicitud_id')
            const res = await obtenerDatos(`Solicitud/EstadoSolicitud?estadoSolicitudId=${estadoSolicitudId}`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarSolicitudes', payload: { solicitudes: json } });
            dispatch({ type: 'combinarEstadosSolicitudes' });
            return;
        }

        try {
            const res = await obtenerDatos(`Solicitud/Solicitudes`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarSolicitudes', payload: { solicitudes: json } });
            dispatch({ type: 'combinarEstadosSolicitudes' });
        } catch (err) {
            dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando solicitudes', tipo: 'warning' } });
        }

    }

    const cargarEstadosSolicitudes = async () => {
        try {
            const res = await obtenerDatos(`EstadoSolicitud`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarEstadosSolicitudes', payload: { estadosSolicitudes: json } });
        } catch (err) {
            dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando los estados de las solicitudes', tipo: 'warning' } });
        }
    }

    const cargarDepartamentos = async () => {
        try {
            const res = await obtenerDatos(`Departamento`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarDatos', payload: { propiedad: 'departamentos', valor: json } });
        } catch (err) {
            dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando los departamentos', tipo: 'warning' } });
        }
    }

    const cargarClasificaciones = async () => {
        try {
            const res = await obtenerDatos(`Clasificacion`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarDatos', payload: { propiedad: 'clasificaciones', valor: json } });
        } catch (err) {
            dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando las clasificaciones', tipo: 'warning' } });
        }
    }

    const cargarSucursales = async () => {
        try {
            const res = await obtenerDatos(`Sucursal`, null);
            let json = [];
            if (res.status !== 204) {
                json = res.data;
            }
            dispatch({ type: 'llenarDatos', payload: { propiedad: 'sucursales', valor: json } });
        } catch (err) {
            dispatchAlerta({ type: 'mostrarAlerta', payload: { mostrar: true, mensaje: 'Error, cargando las sucursales', tipo: 'warning' } });
        }
    }

    const cargarDatosIniciales = async () => {
        dispatchCargandoInformacion({ type: 'mostrarCargandoInformacion' });
        await cargarEstadosSolicitudes();
        await cargarDepartamentos();
        await cargarClasificaciones();
        await cargarSucursales();
        await cargarSolicitudes();
        dispatchCargandoInformacion({ type: 'limpiarCargandoInformacion' });
    }

    const rechazar = (id) => {
        obtenerDatosConId('',)
    }

    const recuperar = (id) => {
        // dispatchModalConfirmacion({ type: 'mostrarModalConfirmacion', payload: { mensaje: 'Esta seguro que quiere recuperar este consumo interno?', funcionEjecutar: action.payload.funcionEjecutar } })
        obtenerDatosConId('',)
    }

    const eliminarSolicitud = async (id) => {
        dispatchModalConfirmacion({ type: 'mostrarModalConfirmacion', payload: { mensaje: 'Realmente desea rechazar la operación?', funcionEjecutar: rechazar(id) } })
    }

    const recuperarSolicitudes = async (id) => {
        dispatchModalConfirmacion({ type: 'mostrarModalConfirmacion', payload: { mensaje: 'Realmente desea reabrir la solicitud?', funcionEjecutar: recuperar(id) } })
    }

    useEffect(() => {
        dispatch({ type: 'llenarSolicitudes', payload: { solicitudes: [] } });
        cargarDatosIniciales();
    }, [location]);

    const imprimirConsumosInternos = async (parametros = {}) => {

        await obtenerDatos('ConsumoInterno', parametros)
            .then((res) => {

                let lineas = []
                if (res.status !== 204) {
                    lineas = res.data;
                }

                if (ventana.current && !ventana.current.closed) {
                    ventana.current.close();
                }

                ventana.current = window.open('', '', 'fullscreen'); // Abrimos la ventana de nuevo
                let content = ``;
                content += ` <html>`;
                content += `   <head>`;
                content += `       <title>Valoracion Impuestos Aduana Liquidación de Mercancía #${parametros.id_hist_cabecera_liquidacion}</title>`;
                content += `       <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">`;
                content += `       <style>`;
                content += `           @page {`;
                content += `               size: A4;`;
                content += `               margin: 10mm;`;
                content += `           }`;
                content += `           body {`;
                content += `               font-family: Arial, sans-serif;`;
                content += `               font-size: 15px;`;
                content += `               margin: 0;`;
                content += `               padding: 0;`;
                content += `               transform: scale(1);`;
                content += `               transform-origin: top left;`; /* Asegura que el escalado se haga desde la esquina superior izquierda */
                content += `               width: 100%;`;
                content += `               height: 100%;`;
                content += `           }`;
                content += `           table {`;
                content += `               width: 100%;`;
                content += `               border-collapse: collapse;`;
                content += `           }`;
                content += `           th, td {`;
                content += `               padding: 5px 10px;`;
                content += `               border: 1px solid #ccc;`;
                content += `               white-space: nowrap;`;
                content += `           }`;
                content += `           th {`;
                content += `               background-color: #f4f4f4;`;
                content += `               white-space: nowrap;`;
                content += `           }`;
                content += `           td.text-right {`;
                content += `               text-align: right;`;
                content += `           }`;
                content += `           @media print {`;
                content += `               body {`;
                content += `                   font-size: 15px;`;
                content += `                   transform: scale(1);`;
                content += `               }`;
                content += `               table {`;
                content += `                   width: 100%;`;
                content += `               }`;
                content += `               table th {`;
                content += `                   font-size: 9px;`;
                content += `               }`;
                content += `               table td {`;
                content += `                   font-size: 9px;`;
                content += `               }`;
                content += `               p {`;
                content += `                   font-size: 12px;`;
                content += `                   margin-bottom: 5px;`;
                content += `               }`;
                content += `               .text-center {`;
                content += `                   text-align: center;`;
                content += `               }`;
                content += `               .text-left {`;
                content += `                   text-align: left;`;
                content += `               }`;
                content += `           }`;
                content += `       </style>`;
                content += `   </head>`;
                content += `   <body>`;

                content += `        <p><b><img src="../BellonLogoMinusculo.png" width="25px" height="25px" /> Bellon, S.A.S</b></p>`;
                content += `        <p><b>Consumos Internos</b></p>`;
                content += `        <p><b>Fecha:</b> ${obtenerFechaYHoraActual()}</p>`;

                content += `        <table class="table border">`;
                content += `          <thead>`;
                content += `             <tr style="background-color: #f3f2f2;">`;
                content += `                <th class="text-left"> ID </th>`
                content += `                <th class="text-left"> No Documento </th>`
                content += `                <th class="text-left"> Fecha </th>`
                content += `                <th class="text-left"> Realizado Por </th>`
                content += `                <th class="text-left"> Responsable </th>`
                content += `                <th class="text-left"> Despachador </th>`
                content += `                <th class="text-left"> Estado Solicitud </th>`
                content += `                <th class="text-left"> Clasificacion </th>`
                content += `                <th class="text-left"> Comentario </th>`
                content += `                <th class="text-left" style="padding-right: 2px;"> Total </th>`
                content += `             </tr>`;
                content += `          </thead>`;
                content += `         <tbody>`;


                if (lineas.length > 0) {

                    let sumatoriaTotal = 0;

                    lineas.map((item) => {

                        content += ` <tr>`;
                        content += `    <th class="text-left">  ${item.id_cabecera_consumo_interno}  </th>`;
                        content += `    <th class="text-left">  ${item.no_documento}                 </th>`;
                        content += `    <th class="text-left">  ${item.fecha_creado}                 </th>`;
                        content += `    <th class="text-left">  ${item.nombre_creado_por}            </th>`;
                        content += `    <th class="text-left">  ${item.usuario_responsable}          </th>`;
                        content += `    <th class="text-left">  ${item.usuario_despacho}             </th>`;
                        content += `    <th class="text-left">  ${item.id_estado_solicitud}          </th>`;
                        content += `    <th class="text-left">  ${item.clasificacion}                </th>`;
                        content += `    <th class="text-left">  ${item.comentario}                   </th>`;
                        content += `    <th class="text-left"> ${formatoMoneda(item.total, 2, '')} </th>`;
                        content += ` </tr>`;

                        sumatoriaTotal = sumatoriaTotal + item.total;
                    })

                    content += `     <tr>`;
                    content += `        <th colspan="9" class="text-left"> Totales: </th>`;
                    content += `        <th style="text-align: right;"> ${formatoMoneda(sumatoriaTotal, 2, '')}   </th>`;
                    content += `     </tr>`;

                } else {
                    content += `     <tr>`;
                    content += `        <th colspan="10" class="text-left" style="color:red; font-weight: 600"> No hay datos que mostrar </th>`;
                    content += `     </tr>`;
                }

                content += `        </tbody>`;
                content += `      </table>`;
                content += `   </body>`;
                content += ` </html>`;

                ventana.current.document.write(content);
                ventana.current.document.close();
                ventana.current.print();
            }).catch((err) => {
                console.log("Err =>", err);
            })
    }

    return (
        <SolicitudesContexto.Provider value={{ state, dispatch, eliminarSolicitud, recuperarSolicitudes, imprimirConsumosInternos }}>
            {children}
        </SolicitudesContexto.Provider>
    )
} 