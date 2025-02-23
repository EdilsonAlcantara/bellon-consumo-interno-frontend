import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AGGridTabla from '../../../ComponentesGlobales/AGGridTabla';
import { useNotas } from '../../../ControlesGlobales/Notas/useNotas';
import { formateadorDeFechaYHoraEspanol, formatoMoneda, obtenerDatosDelLocalStorage, obtenerRutaUrlActual, verDocumento } from '../../../FuncionesGlobales';
import { useSolicitudes } from '../Controles/useSolicitudes';
import { pagination, paginationPageSize, paginationPageSizeSelector, rowSelection } from '../Modelos/EstadoInicialSolicitudes';

export default function ListadoSolicitudes() {

    const { state, dispatch, eliminarSolicitud, recuperarSolicitudes } = useSolicitudes()
    const navegar = useNavigate();
    const { dispatch: dispatchNotas } = useNotas();
    const gridRef = useRef(null);
    const locacion = useLocation();
    const [ocultarBotonNuevo, setOcultarBotonNuevo] = useState(true);
    const [columnas, setColumnas] = useState([]);

    const obtenerReferenciaAgGrid = (ref) => {
        gridRef.current = ref.current;
    };

    const filtrarListado = (filtro) => {
        gridRef.current.api.setGridOption("quickFilterText", filtro);
    };

    const BadgedEstadoSolicitud = (parametros) => {
        return (
            <Badge bg="primary">{parametros.data.estado_solicitud_descripcion ?? 'N/A'}</Badge>
        )
    }

    const hacerNota = (parametros) => {
        // console.log(parametros);
        dispatchNotas({ type: "mostrarNotas", payload: { mostrar: true } });
        dispatchNotas({ type: 'mostrarFormularioNotas', payload: { mostrarFormulario: true } });
        dispatchNotas({ type: "actualizarFormulario", payload: { id: 'no_documento', value: parametros.no_documento } });
        dispatchNotas({ type: "actualizarFormulario", payload: { id: 'id_documento', value: parametros.id_cabecera_solicitud } });
    };

    const BotonesAcciones = (parametros) => {

        const estadoSolicitudId = parametros.data.id_estado_solicitud;
        const ruta = obtenerRutaUrlActual();
        let arrEstadosSolicitudes = [];
        let rutas = [];

        // MOSTRAR BOTON HISTORIAL MOVIMIENTOS SOLICITUD
        rutas = [import.meta.env.VITE_APP_BELLON_HISTORIAL_MOVIMIENTOS_SOLICITUDES];
        const mostrarBotonHistorico = rutas.includes(ruta);

        let mostrarBotonEditar = "";
        let mostrarBotonVer = "";
        let mostrarBotonNotas = "";

        // OCULTANDO BOTON NUEVO
        if (!mostrarBotonHistorico) {
            // MOSTRAR BOTON EDITAR
            arrEstadosSolicitudes = [
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_NUEVA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_RECHAZADA
            ]
            mostrarBotonEditar = arrEstadosSolicitudes.includes(estadoSolicitudId.toString());

            // MOSTRAR BOTON VER
            arrEstadosSolicitudes = [
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_NUEVA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_PENDIENTE,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_APROBADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_RECHAZADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_ENTREGADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_CONFIRMADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_TERMINADA
            ];
            mostrarBotonVer = arrEstadosSolicitudes.includes(estadoSolicitudId.toString());

            // MOSTRAR BOTON NOTAS
            arrEstadosSolicitudes = [
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_NUEVA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_PENDIENTE,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_APROBADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_RECHAZADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_ENTREGADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_CONFIRMADA,
                import.meta.env.VITE_APP_ESTADO_SOLICITUD_TERMINADA
            ];
            mostrarBotonNotas = arrEstadosSolicitudes.includes(estadoSolicitudId.toString());

        }

        return (
            <>
                {mostrarBotonEditar && (<Button title="Editar solicitud" size='sm' variant='outline-primary' style={{ marginLeft: 5 }} onClick={() => navegar(`formulario?accion=editar`, { state: parametros.data })}> <Icon.PencilFill /> </Button>)}
                {mostrarBotonVer && (<Button title="Ver solicitud" size='sm' variant='outline-primary' style={{ marginLeft: 5 }} onClick={() => navegar(`formulario?accion=ver`, { state: parametros.data })}> <Icon.EyeFill /> </Button>)}
                {mostrarBotonNotas && (<Button title="Poner nota" size='sm' variant="outline-primary" style={{ marginLeft: 5 }} onClick={() => hacerNota(parametros.data)} > {" "} <Icon.JournalBookmarkFill size={15} />{" "} </Button>)}
                {mostrarBotonHistorico && (<Button title="Mostrar historial movimientos solicitudes" size='sm' variant='outline-primary' style={{ marginLeft: 5 }} onClick={() => navegar(import.meta.env.VITE_APP_BELLON_HISTORIAL_MOVIMIENTOS_SOLICITUDES_HISTORICO, { state: parametros.data })}> <Icon.ClockHistory /> </Button>)}
            </>
        )
    }

    const hypervinculoDocumento = (e) => {
        const fila = e.data;
        const no_documento = fila.no_documento;
        let titulo = `ver solicitud ${no_documento}`
        return (
            <a href="#" title={titulo} onClick={() => verDocumento(no_documento, fila)}> {e.value}</a>
        )
    }


    useEffect(() => {

        setColumnas([
            { headerName: "ID", field: "id_cabecera_solicitud", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "No Documento", field: "no_documento", cellRenderer: hypervinculoDocumento, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Fecha", field: "fecha_creado", valueFormatter: (e) => formateadorDeFechaYHoraEspanol(e.value), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Creado Por", field: "nombre_creado_por", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Responsable", field: "usuario_responsable", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Despachador", field: "usuario_despacho", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Departamento", field: "departamento", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Estado Solicitud", field: "id_estado_solicitud", cellRenderer: BadgedEstadoSolicitud, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Clasificacion", field: "clasificacion", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Sucursal", field: "sucursal", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Total", field: "total", valueFormatter: (e) => formatoMoneda(e.value, 2), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Comentario", field: "comentario", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            { headerName: "Acciones", field: "acciones", cellRenderer: BotonesAcciones, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
        ]);

        const urlActual = obtenerRutaUrlActual();
        let rutas = [];

        // CAMBIANDO LAS COLUMNAS
        rutas = [
            import.meta.env.VITE_APP_BELLON_HISTORIAL_MOVIMIENTOS_SOLICITUDES
        ]
        if (rutas.includes(urlActual)) {
            setColumnas([
                { headerName: "ID", field: "id_cabecera_solicitud", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "No Documento", field: "no_documento", cellRenderer: hypervinculoDocumento, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Fecha", field: "id_estado_solicitud", valueGetter: (params) => { return params.data.id_estado_solicitud === 1 ? params.data.fecha_creado : params.data.fecha_modificado; }, valueFormatter: (e) => formateadorDeFechaYHoraEspanol(e.value), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Realizado Por", field: "id_estado_solicitud", valueGetter: (params) => { return params.data.id_estado_solicitud === 1 ? params.data.creado_por : params.data.modificado_por; }, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Responsable", field: "usuario_responsable", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Despachador", field: "usuario_despacho", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Estado Solicitud", field: "id_estado_solicitud", cellRenderer: BadgedEstadoSolicitud, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Clasificacion", field: "clasificacion", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Total", field: "total", valueFormatter: (e) => formatoMoneda(e.value, 2), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Comentario", field: "comentario", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Acciones", field: "acciones", cellRenderer: BotonesAcciones, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            ]);
        }

        // CAMBIANDO LAS COLUMNAS
        rutas = [
            import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONSUMOS_INTERNOS
        ]
        if (rutas.includes(urlActual)) {
            setColumnas([
                { headerName: "ID", field: "id_cabecera_consumo_interno", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "No Documento", field: "no_documento", cellRenderer: hypervinculoDocumento, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Fecha", field: "fecha_creado", valueFormatter: (e) => formateadorDeFechaYHoraEspanol(e.value), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Realizado Por", field: "nombre_creado_por", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Responsable", field: "usuario_responsable", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Despachador", field: "usuario_despacho", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Estado Solicitud", field: "id_estado_solicitud", cellRenderer: BadgedEstadoSolicitud, filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Clasificacion", field: "clasificacion", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Total", field: "total", valueFormatter: (e) => formatoMoneda(e.value, 2), filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Comentario", field: "comentario", filter: true, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
                { headerName: "Acciones", field: "acciones", cellRenderer: BotonesAcciones, flex: 1, wrapHeaderText: true, autoHeaderHeight: true, minWidth: 100 },
            ]);
        }

        // OCULTANDO BOTON NUEVO
        const urls = [
            import.meta.env.VITE_APP_BELLON_SOLICITUDES_CONSUMOS_INTERNOS,
            import.meta.env.VITE_APP_BELLON_HISTORIAL_MOVIMIENTOS_SOLICITUDES
        ];

        if (urls.includes(urlActual)) {
            setOcultarBotonNuevo(true);
            return;
        }

        const perfilUsuario = obtenerDatosDelLocalStorage(import.meta.env.VITE_APP_LOCALSTORAGE_NOMBRE_PERFIL_USUARIO);
        if (!perfilUsuario) {
            setOcultarBotonNuevo(true);
            return;
        }

        const arrPosiciones = [
            import.meta.env.VITE_APP_POSICION_ADMINISTRADOR,
            import.meta.env.VITE_APP_POSICION_SOLICITANTE
        ];

        const { posicion_id } = perfilUsuario;
        if (arrPosiciones.includes(posicion_id.toString())) {
            setOcultarBotonNuevo(false);
        }
    }, [locacion])

    return (
        <Container fluid>
            <Row>
                <Col
                    xs={{ span: 12, order: 2 }}
                    sm={{ span: 12, order: 2 }}
                    md={{ span: 6, order: 1 }}
                    xl={{ span: 5, order: 1 }}
                    className="text-start mt-2 mb-2"
                >
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon3">
                            <Icon.Search />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Filtrar..."
                            onChange={(e) => filtrarListado(e.target.value)}
                            autoComplete="off"
                        />
                    </InputGroup>
                </Col>
                <Col
                    xs={{ span: 12, order: 1 }}
                    sm={{ span: 12, order: 1 }}
                    md={{ span: 6, order: 2 }}
                    xl={{ span: 7, order: 2 }}
                    className="text-end"
                >
                    <div style={{ float: 'right' }}>
                        <Button hidden={ocultarBotonNuevo} size='md' variant='primary' className='mb-2' onClick={() => navegar('formulario', { state: null })}><Icon.Plus />Nuevo</Button>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <AGGridTabla
                        obtenerReferenciaAgGrid={obtenerReferenciaAgGrid}
                        colDefs={columnas}
                        rowData={state.listadoSolicitudes}
                        rowSelection={rowSelection}
                        pagination={pagination}
                        paginationPageSize={paginationPageSize}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                        altura={window.innerHeight - 250}
                    />
                </Col>
            </Row>
        </Container>
    )
}
